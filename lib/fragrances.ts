import { getSupabaseClient } from "@/lib/supabaseClient";

export type FragranceRow = {
  id: number;
  brand_id: number;
  name: string;
  year: number | null;
  gender: string | null;
  concentration: string | null;
  description: string | null;
  image_url: string | null;
  top_notes: string[] | null;
  middle_notes: string[] | null;
  base_notes: string[] | null;
  season: string[] | null;
  time_of_day: string[] | null;
  longevity: number | null;
  sillage: number | null;
  brand?: { id: number; name: string; logo_url?: string | null } | null;
};

type BrandRow = { id: number; name: string; logo_url?: string | null };

export async function fetchFragrances(): Promise<{
  ok: boolean;
  data: FragranceRow[];
  error?: string;
}> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, data: [], error: error ?? "Supabase is not configured." };
  }

  const { data, error: queryError } = await supabase
    .from("fragrances")
    .select(
      "id, brand_id, name, year, gender, concentration, description, image_url, top_notes, middle_notes, base_notes, season, time_of_day, longevity, sillage, brands ( id, name, logo_url )"
    )
    .order("id", { ascending: true });

  if (queryError) {
    console.warn("[fragrances] fetchFragrances failed:", {
      code: queryError.code,
      message: queryError.message,
      details: queryError.details,
      hint: queryError.hint,
    });
    return { ok: false, data: [], error: queryError.message };
  }

  const rows = (data ?? []).map((row) => {
    const joinedBrand = (row as { brands?: BrandRow | BrandRow[] | null }).brands;
    const brand = Array.isArray(joinedBrand) ? joinedBrand[0] ?? null : joinedBrand ?? null;
    return {
      ...(row as FragranceRow),
      brand,
    };
  });

  return { ok: true, data: rows };
}

export async function fetchBrands(): Promise<{
  ok: boolean;
  data: BrandRow[];
  error?: string;
}> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, data: [], error: error ?? "Supabase is not configured." };
  }

  const { data, error: queryError } = await supabase
    .from("brands")
    .select("id, name, logo_url")
    .order("name", { ascending: true });

  if (queryError) {
    console.warn("[fragrances] fetchBrands failed:", {
      code: queryError.code,
      message: queryError.message,
      details: queryError.details,
      hint: queryError.hint,
    });
    return { ok: false, data: [], error: queryError.message };
  }

  return { ok: true, data: (data ?? []) as BrandRow[] };
}
