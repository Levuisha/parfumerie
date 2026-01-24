"use client";

import { FragranceGrid } from "@/components/fragrance/FragranceGrid";
import { useFragrance } from "@/context/FragranceContext";
import { ShelfType } from "@/lib/types";

interface ShelfGridProps {
  shelf: ShelfType;
}

export function ShelfGrid({ shelf }: ShelfGridProps) {
  const { getFragrancesByShelf, removeFromShelf } = useFragrance();
  const fragrances = shelf ? getFragrancesByShelf(shelf) : [];

  if (fragrances.length === 0) {
    const messages = {
      owned: "Your shelf is empty - start exploring!",
      want: "No fragrances in your want list yet.",
      tested: "You haven't tested any fragrances yet.",
    };
    
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-white">
          {shelf ? messages[shelf] : "No fragrances found"}
        </p>
        <p className="mt-2 text-sm text-[#a0a0a0]">
          Browse fragrances and add them to your collection
        </p>
      </div>
    );
  }

  return (
    <FragranceGrid
      fragrances={fragrances}
      showUserRating={true}
      onRemove={(id) => removeFromShelf(id)}
    />
  );
}
