/**
 * Manages the persistent user_cookie in localStorage.
 * This is the primary identifier for affiliation tracking,
 * independent of Supabase auth sessions.
 */

const COOKIE_KEY = "user_cookie";

/**
 * Get or create the user cookie.
 * Returns empty string if called on server (SSR safety).
 */
export function getUserCookie(): string {
    if (typeof window === "undefined") return "";

    let cookie = localStorage.getItem(COOKIE_KEY);
    if (!cookie) {
        cookie = crypto.randomUUID();
        localStorage.setItem(COOKIE_KEY, cookie);
    }
    return cookie;
}

/**
 * Check if user cookie exists without creating one.
 */
export function hasUserCookie(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COOKIE_KEY) !== null;
}
