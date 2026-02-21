"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Fragrance, ShelfType } from "@/lib/types";
import { fetchBrands, fetchFragrances, FragranceRow } from "@/lib/fragrances";
import { fetchShelfRows, setShelf, removeShelf } from "@/lib/shelves";
import { fetchUserRatings, upsertUserRating, deleteUserRating } from "@/lib/ratings";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface FragranceContextType {
  fragrances: Fragrance[];
  userRatings: Map<number, number>;
  shelves: Map<string, ShelfType>;
  catalogLoading: boolean;
  catalogError: string | null;
  brandOptions: string[];
  addToShelf: (id: string, shelf: "owned" | "want" | "tested") => Promise<void>;
  removeFromShelf: (id: string) => Promise<void>;
  setRating: (id: number, rating: number | null) => void;
  getFragranceById: (id: number) => Fragrance | undefined;
  getFragrancesByShelf: (shelf: "owned" | "want" | "tested") => Fragrance[];
  isAuthenticated: boolean;
  authReady: boolean;
}

const FragranceContext = createContext<FragranceContextType | undefined>(undefined);

export function FragranceProvider({ children }: { children: ReactNode }) {
  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [userRatings, setUserRatings] = useState<Map<number, number>>(new Map());
  const [shelves, setShelves] = useState<Map<string, ShelfType>>(new Map());
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const applyUserMeta = (items: Fragrance[]) => {
    return items.map((fragrance) => ({
      ...fragrance,
      userRating: userRatings.get(fragrance.id) ?? null,
      shelf: shelves.get(String(fragrance.id)) ?? null,
    }));
  };

  const mapGender = (value: string | null): "Male" | "Female" | "Unisex" => {
    const normalized = (value ?? "").trim().toLowerCase();
    if (normalized === "male" || normalized === "masculine") return "Male";
    if (normalized === "female" || normalized === "feminine") return "Female";
    if (normalized === "unisex") return "Unisex";
    return "Unisex";
  };

  const normalizeLabel = (value: string) => {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  const normalizeArray = (values: string[] | null) => {
    return (values ?? []).map((value) => normalizeLabel(value));
  };

  const catalogToFragrance = (catalog: FragranceRow): Fragrance => {
    return {
      id: Number(catalog.id),
      name: catalog.name,
      brand: catalog.brand?.name ?? "Unknown",
      year: catalog.year ?? 0,
      concentration: catalog.concentration ?? null,
      gender: mapGender(catalog.gender),
      description: catalog.description ?? "",
      image:
        catalog.image_url ??
        "https://placehold.co/400x500/141414/ff6b35?text=Fragrance",
      topNotes: catalog.top_notes ?? [],
      middleNotes: catalog.middle_notes ?? [],
      baseNotes: catalog.base_notes ?? [],
      longevity: catalog.longevity ?? 0,
      sillage: catalog.sillage ?? 0,
      season: normalizeArray(catalog.season),
      timeOfDay: normalizeArray(catalog.time_of_day),
      userRating: null,
      shelf: null,
    };
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRatings = localStorage.getItem("parfumerie_ratings");

      if (savedRatings) {
        try {
          const ratings = JSON.parse(savedRatings);
          setUserRatings(new Map(Object.entries(ratings).map(([k, v]) => [Number(k), v as number])));
        } catch (e) {
          console.error("Error loading ratings:", e);
        }
      }

    }
  }, []);

  // Load catalog from Supabase.
  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setCatalogLoading(true);
      setCatalogError(null);

      const [fragranceResult, brandResult] = await Promise.all([
        fetchFragrances(),
        fetchBrands(),
      ]);
      if (cancelled) return;

      if (!fragranceResult.ok) {
        setCatalogError(fragranceResult.error ?? "Failed to load fragrances.");
        setFragrances([]);
        setCatalogLoading(false);
        return;
      }

      if (!brandResult.ok) {
        console.warn("[fragrances] brand list failed:", brandResult.error);
      }

      const mapped = fragranceResult.data.map((item) => catalogToFragrance(item));
      setFragrances(applyUserMeta(mapped));
      setBrandOptions(
        brandResult.ok
          ? brandResult.data.map((brand) => brand.name)
          : [...new Set(mapped.map((item) => item.brand))].sort()
      );
      setCatalogLoading(false);
    }

    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  // Track auth session for shelves (Supabase-backed).
  useEffect(() => {
    const { supabase } = getSupabaseClient();
    if (!supabase) {
      setAuthUserId(null);
      setAuthReady(true);
      return;
    }

    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setAuthUserId(data.user?.id ?? null);
      setAuthReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (!isMounted) return;
        setAuthUserId(session?.user?.id ?? null);
        setAuthReady(true);
      }
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Load shelves from Supabase when authenticated.
  useEffect(() => {
    let cancelled = false;

    async function loadShelves() {
      if (!authReady) return;
      if (!authUserId) {
        setShelves(new Map());
        return;
      }

      const rows = await fetchShelfRows();
      if (cancelled) return;

      const next = new Map<string, ShelfType>();
      rows.forEach((row) => {
        next.set(row.fragranceId, row.status);
      });
      setShelves(next);
    }

    loadShelves();
    return () => {
      cancelled = true;
    };
  }, [authReady, authUserId]);

  // Load ratings from Supabase when authenticated.
  useEffect(() => {
    let cancelled = false;

    async function loadRatings() {
      if (!authReady) return;
      if (!authUserId) {
        return;
      }

      const result = await fetchUserRatings();
      if (cancelled || result.error) return;

      const next = new Map<number, number>();
      result.data.forEach((row) => {
        if (typeof row.fragrance_id === "number" && typeof row.ratings === "number") {
          next.set(row.fragrance_id, row.ratings);
        }
      });
      setUserRatings(next);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "parfumerie_ratings",
          JSON.stringify(Object.fromEntries(next))
        );
      }
    }

    loadRatings();
    return () => {
      cancelled = true;
    };
  }, [authReady, authUserId]);

  // Temporary: clear local shelves on logout.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onLogout = () => {
      try {
        localStorage.removeItem("parfumerie_shelves");
      } catch {
        // ignore
      }
      setShelves(new Map());
    };

    window.addEventListener("parfumerie_logout", onLogout);
    return () => {
      window.removeEventListener("parfumerie_logout", onLogout);
    };
  }, []);

  // Sync fragrances with user data
  useEffect(() => {
    setFragrances((prev) => applyUserMeta(prev));
  }, [userRatings, shelves]);

  const addToShelf = async (id: string, shelf: "owned" | "want" | "tested") => {
    if (!authUserId) {
      return;
    }

    const result = await setShelf(id, shelf);
    if (!result.ok) {
      console.warn("[shelves] setShelf failed:", result.message);
      return;
    }

    setShelves((prev) => {
      const newShelves = new Map(prev);
      newShelves.set(id, shelf);
      return newShelves;
    });
  };

  const removeFromShelf = async (id: string) => {
    if (!authUserId) {
      return;
    }

    const result = await removeShelf(id);
    if (!result.ok) {
      console.warn("[shelves] removeShelf failed:", result.message);
      return;
    }

    setShelves((prev) => {
      const newShelves = new Map(prev);
      newShelves.delete(id);
      return newShelves;
    });
  };

  const setRating = (id: number, rating: number | null) => {
    setUserRatings((prev) => {
      const newRatings = new Map(prev);
      if (rating === null) {
        newRatings.delete(id);
      } else {
        newRatings.set(id, rating);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "parfumerie_ratings",
          JSON.stringify(Object.fromEntries(newRatings))
        );
      }
      return newRatings;
    });

    if (authUserId) {
      if (rating === null) {
        deleteUserRating(id);
      } else {
        upsertUserRating(id, rating);
      }
    }
  };

  const getFragranceById = (id: number): Fragrance | undefined => {
    return fragrances.find((f) => f.id === id);
  };

  const getFragrancesByShelf = (shelf: "owned" | "want" | "tested"): Fragrance[] => {
    return fragrances.filter((f) => f.shelf === shelf);
  };

  return (
    <FragranceContext.Provider
      value={{
        fragrances,
        userRatings,
        shelves,
        catalogLoading,
        catalogError,
        brandOptions,
        addToShelf,
        removeFromShelf,
        setRating,
        getFragranceById,
        getFragrancesByShelf,
        isAuthenticated: Boolean(authUserId),
        authReady,
      }}
    >
      {children}
    </FragranceContext.Provider>
  );
}

export function useFragrance() {
  const context = useContext(FragranceContext);
  if (context === undefined) {
    throw new Error("useFragrance must be used within a FragranceProvider");
  }
  return context;
}
