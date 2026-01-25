import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient | undefined;
}

type SupabaseEnv = {
  url: string;
  anonKey: string;
};

function readSupabaseEnv(): { env: SupabaseEnv | null; error?: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      env: null,
      error:
        "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart `npm run dev`.",
    };
  }

  return { env: { url, anonKey } };
}

/**
 * Single source of truth for creating a browser-safe Supabase client.
 *
 * IMPORTANT:
 * - Uses ONLY `NEXT_PUBLIC_*` env vars (safe for client-side use).
 * - Does NOT throw at import-time (so it won't crash the whole app).
 */
export function getSupabaseClient(): {
  supabase: SupabaseClient | null;
  error?: string;
} {
  const { env, error } = readSupabaseEnv();
  if (!env) return { supabase: null, error };

  if (!globalThis.__supabaseClient) {
    globalThis.__supabaseClient = createClient(env.url, env.anonKey);
  }

  return { supabase: globalThis.__supabaseClient };
}

