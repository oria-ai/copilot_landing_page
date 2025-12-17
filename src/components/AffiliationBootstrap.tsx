"use client";

import { useEffect } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient, createTrackingClient } from "@/lib/supabase/client";

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

type AffiliationUpsert = {
  user_id: string;
  auth_id?: string | null;
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
    const auth = createClient();
    const tracking = createTrackingClient();
    let cancelled = false;
    const firstEntryUrl = typeof window !== "undefined" ? window.location.href : null;
    let browserUserId: string | null = null;

    const writeInitialUrlIfMissing = async (userId: string) => {
      // We want to persist only the first URL the user entered the app with.
      // Never overwrite an existing value.
      if (!firstEntryUrl) return;

      const { error: nullUrlError } = await tracking
        .from("affiliation")
        .update({ url: firstEntryUrl })
        .eq("user_id", userId)
        .is("url", null);

      if (nullUrlError) {
        console.error("[affiliation] set initial url failed (url is null):", nullUrlError);
      }

      const { error: emptyUrlError } = await tracking
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

      const { error } = await tracking
        .from("affiliation")
        .upsert({ user_id: userId, updated_at: now }, { onConflict: "user_id" });

      if (!error) return;

      // If the DB enforces NOT NULL on `url`, the initial insert may fail.
      // Retry once including the first-entry URL (safe: this path only happens on insert).
      const isUrlNotNullViolation =
        error.code === "23502" && typeof error.message === "string" && error.message.toLowerCase().includes("url");

      if (isUrlNotNullViolation && firstEntryUrl) {
        const { error: retryError } = await tracking
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

    const ensureBrowserSession = async () => {
      const { data: sessionData, error: sessionError } = await tracking.auth.getSession();
      if (sessionError) {
        console.error("[affiliation] tracking getSession failed:", sessionError);
      }

      let user = sessionData.session?.user ?? null;

      if (!user) {
        await tryMigrateLegacySessionCookie(tracking);
        const { data: after } = await tracking.auth.getSession();
        user = after.session?.user ?? null;
      }

      // Tracking session must remain anonymous (browser-level identifier).
      if (user && !isAnonymousUser(user)) {
        await tracking.auth.signOut();
        user = null;
      }

      if (!user) {
        const { data, error } = await tracking.auth.signInAnonymously();
        if (error) {
          console.error("[affiliation] tracking signInAnonymously failed:", error);
          return null;
        }
        user = data.user ?? null;
      }

      browserUserId = user?.id ?? null;
      return browserUserId;
    };

    const ensureBrowserRow = async () => {
      const userId = await ensureBrowserSession();
      if (!userId) return null;
      await ensureRowExists(userId);
      await writeInitialUrlIfMissing(userId);
      return userId;
    };

    const upsertAuthSnapshotToBrowserRow = async (authUser: User) => {
      // Only store auth UUID & auth snapshot for real (non-anonymous) accounts.
      if (isAnonymousUser(authUser)) return;

      const browserId = await ensureBrowserRow();
      if (!browserId) return;

      const payload: AffiliationUpsert = {
        user_id: browserId,
        auth_id: authUser.id,
        ...buildAuthSnapshot(authUser),
        updated_at: new Date().toISOString(),
      };

      const { error } = await tracking.from("affiliation").upsert(payload, { onConflict: "user_id" });
      if (error) {
        console.error("[affiliation] upsert auth snapshot failed:", error);
      }
    };

    // Ensure the browser-level tracking row exists on every visit.
    void ensureBrowserRow();

    // If the user is already logged in, attach auth.uuid + auth snapshot to the browser row.
    void auth.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      if (u) void upsertAuthSnapshotToBrowserRow(u);
    });

    const { data: listener } = auth.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      // Sync only on meaningful changes (avoid TOKEN_REFRESHED spam).
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        const u = session?.user ?? null;
        if (u) void upsertAuthSnapshotToBrowserRow(u);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}

