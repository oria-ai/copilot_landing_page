import { createClient } from '@/lib/supabase/client';

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
    const supabase = createClient();

    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error("[affiliation] getSession failed:", sessionError);
    }

    let user = session?.user ?? null;

    // Ensure we always have an auth user id to write affiliation to.
    // Anonymous users are stored in auth.users (is_anonymous=true) and behave like authenticated users for RLS.
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
