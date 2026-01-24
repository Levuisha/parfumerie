"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { RatingDisplay } from "./RatingDisplay";
import { Fragrance } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Star, Flame } from "lucide-react";

interface FragranceCardProps {
  fragrance: Fragrance;
  showUserRating?: boolean;
  onRemove?: () => void;
}

export function FragranceCard({ fragrance, showUserRating = false, onRemove }: FragranceCardProps) {
  return (
    <Link href={`/fragrance/${fragrance.id}`}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(255,107,53,0.2)] hover:border-[#ff6b35] cursor-pointer border-[#2a2a2a]">
        <div className="relative aspect-square w-full overflow-hidden bg-[#1a1a1a]">
          <Image
            src={fragrance.image || "https://placehold.co/400x500/141414/ff6b35?text=Fragrance"}
            alt={`${fragrance.name} by ${fragrance.brand}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(255,107,53,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 space-y-2">
          <div>
            <h3 className="font-semibold text-white line-clamp-1">{fragrance.name}</h3>
            <p className="text-sm text-[#ff6b35]">{fragrance.brand}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-3 w-3 text-[#ff6b35]" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#a0a0a0]">Longevity</span>
                  <span className="text-white font-medium">{fragrance.longevity}/10</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] transition-all duration-300"
                    style={{ width: `${(fragrance.longevity / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-3 w-3 text-[#ff6b35]" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#a0a0a0]">Sillage</span>
                  <span className="text-white font-medium">{fragrance.sillage}/10</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] transition-all duration-300"
                    style={{ width: `${(fragrance.sillage / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          {showUserRating && fragrance.userRating && (
            <div className="flex items-center gap-1 pt-2 border-t border-[#2a2a2a]">
              <Star className="h-4 w-4 fill-[#ff6b35] text-[#ff6b35]" />
              <span className="text-sm font-medium text-white">
                Your Rating: {fragrance.userRating}/10
              </span>
            </div>
          )}
        </div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
            aria-label="Remove from shelf"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </Card>
    </Link>
  );
}
