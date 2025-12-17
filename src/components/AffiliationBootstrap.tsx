"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getUserCookie } from "@/lib/userCookie";

/**
 * Payload for affiliation table upsert.
 * user_id = localStorage user_cookie (browser identifier)
 * auth_id = Supabase auth user id (only when logged in)
 */
type AffiliationUpsert = {
  user_id: string;
  auth_id: string | null;

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

function buildAffiliationUpsert(user: User | null): AffiliationUpsert {
  const userId = getUserCookie();
  if (!userId) {
    throw new Error("user_cookie is required");
  }

  // Base payload always includes user_cookie
  const basePayload: AffiliationUpsert = {
    user_id: userId,
    auth_id: null,
    email: null,
    phone: null,
    auth_created_at: null,
    confirmed_at: null,
    last_sign_in_at: null,
    auth_updated_at: null,
    is_anonymous: null,
    is_sso_user: null,
    raw_app_meta_data: {},
    raw_user_meta_data: {},
    provider: null,
    providers: null,
    name: null,
    full_name: null,
    avatar_url: null,
    url: typeof window !== "undefined" ? window.location.href : null,
    updated_at: new Date().toISOString(),
  };

  // If no authenticated user, return base payload
  if (!user) {
    return basePayload;
  }

  // Extract user metadata
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
    user_id: userId,
    auth_id: user.id, // Supabase auth ID

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

    const upsertAffiliation = async (user: User | null) => {
      const userId = getUserCookie();
      if (!userId) return;

      const payload = buildAffiliationUpsert(user);

      // Always check if url already exists (first-only for url)
      const { data: existing } = await supabase
        .from("affiliation")
        .select("url")
        .eq("user_id", userId)
        .single();

      // Don't override url if it exists
      if (existing?.url) {
        payload.url = existing.url;
      }

      const { error } = await supabase
        .from("affiliation")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        console.error("[affiliation] upsert failed:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }
    };

    const initialSync = async () => {
      // Get current auth state
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      // Ensure we have a session (even anonymous) for RLS permissions
      // Note: user_id in affiliation table is the localStorage cookie, NOT the auth ID
      let user = session?.user ?? null;

      if (!session) {
        // Sign in anonymously to satisfy RLS policies
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("[affiliation] signInAnonymously failed:", error.message);
          return;
        }
        user = data.user ?? null;
      }

      // Always sync on initial load - uses user_cookie as identifier
      await upsertAffiliation(user);
    };

    void initialSync();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      const user = session?.user ?? null;

      // Sync on meaningful auth events
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void upsertAffiliation(user);
      }

      // On sign out, clear auth_id but keep the row
      if (event === "SIGNED_OUT") {
        const userId = getUserCookie();
        if (userId) {
          void supabase
            .from("affiliation")
            .update({
              auth_id: null,
              is_anonymous: null,
              email: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}
