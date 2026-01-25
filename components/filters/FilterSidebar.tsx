"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterState {
  gender: string[];
  season: string[];
  timeOfDay: string[];
  brands: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableBrands: string[];
  sortBy: string;
  onSortChange: (value: string) => void;
}

const genders = ["Male", "Female", "Unisex"];
const seasons = ["Spring", "Summer", "Fall", "Winter"];
const timeOfDay = ["Day", "Evening", "Night"];

export function FilterSidebar({ filters, onFilterChange, availableBrands, sortBy, onSortChange }: FilterSidebarProps) {
  const toggleFilter = (
    category: keyof FilterState,
    value: string
  ) => {
    const current = filters[category];
    const newFilters = { ...filters };
    
    if (current.includes(value)) {
      newFilters[category] = current.filter((v) => v !== value);
    } else {
      newFilters[category] = [...current, value];
    }
    
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({
      gender: [],
      season: [],
      timeOfDay: [],
      brands: [],
    });
  };

  const hasActiveFilters =
    filters.gender.length > 0 ||
    filters.season.length > 0 ||
    filters.timeOfDay.length > 0 ||
    filters.brands.length > 0;

  return (
    <div className="space-y-6 bg-[#0a0a0a]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Sort By */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase text-[#ff6b35]">Sort by</h4>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full border-[#2a2a2a] bg-[#141414] text-white focus:border-[#ff6b35]">
            <SelectValue placeholder="Most Popular" />
          </SelectTrigger>
          <SelectContent className="border-[#2a2a2a] bg-[#141414] text-white">
            <SelectItem value="most-popular">Most Popular</SelectItem>
            <SelectItem value="highest-rated">Highest Rated</SelectItem>
            <SelectItem value="biggest-projection">The Biggest Projection</SelectItem>
            <SelectItem value="longest-lasting">The Longest Lasting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gender Filter */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase text-[#ff6b35]">Gender</h4>
        <div className="space-y-2">
          {genders.map((gender) => (
            <label
              key={gender}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.gender.includes(gender)}
                onChange={() => toggleFilter("gender", gender)}
                className="appearance-none w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent cursor-pointer transition-all duration-200 checked:bg-orange-500 checked:border-orange-500 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 relative after:content-[''] after:absolute after:hidden after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 checked:after:block"
              />
              <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
                {gender}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Season Filter */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase text-[#ff6b35]">Season</h4>
        <div className="space-y-2">
          {seasons.map((season) => (
            <label
              key={season}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.season.includes(season)}
                onChange={() => toggleFilter("season", season)}
                className="appearance-none w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent cursor-pointer transition-all duration-200 checked:bg-orange-500 checked:border-orange-500 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 relative after:content-[''] after:absolute after:hidden after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 checked:after:block"
              />
              <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
                {season}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Time of Day Filter */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase text-[#ff6b35]">Time of Day</h4>
        <div className="space-y-2">
          {timeOfDay.map((time) => (
            <label
              key={time}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.timeOfDay.includes(time)}
                onChange={() => toggleFilter("timeOfDay", time)}
                className="appearance-none w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent cursor-pointer transition-all duration-200 checked:bg-orange-500 checked:border-orange-500 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 relative after:content-[''] after:absolute after:hidden after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 checked:after:block"
              />
              <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
                {time}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase text-[#ff6b35]">Brands</h4>
        <div className="space-y-2">
          {availableBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggleFilter("brands", brand)}
                className="appearance-none w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent cursor-pointer transition-all duration-200 checked:bg-orange-500 checked:border-orange-500 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 relative after:content-[''] after:absolute after:hidden after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 checked:after:block"
              />
              <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
