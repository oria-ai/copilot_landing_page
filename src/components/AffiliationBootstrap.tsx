"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

function isAnonymousUser(user: User | null | undefined): boolean {
  return Boolean((user as any)?.is_anonymous);
}

const SESSION_COOKIE_KEY = "session_cookie";
const LEGACY_SESSION_COOKIE_KEY = "affiliation_pre_auth_user_id";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function newUuid(): string {
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  // Modern browsers
  if (c?.randomUUID) {
    return c.randomUUID();
  }

  // Fallback (RFC4122-ish v4)
  const bytes = new Uint8Array(16);
  if (c?.getRandomValues) {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex
    .slice(8, 10)
    .join("")}-${hex.slice(10, 16).join("")}`;
}

function getOrCreateSessionCookieId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const existing = window.localStorage.getItem(SESSION_COOKIE_KEY);
    if (existing && UUID_RE.test(existing.trim())) return existing.trim();
    if (existing && existing.trim()) {
      // If a previous version stored non-UUID data under this key (e.g., JSON session), reset it.
      window.localStorage.removeItem(SESSION_COOKIE_KEY);
    }

    // Migrate legacy key -> new key (best-effort).
    const legacy = window.localStorage.getItem(LEGACY_SESSION_COOKIE_KEY);
    if (legacy && UUID_RE.test(legacy.trim())) {
      window.localStorage.setItem(SESSION_COOKIE_KEY, legacy.trim());
      window.localStorage.removeItem(LEGACY_SESSION_COOKIE_KEY);
      return legacy.trim();
    }

    const id = newUuid();
    window.localStorage.setItem(SESSION_COOKIE_KEY, id);
    return id;
  } catch {
    return null;
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
    const supabase = createClient();
    let cancelled = false;
    const firstEntryUrl = typeof window !== "undefined" ? window.location.href : null;
    const browserId = getOrCreateSessionCookieId();
    if (!browserId) return;

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

    const upsertAuthSnapshotToBrowserRow = async (authUser: User) => {
      // Only store auth UUID & auth snapshot for real (non-anonymous) accounts.
      if (isAnonymousUser(authUser)) return;

      const payload: AffiliationUpsert = {
        user_id: browserId,
        auth_id: authUser.id,
        ...buildAuthSnapshot(authUser),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("affiliation").upsert(payload, { onConflict: "user_id" });
      if (error) {
        console.error("[affiliation] upsert auth snapshot failed:", error);
      }
    };

    const ensureBrowserRow = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("[affiliation] getSession failed:", sessionError);
      }

      if (!sessionData.session?.user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("[affiliation] signInAnonymously failed:", error);
        }
      }

      if (cancelled) return;
      await ensureRowExists(browserId);
      await writeInitialUrlIfMissing(browserId);
    };

    // Ensure the browser-level tracking row exists on every visit.
    void ensureBrowserRow();

    // If the user is already logged in, attach auth.uuid + auth snapshot to the browser row.
    void supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      if (u) void upsertAuthSnapshotToBrowserRow(u);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
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

