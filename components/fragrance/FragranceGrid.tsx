"use client";

import { FragranceCard } from "./FragranceCard";
import { Fragrance } from "@/lib/types";

interface FragranceGridProps {
  fragrances: Fragrance[];
  showUserRating?: boolean;
  onRemove?: (id: number) => void;
}

export function FragranceGrid({ fragrances, showUserRating = false, onRemove }: FragranceGridProps) {
  if (fragrances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-white">No fragrances found</p>
        <p className="mt-2 text-sm text-[#a0a0a0]">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {fragrances.map((fragrance) => (
        <FragranceCard
          key={fragrance.id}
          fragrance={fragrance}
          showUserRating={showUserRating}
          onRemove={onRemove ? () => onRemove(fragrance.id) : undefined}
        />
      ))}
    </div>
  );
}
