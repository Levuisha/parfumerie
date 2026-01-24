"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  gender: string[];
  season: string[];
  timeOfDay: string[];
  notes: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableNotes: string[];
}

const genders = ["Masculine", "Feminine", "Unisex"];
const seasons = ["Spring", "Summer", "Fall", "Winter"];
const timeOfDay = ["Day", "Evening", "Night"];

export function FilterSidebar({ filters, onFilterChange, availableNotes }: FilterSidebarProps) {
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
      notes: [],
    });
  };

  const hasActiveFilters =
    filters.gender.length > 0 ||
    filters.season.length > 0 ||
    filters.timeOfDay.length > 0 ||
    filters.notes.length > 0;

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

      {/* Gender Filter */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase text-[#ff6b35]">Gender</h4>
        <div className="space-y-2">
          {genders.map((gender) => (
            <label
              key={gender}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.gender.includes(gender)}
                onChange={() => toggleFilter("gender", gender)}
                className="h-4 w-4 rounded border-[#2a2a2a] bg-[#141414] text-[#ff6b35] focus:ring-[#ff6b35] checked:bg-[#ff6b35] checked:border-[#ff6b35]"
              />
              <span className="text-sm text-[#a0a0a0]">{gender}</span>
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
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.season.includes(season)}
                onChange={() => toggleFilter("season", season)}
                className="h-4 w-4 rounded border-[#2a2a2a] bg-[#141414] text-[#ff6b35] focus:ring-[#ff6b35] checked:bg-[#ff6b35] checked:border-[#ff6b35]"
              />
              <span className="text-sm text-[#a0a0a0]">{season}</span>
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
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.timeOfDay.includes(time)}
                onChange={() => toggleFilter("timeOfDay", time)}
                className="h-4 w-4 rounded border-[#2a2a2a] bg-[#141414] text-[#ff6b35] focus:ring-[#ff6b35] checked:bg-[#ff6b35] checked:border-[#ff6b35]"
              />
              <span className="text-sm text-[#a0a0a0]">{time}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes Filter */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase text-[#ff6b35]">Notes</h4>
        <div className="flex flex-wrap gap-2">
          {availableNotes.slice(0, 20).map((note) => (
            <Badge
              key={note}
              variant={filters.notes.includes(note) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all duration-300",
                filters.notes.includes(note)
                  ? "hover:shadow-[0_0_8px_rgba(255,107,53,0.3)]"
                  : "hover:shadow-[0_0_8px_rgba(255,107,53,0.3)]"
              )}
              onClick={() => toggleFilter("notes", note)}
            >
              {note}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
