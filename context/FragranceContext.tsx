"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Fragrance, ShelfType } from "@/lib/types";
import { mockFragrances } from "@/lib/mockData";
import { fetchShelfRows, setShelf, removeShelf } from "@/lib/shelves";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface FragranceContextType {
  fragrances: Fragrance[];
  userRatings: Map<number, number>;
  userReviews: Map<number, string>;
  shelves: Map<string, ShelfType>;
  addToShelf: (id: string, shelf: "owned" | "want" | "tested") => Promise<void>;
  removeFromShelf: (id: string) => Promise<void>;
  setRating: (id: number, rating: number | null) => void;
  setReview: (id: number, review: string) => void;
  getFragranceById: (id: number) => Fragrance | undefined;
  getFragrancesByShelf: (shelf: "owned" | "want" | "tested") => Fragrance[];
  isAuthenticated: boolean;
  authReady: boolean;
}

const FragranceContext = createContext<FragranceContextType | undefined>(undefined);

export function FragranceProvider({ children }: { children: ReactNode }) {
  const [fragrances, setFragrances] = useState<Fragrance[]>(mockFragrances);
  const [userRatings, setUserRatings] = useState<Map<number, number>>(new Map());
  const [userReviews, setUserReviews] = useState<Map<number, string>>(new Map());
  const [shelves, setShelves] = useState<Map<string, ShelfType>>(new Map());
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRatings = localStorage.getItem("parfumerie_ratings");
      const savedReviews = localStorage.getItem("parfumerie_reviews");

      if (savedRatings) {
        try {
          const ratings = JSON.parse(savedRatings);
          setUserRatings(new Map(Object.entries(ratings).map(([k, v]) => [Number(k), v as number])));
        } catch (e) {
          console.error("Error loading ratings:", e);
        }
      }

      if (savedReviews) {
        try {
          const reviews = JSON.parse(savedReviews);
          setUserReviews(new Map(Object.entries(reviews).map(([k, v]) => [Number(k), v as string])));
        } catch (e) {
          console.error("Error loading reviews:", e);
        }
      }

    }
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
    setFragrances((prev) =>
      prev.map((fragrance) => ({
        ...fragrance,
        userRating: userRatings.get(fragrance.id) ?? null,
        shelf: shelves.get(String(fragrance.id)) ?? null,
      }))
    );
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
  };

  const setReview = (id: number, review: string) => {
    setUserReviews((prev) => {
      const newReviews = new Map(prev);
      if (review.trim() === "") {
        newReviews.delete(id);
      } else {
        newReviews.set(id, review);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "parfumerie_reviews",
          JSON.stringify(Object.fromEntries(newReviews))
        );
      }
      return newReviews;
    });
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
        userReviews,
        shelves,
        addToShelf,
        removeFromShelf,
        setRating,
        setReview,
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
