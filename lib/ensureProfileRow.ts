import { getSupabaseClient } from "@/lib/supabaseClient";

export type EnsureProfileResult =
  | { ok: true; userId: string }
  | { ok: false; message: string };

/**
 * Ensures a `profiles` row exists for the currently-authenticated user.
 * Uses anon key only; relies on RLS (id must equal auth.uid()).
 */
export async function ensureProfileRow(): Promise<EnsureProfileResult> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    const message = error ?? "Supabase is not configured.";
    console.warn("[ensureProfileRow] Supabase client missing:", message);
    return { ok: false, message };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.warn("[ensureProfileRow] getUser failed:", userError);
    return { ok: false, message: userError.message };
  }

  const user = userData.user;
  if (!user) {
    return { ok: false, message: "No authenticated user." };
  }

  // Provide created_at explicitly to avoid depending on DB defaults.
  // Use ignoreDuplicates so we don't overwrite existing rows (esp. created_at).
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, created_at: new Date().toISOString() },
      { onConflict: "id", ignoreDuplicates: true }
    );

  if (upsertError) {
    console.warn("[ensureProfileRow] profiles upsert failed:", upsertError);
    return { ok: false, message: upsertError.message };
  }

  return { ok: true, userId: user.id };
}

