import { getSupabaseClient } from "@/lib/supabaseClient";

export type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  signature_fragrance_id: number | null;
  bio: string | null;
};

export async function fetchProfile(userId: string): Promise<{
  data?: ProfileRow;
  error?: string;
}> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { error: error ?? "Supabase is not configured." };
  }

  const { data, error: queryError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, signature_fragrance_id, bio")
    .eq("id", userId)
    .single();

  if (queryError) {
    console.warn("[profile] fetchProfile failed:", {
      code: queryError.code,
      message: queryError.message,
      details: queryError.details,
      hint: queryError.hint,
    });
    return { error: queryError.message };
  }

  return { data: data as ProfileRow };
}

export async function updateProfile(
  userId: string,
  updates: Partial<ProfileRow>
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: error ?? "Supabase is not configured." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (updateError) {
    console.warn("[profile] updateProfile failed:", {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
    });
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ publicUrl?: string; error?: string }> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { error: error ?? "Supabase is not configured." };
  }

  const extension = file.name.split(".").pop() || "png";
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    console.warn("[profile] uploadAvatar failed:", {
      message: uploadError.message,
      name: uploadError.name,
    });
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  if (!data?.publicUrl) {
    return { error: "Unable to resolve public avatar URL." };
  }

  return { publicUrl: data.publicUrl };
}

export async function fetchOwnedFragranceOptions(
  userId: string
): Promise<{ data: Array<{ id: number; name: string }>; error?: string }> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { data: [], error: error ?? "Supabase is not configured." };
  }

  const { data: statusRows, error: statusError } = await supabase
    .from("user_fragrance_status")
    .select("fragrance_id")
    .eq("user_id", userId)
    .eq("status", "OWNED");

  if (statusError) {
    console.warn("[profile] fetchOwnedFragranceOptions status failed:", {
      code: statusError.code,
      message: statusError.message,
      details: statusError.details,
      hint: statusError.hint,
    });
    return { data: [], error: statusError.message };
  }

  const ids = (statusRows ?? [])
    .map((row) => Number(row.fragrance_id))
    .filter((value) => Number.isFinite(value));

  if (ids.length === 0) {
    return { data: [] };
  }

  const { data: fragrances, error: fragranceError } = await supabase
    .from("fragrances")
    .select("id, name")
    .in("id", ids);

  if (fragranceError) {
    console.warn("[profile] fetchOwnedFragranceOptions fragrance failed:", {
      code: fragranceError.code,
      message: fragranceError.message,
      details: fragranceError.details,
      hint: fragranceError.hint,
    });
    return { data: [], error: fragranceError.message };
  }

  return {
    data: (fragrances ?? []).map((row) => ({
      id: Number(row.id),
      name: row.name as string,
    })),
  };
}
