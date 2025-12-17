import { createClient } from '@/lib/supabase/client';

const AFFILIATION_USER_ID_KEY = "affiliation_user_id";

function generateUuidV4Fallback() {
    // RFC4122-ish v4 fallback (browser-safe, no dependencies)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function getOrCreateAffiliationUserId() {
    if (typeof window === "undefined") return null;

    try {
        let id = window.localStorage.getItem(AFFILIATION_USER_ID_KEY);
        if (!id) {
            id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : generateUuidV4Fallback();
            window.localStorage.setItem(AFFILIATION_USER_ID_KEY, id);
        }
        return id;
    } catch (err) {
        console.error("[affiliation] failed to access localStorage for browser id:", err);
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

async function upsertAffiliation(fields: Record<string, unknown>) {
    const supabase = createClient();
    const userId = getOrCreateAffiliationUserId();
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
