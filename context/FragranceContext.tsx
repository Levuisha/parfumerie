"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Fragrance, ShelfType } from "@/lib/types";
import { mockFragrances } from "@/lib/mockData";

interface FragranceContextType {
  fragrances: Fragrance[];
  userRatings: Map<number, number>;
  userReviews: Map<number, string>;
  shelves: Map<number, ShelfType>;
  addToShelf: (id: number, shelf: "owned" | "want" | "tested") => void;
  removeFromShelf: (id: number) => void;
  setRating: (id: number, rating: number | null) => void;
  setReview: (id: number, review: string) => void;
  getFragranceById: (id: number) => Fragrance | undefined;
  getFragrancesByShelf: (shelf: "owned" | "want" | "tested") => Fragrance[];
}

const FragranceContext = createContext<FragranceContextType | undefined>(undefined);

export function FragranceProvider({ children }: { children: ReactNode }) {
  const [fragrances, setFragrances] = useState<Fragrance[]>(mockFragrances);
  const [userRatings, setUserRatings] = useState<Map<number, number>>(new Map());
  const [userReviews, setUserReviews] = useState<Map<number, string>>(new Map());
  const [shelves, setShelves] = useState<Map<number, ShelfType>>(new Map());

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRatings = localStorage.getItem("parfumerie_ratings");
      const savedReviews = localStorage.getItem("parfumerie_reviews");
      const savedShelves = localStorage.getItem("parfumerie_shelves");

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

      if (savedShelves) {
        try {
          const shelvesData = JSON.parse(savedShelves);
          setShelves(new Map(Object.entries(shelvesData).map(([k, v]) => [Number(k), v as ShelfType])));
        } catch (e) {
          console.error("Error loading shelves:", e);
        }
      }
    }
  }, []);

  // Sync fragrances with user data
  useEffect(() => {
    setFragrances((prev) =>
      prev.map((fragrance) => ({
        ...fragrance,
        userRating: userRatings.get(fragrance.id) ?? null,
        shelf: shelves.get(fragrance.id) ?? null,
      }))
    );
  }, [userRatings, shelves]);

  const addToShelf = (id: number, shelf: "owned" | "want" | "tested") => {
    setShelves((prev) => {
      const newShelves = new Map(prev);
      newShelves.set(id, shelf);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "parfumerie_shelves",
          JSON.stringify(Object.fromEntries(newShelves))
        );
      }
      return newShelves;
    });
  };

  const removeFromShelf = (id: number) => {
    setShelves((prev) => {
      const newShelves = new Map(prev);
      newShelves.delete(id);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "parfumerie_shelves",
          JSON.stringify(Object.fromEntries(newShelves))
        );
      }
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
