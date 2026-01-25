"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFragrance } from "@/context/FragranceContext";
import { ShelfType } from "@/lib/types";
import { BookOpen, Heart, TestTube, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ShelfActionsProps {
  fragranceId: number;
  currentShelf: ShelfType;
}

export function ShelfActions({ fragranceId, currentShelf }: ShelfActionsProps) {
  const router = useRouter();
  const { addToShelf, removeFromShelf, isAuthenticated, authReady } = useFragrance();
  const [loading, setLoading] = useState<string | null>(null);

  const handleShelfAction = async (shelf: "owned" | "want" | "tested") => {
    // Wait for auth to be ready before allowing any action
    if (!authReady) {
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setLoading(shelf);
    try {
      const fragranceKey = String(fragranceId);
      if (currentShelf === shelf) {
        await removeFromShelf(fragranceKey);
      } else {
        await addToShelf(fragranceKey, shelf);
      }
    } finally {
      setLoading(null);
    }
  };

  const getButtonVariant = (shelf: "owned" | "want" | "tested") => {
    return currentShelf === shelf ? "default" : "outline";
  };

  const isDisabled = !authReady;

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={getButtonVariant("owned")}
        onClick={() => handleShelfAction("owned")}
        className="flex items-center gap-2"
        disabled={isDisabled || loading !== null}
      >
        {loading === "owned" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BookOpen className="h-4 w-4" />
        )}
        {currentShelf === "owned" ? "Remove from Owned" : "Add to Owned"}
      </Button>
      <Button
        variant={getButtonVariant("want")}
        onClick={() => handleShelfAction("want")}
        className="flex items-center gap-2"
        disabled={isDisabled || loading !== null}
      >
        {loading === "want" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
        {currentShelf === "want" ? "Remove from Want" : "Add to Want"}
      </Button>
      <Button
        variant={getButtonVariant("tested")}
        onClick={() => handleShelfAction("tested")}
        className="flex items-center gap-2"
        disabled={isDisabled || loading !== null}
      >
        {loading === "tested" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <TestTube className="h-4 w-4" />
        )}
        {currentShelf === "tested" ? "Remove from Tested" : "Add to Tested"}
      </Button>
    </div>
  );
}
