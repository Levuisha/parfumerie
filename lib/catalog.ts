import { getSupabaseClient } from "@/lib/supabaseClient";

export type CatalogBrand = {
  id: number;
  name: string;
  logo_url: string | null;
};

export type CatalogFragrance = {
  id: number;
  name: string;
  image_url: string | null;
  year: number | null;
  concentration: string | null;
  gender: string | null;
  description: string | null;
  brand: CatalogBrand;
};

type CatalogRow = {
  id: number | string;
  name: string;
  image_url: string | null;
  year: number | null;
  concentration: string | null;
  gender: string | null;
  description: string | null;
  brand: CatalogBrand | null;
};

function normalizeCatalogRow(row: CatalogRow): CatalogFragrance {
  const brand = row.brand ?? { id: 0, name: "Unknown", logo_url: null };
  return {
    id: Number(row.id),
    name: row.name,
    image_url: row.image_url ?? null,
    year: row.year ?? null,
    concentration: row.concentration ?? null,
    gender: row.gender ?? null,
    description: row.description ?? null,
    brand: {
      id: Number(brand.id),
      name: brand.name,
      logo_url: brand.logo_url ?? null,
    },
  };
}

export async function fetchCatalogFragrances(): Promise<{
  data: CatalogFragrance[];
  error?: string;
}> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { data: [], error };
  }

  const { data, error: queryError } = await supabase
    .from("fragrances")
    .select(
      "id, name, image_url, year, concentration, gender, description, brand:brands(id, name, logo_url)"
    )
    .order("id", { ascending: true });

  if (queryError) {
    return { data: [], error: queryError.message };
  }

  return { data: (data ?? []).map((row) => normalizeCatalogRow(row as CatalogRow)) };
}

export async function fetchCatalogFragranceById(
  id: number
): Promise<{ data?: CatalogFragrance; error?: string }> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    return { error };
  }

  const { data, error: queryError } = await supabase
    .from("fragrances")
    .select(
      "id, name, image_url, year, concentration, gender, description, brand:brands(id, name, logo_url)"
    )
    .eq("id", id)
    .single();

  if (queryError) {
    return { error: queryError.message };
  }

  if (!data) {
    return { error: "Fragrance not found." };
  }

  return { data: normalizeCatalogRow(data as CatalogRow) };
}
