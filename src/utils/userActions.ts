import { createClient } from '@/lib/supabase/client';
import { getUserCookie } from '@/lib/userCookie';

export const trackUserClick = async (tag: string) => {
    try {
        const supabase = createClient();

        // 1. Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Error getting user for tracking:", userError);
            return;
        }

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

    // For "first-only" fields, check if they already have values
    if (firstOnlyFields.length > 0) {
        const { data: existing } = await supabase
            .from("affiliation")
            .select(firstOnlyFields.join(","))
            .eq("user_id", userId)
            .single();

        // Remove fields that already have values
        const existingRecord = existing as Record<string, unknown> | null;
        for (const field of firstOnlyFields) {
            if (existingRecord && existingRecord[field] != null) {
                delete fields[field];
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
