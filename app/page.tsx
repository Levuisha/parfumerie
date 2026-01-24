"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "@/components/filters/SearchBar";
import { FilterSidebar, FilterState } from "@/components/filters/FilterSidebar";
import { FragranceGrid } from "@/components/fragrance/FragranceGrid";
import { useFragrance } from "@/context/FragranceContext";
import { Fragrance } from "@/lib/types";

export default function HomePage() {
  const { fragrances } = useFragrance();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    season: [],
    timeOfDay: [],
    notes: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique notes from fragrances
  const availableNotes = useMemo(() => {
    const notesSet = new Set<string>();
    fragrances.forEach((f) => {
      f.topNotes.forEach((n) => notesSet.add(n));
      f.middleNotes.forEach((n) => notesSet.add(n));
      f.baseNotes.forEach((n) => notesSet.add(n));
    });
    return Array.from(notesSet).sort();
  }, [fragrances]);

  // Filter fragrances
  const filteredFragrances = useMemo(() => {
    return fragrances.filter((fragrance: Fragrance) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          fragrance.name.toLowerCase().includes(query) ||
          fragrance.brand.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(fragrance.gender)) {
        return false;
      }

      // Season filter
      if (filters.season.length > 0) {
        const hasMatchingSeason = filters.season.some((s) =>
          fragrance.season.includes(s)
        );
        if (!hasMatchingSeason) return false;
      }

      // Time of Day filter
      if (filters.timeOfDay.length > 0) {
        const hasMatchingTime = filters.timeOfDay.some((t) =>
          fragrance.timeOfDay.includes(t)
        );
        if (!hasMatchingTime) return false;
      }

      // Notes filter
      if (filters.notes.length > 0) {
        const allNotes = [
          ...fragrance.topNotes,
          ...fragrance.middleNotes,
          ...fragrance.baseNotes,
        ];
        const hasMatchingNote = filters.notes.some((n) =>
          allNotes.includes(n)
        );
        if (!hasMatchingNote) return false;
      }

      return true;
    });
  }, [fragrances, searchQuery, filters]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 relative inline-block">
          Browse Fragrances
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b35]"></span>
        </h1>
        <p className="text-[#a0a0a0] mt-2">Discover and explore our collection</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-4 py-2 text-left border border-gray-200 rounded-md hover:bg-gray-50"
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>
            <div className={showFilters ? "block lg:block" : "hidden lg:block"}>
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                availableNotes={availableNotes}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="mb-4 text-sm text-[#a0a0a0]">
            Showing {filteredFragrances.length} of {fragrances.length} fragrances
          </div>
          <FragranceGrid fragrances={filteredFragrances} />
        </div>
      </div>
    </div>
  );
}
