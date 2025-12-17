import { createClient, createTrackingClient } from "@/lib/supabase/client";
import type { SupabaseClient, User } from "@supabase/supabase-js";

function isAnonymousUser(user: User | null | undefined): boolean {
    return Boolean((user as any)?.is_anonymous);
}

async function tryMigrateLegacySessionCookie(tracking: SupabaseClient) {
    if (typeof window === "undefined") return;

    // Older versions stored a custom JSON (or raw uuid) under `session_cookie`.
    // The tracking client expects Supabase's native session shape. Best-effort migrate.
    const raw = window.localStorage.getItem("session_cookie");
    if (!raw) return;

    // If it looks like a raw UUID string, clear it so Supabase can manage the key.
    if (!raw.trim().startsWith("{")) {
        try {
            window.localStorage.removeItem("session_cookie");
        } catch {
            // ignore
        }
        return;
    }

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== "object") return;

        const obj = parsed as Record<string, unknown>;

        // Legacy custom format: { user_id, access_token, refresh_token }
        const legacyUserId = typeof obj.user_id === "string" ? obj.user_id : null;
        const accessToken = typeof obj.access_token === "string" ? obj.access_token : null;
        const refreshToken = typeof obj.refresh_token === "string" ? obj.refresh_token : null;

        if (legacyUserId && accessToken && refreshToken) {
            const { error } = await tracking.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
            if (error) {
                console.error("[affiliation] legacy session_cookie migration failed:", error);
                try {
                    window.localStorage.removeItem("session_cookie");
                } catch {
                    // ignore
                }
            }
        }
    } catch {
        // If JSON is malformed, clear it so Supabase can recreate it.
        try {
            window.localStorage.removeItem("session_cookie");
        } catch {
            // ignore
        }
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

async function ensureUserId() {
    const supabase = createTrackingClient();

    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error("[affiliation] getSession failed:", sessionError);
    }

    let user = session?.user ?? null;

    // Best-effort migration for older `session_cookie` formats.
    if (!user) {
        await tryMigrateLegacySessionCookie(supabase);
        const { data: after } = await supabase.auth.getSession();
        user = after.session?.user ?? null;
    }

    // Tracking client must remain anonymous (browser-level identifier).
    if (user && !isAnonymousUser(user)) {
        await supabase.auth.signOut();
        user = null;
    }

    if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.error("[affiliation] signInAnonymously failed:", error);
            return { supabase, userId: null as string | null };
        }
        user = data.user ?? null;
    }

    return { supabase, userId: user?.id ?? null };
}

async function upsertAffiliation(fields: Record<string, unknown>) {
    const { supabase, userId } = await ensureUserId();
    if (!userId) return;

    const payload = {
        user_id: userId,
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
