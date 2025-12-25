import { createClient } from '@/lib/supabase/client';
import type { Session, User } from "@supabase/supabase-js";

const SESSION_COOKIE_KEY = "session_cookie";
const LEGACY_SESSION_COOKIE_KEY = "affiliation_pre_auth_user_id";

type SessionCookieValue = {
    user_id: string;
    access_token?: string;
    refresh_token?: string;
};

function isAnonymousUser(user: User | null | undefined): boolean {
    return Boolean((user as any)?.is_anonymous);
}

function readSessionCookieRaw(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return (
            window.localStorage.getItem(SESSION_COOKIE_KEY) ??
            window.localStorage.getItem(LEGACY_SESSION_COOKIE_KEY)
        );
    } catch {
        return null;
    }
}

function parseSessionCookie(raw: string | null): SessionCookieValue | null {
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== "object") return null;

        const obj = parsed as Record<string, unknown>;
        const userId = typeof obj.user_id === "string" ? obj.user_id : null;
        if (!userId) return null;

        const accessToken = typeof obj.access_token === "string" ? obj.access_token : undefined;
        const refreshToken = typeof obj.refresh_token === "string" ? obj.refresh_token : undefined;

        return { user_id: userId, access_token: accessToken, refresh_token: refreshToken };
    } catch {
        // Legacy format (raw user id string)
        return { user_id: raw };
    }
}

function writeSessionCookie(value: SessionCookieValue) {
    if (typeof window === "undefined") return;
    try {
        const payload =
            value.access_token && value.refresh_token ? JSON.stringify(value) : value.user_id;
        window.localStorage.setItem(SESSION_COOKIE_KEY, payload);
        // Clean up legacy key to avoid confusion.
        window.localStorage.removeItem(LEGACY_SESSION_COOKIE_KEY);
    } catch {
        // best-effort only
    }
}

function writeAnonSessionCookieFromSession(session: Session) {
    if (!isAnonymousUser(session.user)) return;
    writeSessionCookie({
        user_id: session.user.id,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
    });
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

/**
 * Upsert affiliation row using localStorage user_cookie as identifier.
 * Ensures an anonymous session exists for RLS permissions.
 * @param fields - Fields to update
 * @param firstOnlyFields - Fields that should only be set on first write (won't override existing values)
 */
async function upsertAffiliation(
    fields: Record<string, unknown>,
    firstOnlyFields: string[] = []
) {
    const userId = getUserCookie();
    if (!userId) return;

    const supabase = createClient();

    // Ensure we have a session (even anonymous) for RLS permissions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        const { error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
            console.error("[affiliation] signInAnonymously failed:", authError.message);
            return;
        }
    }

    let user = session?.user ?? null;

    // Keep a restorable anonymous session (pre-login browser identity) across logouts.
    if (session && isAnonymousUser(user)) {
        writeAnonSessionCookieFromSession(session);
    }

    // Ensure we always have an auth user id to write affiliation to.
    // Anonymous users are stored in auth.users (is_anonymous=true) and behave like authenticated users for RLS.
    if (!user) {
        const stored = parseSessionCookie(readSessionCookieRaw());
        const canRestore = Boolean(stored?.access_token && stored?.refresh_token);

        if (canRestore) {
            const { data, error } = await supabase.auth.setSession({
                access_token: stored!.access_token!,
                refresh_token: stored!.refresh_token!,
            });

            const restoredSession = data.session ?? null;
            const restoredUser = restoredSession?.user ?? null;

            if (error) {
                console.error("[affiliation] restore anon session failed:", error);
            } else if (restoredSession && restoredUser && isAnonymousUser(restoredUser)) {
                user = restoredUser;
                writeAnonSessionCookieFromSession(restoredSession);
            } else {
                try {
                    window.localStorage.removeItem(SESSION_COOKIE_KEY);
                } catch {
                    // ignore
                }
            }
        }

        if (!user) {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) {
                console.error("[affiliation] signInAnonymously failed:", error);
                return { supabase, userId: null as string | null };
            }
            user = data.user ?? null;
            if (data.session) {
                writeAnonSessionCookieFromSession(data.session);
            } else if (user && isAnonymousUser(user)) {
                writeSessionCookie({ user_id: user.id });
            }
        }
    }

    // If all fields were filtered out, nothing to update
    if (Object.keys(fields).length === 0) return;

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

/**
 * Track Start Free Trial button click.
 * Only the first button number is saved (first-only).
 */
export async function trackStartFreeTrialClick(buttonNumber: number) {
    const now = new Date().toISOString();
    await upsertAffiliation(
        {
            start_free_trial_button: buttonNumber,
            start_free_trial_at: now,
        },
        ["start_free_trial_button"] // First button only
    );
}

/**
 * Track which login method button was clicked.
 * Only the first method is saved (first-only).
 */
export async function trackLoginWith(method: LoginMethod) {
    const now = new Date().toISOString();
    await upsertAffiliation(
        {
            log_in_with: method,
            log_in_at: now,
        },
        ["log_in_with"] // First method only
    );
}

/**
 * Track trial page continue button click.
 */
export async function trackTrialClick() {
    await upsertAffiliation({
        trial_at: new Date().toISOString(),
    });
}

/**
 * Track payment method selection.
 * Only the first method is saved (first-only).
 */
export async function trackPaymentMethodClick(method: string) {
    const now = new Date().toISOString();
    await upsertAffiliation(
        {
            payment_method: method,
            payment_at: now,
        },
        ["payment_method"] // First payment method only
    );
}

/**
 * Track waitlist signup.
 */
export async function trackWaitlistClick() {
    await upsertAffiliation({
        waitlist: true,
    });
}

export async function trackWaitlistChoice(choice: boolean) {
    await upsertAffiliation({
        waitlist: choice,
    });
}
