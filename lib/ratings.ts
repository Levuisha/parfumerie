import { getSupabaseClient } from "@/lib/supabaseClient";

type RatingRow = {
  fragrance_id: number;
  ratings: number;
};

export async function fetchUserRatings(): Promise<{
  data: RatingRow[];
  error?: string;
}> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { data: [], error };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { data: [], error: userError?.message ?? "No authenticated user." };
  }

  const { data, error: queryError } = await supabase
    .from("user_ratings")
    .select("fragrance_id, ratings")
    .eq("user_id", userData.user.id);

  if (queryError) {
    console.warn("[ratings] fetchUserRatings failed:", {
      code: queryError.code,
      message: queryError.message,
      details: queryError.details,
      hint: queryError.hint,
    });
    return { data: [], error: queryError.message };
  }

  return { data: (data ?? []) as RatingRow[] };
}

export async function upsertUserRating(
  fragranceId: number,
  rating: number
): Promise<{ ok: boolean; message?: string }> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: error ?? "Supabase is not configured." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, message: userError?.message ?? "No authenticated user." };
  }

  const { error: upsertError } = await supabase
    .from("user_ratings")
    .upsert(
      {
        user_id: userData.user.id,
        fragrance_id: fragranceId,
        ratings: rating,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id,fragrance_id" }
    );

  if (upsertError) {
    console.warn("[ratings] upsertUserRating failed:", {
      code: upsertError.code,
      message: upsertError.message,
      details: upsertError.details,
      hint: upsertError.hint,
    });
    return { ok: false, message: upsertError.message };
  }

  return { ok: true };
}

export async function deleteUserRating(fragranceId: number): Promise<{
  ok: boolean;
  message?: string;
}> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: error ?? "Supabase is not configured." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, message: userError?.message ?? "No authenticated user." };
  }

  const { error: deleteError } = await supabase
    .from("user_ratings")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("fragrance_id", fragranceId);

  if (deleteError) {
    console.warn("[ratings] deleteUserRating failed:", {
      code: deleteError.code,
      message: deleteError.message,
      details: deleteError.details,
      hint: deleteError.hint,
    });
    return { ok: false, message: deleteError.message };
  }

  return { ok: true };
}
