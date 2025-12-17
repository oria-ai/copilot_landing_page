
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

let trackingClient: SupabaseClient | null = null;

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// A dedicated, always-anonymous client used for browser-level tracking.
// It persists its own session under the `session_cookie` localStorage key and is NOT affected by user logins/logouts.
export function createTrackingClient() {
    if (trackingClient) return trackingClient;

    trackingClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: "session_cookie",
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false,
            },
        },
    );

    return trackingClient;
}
