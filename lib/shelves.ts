import { getSupabaseClient } from "@/lib/supabaseClient";
import type { ShelfType } from "@/lib/types";

// Non-null shelf status for DB operations
type ShelfStatus = "owned" | "want" | "tested";

type ShelfRow = {
  fragranceId: string;
  status: ShelfStatus;
};

const statusToDb: Record<ShelfStatus, string> = {
  owned: "OWNED",
  want: "WANT",
  tested: "TESTED",
};

function statusFromDb(value: string): ShelfStatus | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "owned") return "owned";
  if (normalized === "want") return "want";
  if (normalized === "tested") return "tested";
  return null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const { supabase, error } = getSupabaseClient();
  if (!supabase) {
    console.warn("[shelves] Supabase not configured:", error);
    return null;
  }

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.warn("[shelves] getUser failed:", userError);
    return null;
  }

  return data.user?.id ?? null;
}

export async function fetchShelfRows(): Promise<ShelfRow[]> {
  const { supabase } = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("user_fragrance_status")
    .select("fragrance_id,status")
    .eq("user_id", userId);

  if (error) {
    console.warn("[shelves] fetchShelfRows failed:", error);
    return [];
  }

  return (data ?? []).flatMap((row) => {
    const status = statusFromDb(String(row.status ?? ""));
    if (!status || !row.fragrance_id) return [];
    return [{ fragranceId: String(row.fragrance_id), status }];
  });
}

export async function setShelf(fragranceId: string, status: ShelfStatus): Promise<{
  ok: boolean;
  message?: string;
}> {
  const { supabase } = getSupabaseClient();
  if (!supabase) {
    console.warn("[shelves] setShelf: Supabase client not available");
    return { ok: false, message: "Supabase is not configured." };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn("[shelves] setShelf: No authenticated user");
    return { ok: false, message: "No authenticated user." };
  }

  // Upsert requires a unique constraint on (user_id, fragrance_id)
  const { error: upsertError } = await supabase
    .from("user_fragrance_status")
    .upsert(
      {
        user_id: userId,
        fragrance_id: String(fragranceId),
        status: statusToDb[status],
      },
      { onConflict: "user_id,fragrance_id" }
    );

  if (upsertError) {
    console.warn("[shelves] setShelf upsert failed:", {
      code: upsertError.code,
      message: upsertError.message,
      details: upsertError.details,
      hint: upsertError.hint,
    });
    return { ok: false, message: upsertError.message };
  }

  return { ok: true };
}

export async function removeShelf(fragranceId: string): Promise<{
  ok: boolean;
  message?: string;
}> {
  const { supabase } = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, message: "No authenticated user." };
  }

  const { error } = await supabase
    .from("user_fragrance_status")
    .delete()
    .eq("user_id", userId)
    .eq("fragrance_id", String(fragranceId));

  if (error) {
    console.warn("[shelves] removeShelf failed:", error);
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

