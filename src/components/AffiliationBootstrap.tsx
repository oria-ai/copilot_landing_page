"use client";

import { useEffect } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

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

  // New format (JSON)
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

function getSessionCookieUserId(): string | null {
  const parsed = parseSessionCookie(readSessionCookieRaw());
  return parsed?.user_id ?? null;
}

function writeSessionCookie(value: SessionCookieValue) {
  if (typeof window === "undefined") return;
  try {
    // Keep it readable if we only have the id; otherwise store tokens for restoration.
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

type AffiliationUpsert = {
  user_id: string;
  url?: string | null;

  // When a user signs in to an existing account (identity already linked),
  // we keep the anon row and link the new signed-in row to it.
  merged_from_user_id?: string | null;

  email?: string | null;
  phone?: string | null;
  auth_created_at?: string | null;
  confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  auth_updated_at?: string | null;
  is_anonymous?: boolean | null;
  is_sso_user?: boolean | null;
  raw_app_meta_data?: Record<string, unknown>;
  raw_user_meta_data?: Record<string, unknown>;

  provider?: string | null;
  providers?: string[] | null;
  name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;

  updated_at: string;
};

function buildAuthSnapshot(user: User): Omit<AffiliationUpsert, "user_id" | "updated_at"> {
  const app = (user.app_metadata ?? {}) as Record<string, unknown>;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  const providers = Array.isArray(app["providers"])
    ? (app["providers"] as string[])
    : null;
  const provider = typeof app["provider"] === "string" ? (app["provider"] as string) : null;

  const avatarUrl =
    typeof meta["avatar_url"] === "string"
      ? (meta["avatar_url"] as string)
      : typeof meta["picture"] === "string"
        ? (meta["picture"] as string)
        : null;

  const name =
    typeof meta["name"] === "string"
      ? (meta["name"] as string)
      : typeof meta["full_name"] === "string"
        ? (meta["full_name"] as string)
        : null;

  const fullName = typeof meta["full_name"] === "string" ? (meta["full_name"] as string) : name;

  const anyUser = user as unknown as Record<string, unknown>;
  const confirmedAt =
    typeof anyUser["confirmed_at"] === "string"
      ? (anyUser["confirmed_at"] as string)
      : typeof anyUser["email_confirmed_at"] === "string"
        ? (anyUser["email_confirmed_at"] as string)
        : null;

  const phone = typeof anyUser["phone"] === "string" ? (anyUser["phone"] as string) : null;
  const lastSignInAt =
    typeof anyUser["last_sign_in_at"] === "string" ? (anyUser["last_sign_in_at"] as string) : null;
  const isAnonymous = typeof anyUser["is_anonymous"] === "boolean" ? (anyUser["is_anonymous"] as boolean) : null;
  const isSsoUser = typeof anyUser["is_sso_user"] === "boolean" ? (anyUser["is_sso_user"] as boolean) : null;

  return {
    email: user.email ?? null,
    phone,
    auth_created_at: user.created_at ?? null,
    confirmed_at: confirmedAt,
    last_sign_in_at: lastSignInAt,
    auth_updated_at: user.updated_at ?? null,
    is_anonymous: isAnonymous,
    is_sso_user: isSsoUser,
    raw_app_meta_data: app,
    raw_user_meta_data: meta,

    provider,
    providers,
    name,
    full_name: fullName,
    avatar_url: avatarUrl,
  };
}

export default function AffiliationBootstrap() {
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    const firstEntryUrl = typeof window !== "undefined" ? window.location.href : null;

    const writeInitialUrlIfMissing = async (userId: string) => {
      // We want to persist only the first URL the user entered the app with.
      // Never overwrite an existing value.
      if (!firstEntryUrl) return;

      const { error: nullUrlError } = await supabase
        .from("affiliation")
        .update({ url: firstEntryUrl })
        .eq("user_id", userId)
        .is("url", null);

      if (nullUrlError) {
        console.error("[affiliation] set initial url failed (url is null):", nullUrlError);
      }

      const { error: emptyUrlError } = await supabase
        .from("affiliation")
        .update({ url: firstEntryUrl })
        .eq("user_id", userId)
        .eq("url", "");

      if (emptyUrlError) {
        console.error("[affiliation] set initial url failed (url is empty):", emptyUrlError);
      }
    };

    const ensureRowExists = async (userId: string) => {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("affiliation")
        .upsert({ user_id: userId, updated_at: now }, { onConflict: "user_id" });

      if (!error) return;

      // If the DB enforces NOT NULL on `url`, the initial insert may fail.
      // Retry once including the first-entry URL (safe: this path only happens on insert).
      const isUrlNotNullViolation =
        error.code === "23502" && typeof error.message === "string" && error.message.toLowerCase().includes("url");

      if (isUrlNotNullViolation && firstEntryUrl) {
        const { error: retryError } = await supabase
          .from("affiliation")
          // If a row was created concurrently, do NOT update it (preserve existing url).
          .upsert(
            { user_id: userId, url: firstEntryUrl, updated_at: now },
            { onConflict: "user_id", ignoreDuplicates: true },
          );

        if (retryError) {
          console.error("[affiliation] ensure row exists failed (retry with url):", retryError);
          return;
        }

        return;
      }

      console.error("[affiliation] ensure row exists failed:", error);
    };

    const upsertAuthSnapshot = async (user: User) => {
      await ensureRowExists(user.id);

      const preAuthId = getSessionCookieUserId();

      const payload: AffiliationUpsert = {
        user_id: user.id,
        ...buildAuthSnapshot(user),
        updated_at: new Date().toISOString(),
      };

      if (preAuthId && preAuthId !== user.id) {
        payload.merged_from_user_id = preAuthId;
      }

      const { error } = await supabase.from("affiliation").upsert(payload, { onConflict: "user_id" });
      if (error) {
        console.error("[affiliation] upsert auth snapshot failed:", error);
      }
    };

    const ensureSessionAndSync = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[affiliation] getSession failed:", sessionError);
      }

      let user = session?.user ?? null;

      // If we already have an anonymous session, keep a copy so we can restore it after sign-out.
      if (session && isAnonymousUser(user)) {
        writeAnonSessionCookieFromSession(session);
      }

      // If the user signed out, Supabase clears its stored session.
      // To avoid creating a new anonymous user (and a new affiliation row) on every logout,
      // we restore the previous anonymous session from localStorage if possible.
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
            // Don't repeatedly attempt to restore a non-anonymous or invalid session.
            try {
              window.localStorage.removeItem(SESSION_COOKIE_KEY);
            } catch {
              // ignore
            }
          }
        }
      }

      // If we couldn't restore, create a fresh anonymous session and persist it.
      if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("[affiliation] signInAnonymously failed:", error);
          return;
        }
        user = data.user ?? null;
        if (data.session) {
          writeAnonSessionCookieFromSession(data.session);
        } else if (user && isAnonymousUser(user)) {
          writeSessionCookie({ user_id: user.id });
        }
      }

      if (cancelled || !user) return;

      await upsertAuthSnapshot(user);
      await writeInitialUrlIfMissing(user.id);
    };

    void ensureSessionAndSync();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      const user = session?.user ?? null;
      if (session && isAnonymousUser(user)) {
        // Keep anonymous session tokens fresh (refresh tokens can rotate).
        writeAnonSessionCookieFromSession(session);
      }

      // If the user signs out, immediately create a fresh anonymous session
      // (or restore the previous anonymous session) so we keep a stable browser identifier for continued tracking.
      if (event === "SIGNED_OUT") {
        void ensureSessionAndSync();
        return;
      }

      if (!user) return;

      // Sync only on meaningful changes (avoid TOKEN_REFRESHED spam).
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        void upsertAuthSnapshot(user);
        void writeInitialUrlIfMissing(user.id);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}

