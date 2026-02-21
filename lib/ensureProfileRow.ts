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
    console.warn("[ensureProfileRow] getUser failed:", {
      message: userError.message,
      status: userError.status,
      name: userError.name,
    });
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
    console.warn("[ensureProfileRow] profiles upsert failed:", {
      code: upsertError.code,
      message: upsertError.message,
      details: upsertError.details,
      hint: upsertError.hint,
    });
    return { ok: false, message: upsertError.message };
  }

  const { error: selectError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, signature_fragrance_id, bio")
    .eq("id", user.id)
    .single();

  if (selectError) {
    console.warn("[ensureProfileRow] profiles select failed:", {
      code: selectError.code,
      message: selectError.message,
      details: selectError.details,
      hint: selectError.hint,
    });
    return { ok: false, message: selectError.message };
  }

  return { ok: true, userId: user.id };
}

