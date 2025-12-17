import { createClient } from "@/lib/supabase/client";

const SESSION_COOKIE_KEY = "session_cookie";
const LEGACY_SESSION_COOKIE_KEY = "affiliation_pre_auth_user_id";
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function newUuid(): string {
    const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

    // Modern browsers
    if (c?.randomUUID) {
        return c.randomUUID();
    }

    // Fallback (RFC4122-ish v4)
    const bytes = new Uint8Array(16);
    if (c?.getRandomValues) {
        c.getRandomValues(bytes);
    } else {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex
        .slice(8, 10)
        .join("")}-${hex.slice(10, 16).join("")}`;
}

function getOrCreateSessionCookieId(): string | null {
    if (typeof window === "undefined") return null;

    try {
        const existing = window.localStorage.getItem(SESSION_COOKIE_KEY);
        if (existing && UUID_RE.test(existing.trim())) return existing.trim();
        if (existing && existing.trim()) {
            // If a previous version stored non-UUID data under this key (e.g., JSON session), reset it.
            window.localStorage.removeItem(SESSION_COOKIE_KEY);
        }

        // Migrate legacy key -> new key (best-effort).
        const legacy = window.localStorage.getItem(LEGACY_SESSION_COOKIE_KEY);
        if (legacy && UUID_RE.test(legacy.trim())) {
            window.localStorage.setItem(SESSION_COOKIE_KEY, legacy.trim());
            window.localStorage.removeItem(LEGACY_SESSION_COOKIE_KEY);
            return legacy.trim();
        }

        const id = newUuid();
        window.localStorage.setItem(SESSION_COOKIE_KEY, id);
        return id;
    } catch {
        return null;
    }
}

export const trackUserClick = async (tag: string) => {
    try {
        const supabase = createClient();

        // 1. Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error("Error getting user for tracking:", userError);
            return;
        }

        // Not logged in (no session) – nothing to write to auth.users metadata.
        if (!user) return;

        // 2. Get existing metadata
        const metadata = user.user_metadata || {};
        const clickedList = Array.isArray(metadata.clicked) ? metadata.clicked : [];

        // 3. Append new tag with timestamp
        const newClick = {
            button: tag,
            timestamp: new Date().toISOString()
        };
        const updatedList = [...clickedList, newClick];

        // 4. Update user
        const { error: updateError } = await supabase.auth.updateUser({
            data: { clicked: updatedList }
        });

        if (updateError) {
            console.error("Error updating user metadata:", updateError);
        }

    } catch (err) {
        console.error("Unexpected error in trackUserClick:", err);
    }
};

type LoginMethod = "email" | "google" | "apple" | "facebook";

async function ensureAuthSession() {
    const supabase = createClient();

    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error("[affiliation] getSession failed:", sessionError);
    }

    if (!session?.user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.error("[affiliation] signInAnonymously failed:", error);
        }
    }

    return { supabase };
}

async function upsertAffiliation(fields: Record<string, unknown>) {
    const sessionCookieId = getOrCreateSessionCookieId();
    if (!sessionCookieId) return;

    const { supabase } = await ensureAuthSession();

    const payload = {
        user_id: sessionCookieId,
        ...fields,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from("affiliation")
        .upsert(payload, { onConflict: "user_id" });

    if (error) {
        // If the DB enforces NOT NULL on `url`, the initial insert may fail.
        // Retry once including the current URL (safe: this path only happens on insert).
        const currentUrl = typeof window !== "undefined" ? window.location.href : null;
        const isUrlNotNullViolation =
            error.code === "23502" &&
            typeof error.message === "string" &&
            error.message.toLowerCase().includes("url");

        if (isUrlNotNullViolation && currentUrl) {
            const { error: retryError } = await supabase
                .from("affiliation")
                // If a row was created concurrently, do NOT update it.
                .upsert({ ...payload, url: currentUrl }, { onConflict: "user_id", ignoreDuplicates: true });

            if (retryError) {
                console.error("[affiliation] upsert failed (retry with url):", retryError);
            }

            return;
        }

        console.error("[affiliation] upsert failed:", error);
    }
}

export async function trackStartFreeTrialClick(buttonNumber: number) {
    const now = new Date().toISOString();
    await upsertAffiliation({
        start_free_trial_button: buttonNumber,
        start_free_trial_at: now,
    });
}

export async function trackLoginWith(method: LoginMethod) {
    const now = new Date().toISOString();
    await upsertAffiliation({
        log_in_with: method,
        log_in_at: now,
    });
}

export async function trackTrialClick() {
    await upsertAffiliation({
        trial_at: new Date().toISOString(),
    });
}

export async function trackPaymentMethodClick(method: string) {
    const now = new Date().toISOString();
    await upsertAffiliation({
        payment_method: method,
        payment_at: now,
    });
}

export async function trackWaitlistChoice(choice: boolean) {
    await upsertAffiliation({
        waitlist: choice,
    });
}
