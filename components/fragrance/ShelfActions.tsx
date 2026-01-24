"use client";

import { Button } from "@/components/ui/button";
import { useFragrance } from "@/context/FragranceContext";
import { ShelfType } from "@/lib/types";
import { BookOpen, Heart, TestTube } from "lucide-react";

interface ShelfActionsProps {
  fragranceId: number;
  currentShelf: ShelfType;
}

export function ShelfActions({ fragranceId, currentShelf }: ShelfActionsProps) {
  const { addToShelf, removeFromShelf } = useFragrance();

  const handleShelfAction = (shelf: "owned" | "want" | "tested") => {
    if (currentShelf === shelf) {
      removeFromShelf(fragranceId);
    } else {
      addToShelf(fragranceId, shelf);
    }
  };

  const getButtonVariant = (shelf: "owned" | "want" | "tested") => {
    return currentShelf === shelf ? "default" : "outline";
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={getButtonVariant("owned")}
        onClick={() => handleShelfAction("owned")}
        className="flex items-center gap-2"
      >
        <BookOpen className="h-4 w-4" />
        {currentShelf === "owned" ? "Remove from Owned" : "Add to Owned"}
      </Button>
      <Button
        variant={getButtonVariant("want")}
        onClick={() => handleShelfAction("want")}
        className="flex items-center gap-2"
      >
        <Heart className="h-4 w-4" />
        {currentShelf === "want" ? "Remove from Want" : "Add to Want"}
      </Button>
      <Button
        variant={getButtonVariant("tested")}
        onClick={() => handleShelfAction("tested")}
        className="flex items-center gap-2"
      >
        <TestTube className="h-4 w-4" />
        {currentShelf === "tested" ? "Remove from Tested" : "Add to Tested"}
      </Button>
    </div>
  );
}
