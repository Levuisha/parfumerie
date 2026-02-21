"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/filters/SearchBar";
import { FilterSidebar, FilterState } from "@/components/filters/FilterSidebar";
import { FragranceGrid } from "@/components/fragrance/FragranceGrid";
import { useFragrance } from "@/context/FragranceContext";
import { Fragrance } from "@/lib/types";

export default function HomePage() {
  const { fragrances, catalogLoading, catalogError, brandOptions } = useFragrance();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    season: [],
    timeOfDay: [],
    brands: [],
  });
  const [sortBy, setSortBy] = useState("most-popular");
  const [showFilters, setShowFilters] = useState(false);

  const parseList = (value: string | null) => {
    if (!value) return [];
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (sortBy && sortBy !== "most-popular") params.set("sort", sortBy);
    if (filters.gender.length > 0) params.set("gender", filters.gender.join(","));
    if (filters.season.length > 0) params.set("season", filters.season.join(","));
    if (filters.timeOfDay.length > 0) params.set("time", filters.timeOfDay.join(","));
    if (filters.brands.length > 0) params.set("brands", filters.brands.join(","));
    return params;
  };

  useEffect(() => {
    if (initializedRef.current) return;
    const initialSearch = searchParams.get("q") ?? "";
    const initialSort = searchParams.get("sort") ?? "most-popular";
    const initialFilters: FilterState = {
      gender: parseList(searchParams.get("gender")),
      season: parseList(searchParams.get("season")),
      timeOfDay: parseList(searchParams.get("time")),
      brands: parseList(searchParams.get("brands")),
    };
    setSearchQuery(initialSearch);
    setSortBy(initialSort);
    setFilters(initialFilters);
    initializedRef.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (!initializedRef.current) return;
    const params = buildQueryParams();
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [filters, pathname, router, searchParams, searchQuery, sortBy]);

  const availableBrands = useMemo(() => {
    if (brandOptions.length > 0) return brandOptions;
    return [...new Set(fragrances.map((f) => f.brand))].sort();
  }, [brandOptions, fragrances]);

  const detailQuery = useMemo(() => {
    const params = buildQueryParams();
    return params.toString();
  }, [filters, searchQuery, sortBy]);

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
          (fragrance.season ?? []).includes(s)
        );
        if (!hasMatchingSeason) return false;
      }

      // Time of Day filter
      if (filters.timeOfDay.length > 0) {
        const hasMatchingTime = filters.timeOfDay.some((t) =>
          (fragrance.timeOfDay ?? []).includes(t)
        );
        if (!hasMatchingTime) return false;
      }

      // Brands filter
      if (filters.brands.length > 0 && !filters.brands.includes(fragrance.brand)) {
        return false;
      }

      return true;
    });
  }, [fragrances, searchQuery, filters]);

  const sortedFragrances = useMemo(() => {
    if (sortBy === "most-popular") {
      return filteredFragrances;
    }

    const sorted = [...filteredFragrances];
    switch (sortBy) {
      case "highest-rated":
        return sorted.sort((a, b) => (b.userRating ?? b.longevity) - (a.userRating ?? a.longevity));
      case "biggest-projection":
        return sorted.sort((a, b) => b.sillage - a.sillage);
      case "longest-lasting":
        return sorted.sort((a, b) => b.longevity - a.longevity);
      default:
        return sorted;
    }
  }, [filteredFragrances, sortBy]);

  if (catalogLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Fragrances</h1>
        <p className="text-sm text-[#a0a0a0]">Loading fragrances...</p>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Fragrances</h1>
        <p className="text-sm text-red-400">Failed to load fragrances: {catalogError}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 relative inline-block">
          Browse Fragrances
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b35]"></span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2">
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
                availableBrands={availableBrands}
                sortBy={sortBy}
                onSortChange={setSortBy}
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
          <FragranceGrid fragrances={sortedFragrances} detailQuery={detailQuery} />
        </div>
      </div>
    </div>
  );
}
