import { getSupabaseClient } from "@/lib/supabaseClient";

export type ReviewProfile = {
  username: string | null;
  avatar_url: string | null;
};

export type ReviewRow = {
  id: number;
  created_at: string;
  updated_at: string;
  text: string;
  user_id: string;
  profiles?: ReviewProfile | null;
};

export async function fetchReviewsForFragrance(
  fragranceId: number
): Promise<{ ok: boolean; data: ReviewRow[]; error?: string }> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, data: [], error: error ?? "Supabase is not configured." };
  }

  const { data, error: queryError } = await supabase
    .from("reviews")
    .select("id, created_at, updated_at, text, user_id, profiles(username, avatar_url)")
    .eq("fragrance_id", fragranceId)
    .order("created_at", { ascending: false });

  if (queryError) {
    console.warn("[reviews] fetchReviewsForFragrance failed:", {
      code: queryError.code,
      message: queryError.message,
      details: queryError.details,
      hint: queryError.hint,
    });
    return { ok: false, data: [], error: queryError.message };
  }

  return { ok: true, data: (data ?? []) as ReviewRow[] };
}

export async function fetchMyReview(fragranceId: number): Promise<{
  ok: boolean;
  data?: ReviewRow | null;
  error?: string;
}> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: error ?? "Supabase is not configured." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, error: userError?.message ?? "No authenticated user." };
  }

  const { data, error: queryError } = await supabase
    .from("reviews")
    .select("id, created_at, updated_at, text, user_id")
    .eq("fragrance_id", fragranceId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (queryError) {
    console.warn("[reviews] fetchMyReview failed:", {
      code: queryError.code,
      message: queryError.message,
      details: queryError.details,
      hint: queryError.hint,
    });
    return { ok: false, error: queryError.message };
  }

  return { ok: true, data: (data ?? null) as ReviewRow | null };
}

export async function upsertMyReview(
  fragranceId: number,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: error ?? "Supabase is not configured." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, error: userError?.message ?? "No authenticated user." };
  }

  const { error: upsertError } = await supabase
    .from("reviews")
    .upsert(
      {
        user_id: userData.user.id,
        fragrance_id: fragranceId,
        text,
      },
      { onConflict: "user_id,fragrance_id" }
    );

  if (upsertError) {
    console.warn("[reviews] upsertMyReview failed:", {
      code: upsertError.code,
      message: upsertError.message,
      details: upsertError.details,
      hint: upsertError.hint,
    });
    return { ok: false, error: upsertError.message };
  }

  return { ok: true };
}

export async function deleteMyReview(fragranceId: number): Promise<{
  ok: boolean;
  error?: string;
}> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: error ?? "Supabase is not configured." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, error: userError?.message ?? "No authenticated user." };
  }

  const { error: deleteError } = await supabase
    .from("reviews")
    .delete()
    .eq("fragrance_id", fragranceId)
    .eq("user_id", userData.user.id);

  if (deleteError) {
    console.warn("[reviews] deleteMyReview failed:", {
      code: deleteError.code,
      message: deleteError.message,
      details: deleteError.details,
      hint: deleteError.hint,
    });
    return { ok: false, error: deleteError.message };
  }

  return { ok: true };
}
