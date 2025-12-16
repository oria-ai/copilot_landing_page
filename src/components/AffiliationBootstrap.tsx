"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AffiliationUpsert = {
  user_id: string;

  email: string | null;
  phone: string | null;
  auth_created_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  auth_updated_at: string | null;
  is_anonymous: boolean | null;
  is_sso_user: boolean | null;
  raw_app_meta_data: Record<string, unknown>;
  raw_user_meta_data: Record<string, unknown>;

  provider: string | null;
  providers: string[] | null;
  name: string | null;
  full_name: string | null;
  avatar_url: string | null;

  url: string | null;
  updated_at: string;
};

function buildAffiliationUpsert(user: User): AffiliationUpsert {
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
    user_id: user.id,

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

    url: typeof window !== "undefined" ? window.location.href : null,
    updated_at: new Date().toISOString(),
  };
}

export default function AffiliationBootstrap() {
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const upsertAffiliation = async (user: User) => {
      const payload = buildAffiliationUpsert(user);
      const { error } = await supabase
        .from("affiliation")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        console.error("[affiliation] upsert failed:", error);
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

      if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("[affiliation] signInAnonymously failed:", error);
          return;
        }
        user = data.user ?? null;
      }

      if (cancelled || !user) return;
      await upsertAffiliation(user);
    };

    void ensureSessionAndSync();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      const user = session?.user ?? null;

      // If the user signs out, immediately create a fresh anonymous session
      // so we keep a stable visitor id for the rest of the browsing session.
      if (event === "SIGNED_OUT") {
        void ensureSessionAndSync();
        return;
      }

      if (!user) return;

      // Sync only on meaningful changes (avoid TOKEN_REFRESHED spam).
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        void upsertAffiliation(user);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}

