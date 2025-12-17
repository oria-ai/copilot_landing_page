"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateAffiliationUserId } from "@/utils/userActions";

type AffiliationUpsert = {
  user_id: string;
  url?: string | null;

  // Supabase Auth user id (auth.users.id). A single auth user can map to many browsers.
  auth_id?: string | null;

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
    auth_id: user.id,

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
    const browserUserId = getOrCreateAffiliationUserId();
    if (!browserUserId) return;

    const firstEntryUrl = typeof window !== "undefined" ? window.location.href : null;

    const writeInitialUrlIfMissing = async () => {
      // We want to persist only the first URL the user entered the app with.
      // Never overwrite an existing value.
      if (!firstEntryUrl) return;

      const { error: nullUrlError } = await supabase
        .from("affiliation")
        .update({ url: firstEntryUrl })
        .eq("user_id", browserUserId)
        .is("url", null);

      if (nullUrlError) {
        console.error("[affiliation] set initial url failed (url is null):", nullUrlError);
      }

      const { error: emptyUrlError } = await supabase
        .from("affiliation")
        .update({ url: firstEntryUrl })
        .eq("user_id", browserUserId)
        .eq("url", "");

      if (emptyUrlError) {
        console.error("[affiliation] set initial url failed (url is empty):", emptyUrlError);
      }
    };

    const ensureRowExists = async () => {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("affiliation")
        .upsert({ user_id: browserUserId, updated_at: now }, { onConflict: "user_id" });

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
            { user_id: browserUserId, url: firstEntryUrl, updated_at: now },
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
      await ensureRowExists();

      const payload: AffiliationUpsert = {
        user_id: browserUserId,
        ...buildAuthSnapshot(user),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("affiliation").upsert(payload, { onConflict: "user_id" });
      if (error) {
        console.error("[affiliation] upsert auth snapshot failed:", error);
      }
    };

    const sync = async () => {
      await ensureRowExists();
      await writeInitialUrlIfMissing();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[affiliation] getSession failed:", sessionError);
      }

      const user = session?.user ?? null;
      if (cancelled || !user) return;

      await upsertAuthSnapshot(user);
    };

    void sync();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      const user = session?.user ?? null;

      if (!user) return;

      // Sync only on meaningful changes (avoid TOKEN_REFRESHED spam).
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        void upsertAuthSnapshot(user);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}

