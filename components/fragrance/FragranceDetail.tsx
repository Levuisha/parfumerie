"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RatingDisplay } from "./RatingDisplay";
import { NotesPyramid } from "./NotesPyramid";
import { ShelfActions } from "./ShelfActions";
import { useFragrance } from "@/context/FragranceContext";
import { Fragrance } from "@/lib/types";
import { ArrowLeft, Star, Clock, Sparkles } from "lucide-react";

interface FragranceDetailProps {
  fragrance: Fragrance;
}

export function FragranceDetail({ fragrance }: FragranceDetailProps) {
  const { setRating, setReview, userRatings, userReviews } = useFragrance();
  const [rating, setRatingLocal] = useState<number>(
    userRatings.get(fragrance.id) ?? 5
  );
  const [review, setReviewLocal] = useState<string>(
    userReviews.get(fragrance.id) ?? ""
  );

  useEffect(() => {
    const savedRating = userRatings.get(fragrance.id);
    const savedReview = userReviews.get(fragrance.id);
    if (savedRating !== undefined) setRatingLocal(savedRating);
    if (savedReview) setReviewLocal(savedReview);
  }, [fragrance.id, userRatings, userReviews]);

  const handleRatingChange = (value: number[]) => {
    const newRating = value[0];
    setRatingLocal(newRating);
    setRating(fragrance.id, newRating);
  };

  const handleReviewChange = (value: string) => {
    setReviewLocal(value);
    setReview(fragrance.id, value);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-6 hover:text-[#ff6b35]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Section */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#1a1a1a]">
          <Image
            src={fragrance.image || "https://placehold.co/400x500/141414/ff6b35?text=Fragrance"}
            alt={`${fragrance.name} by ${fragrance.brand}`}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{fragrance.name}</h1>
            <p className="mt-1 text-xl text-[#ff6b35]">
              {fragrance.brand} • {fragrance.year}
            </p>
          </div>

          <p className="text-[#a0a0a0] leading-relaxed">{fragrance.description}</p>

          {/* Ratings */}
          <div className="space-y-4">
            <RatingDisplay label="Longevity" value={fragrance.longevity} />
            <RatingDisplay label="Sillage" value={fragrance.sillage} />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-sm font-medium text-[#a0a0a0]">Gender</p>
              <Badge variant="secondary">{fragrance.gender}</Badge>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-[#a0a0a0] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#ff6b35]" />
                Season
              </p>
              <div className="flex flex-wrap gap-2">
                {fragrance.season.map((s, i) => (
                  <Badge key={i} variant="outline" className="border-[#ff6b35] text-white bg-[#1a1a1a]">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-[#a0a0a0] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#ff6b35]" />
                Time of Day
              </p>
              <div className="flex flex-wrap gap-2">
                {fragrance.timeOfDay.map((t, i) => (
                  <Badge key={i} variant="outline" className="border-[#ff6b35] text-white bg-[#1a1a1a]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Shelf Actions */}
          <ShelfActions fragranceId={fragrance.id} currentShelf={fragrance.shelf ?? null} />

          {/* User Rating */}
          <div className="space-y-4 border-t border-[#2a2a2a] pt-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-[#a0a0a0]">
                  Your Rating
                </label>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[#ff6b35] text-[#ff6b35]" />
                  <span className="text-sm font-medium text-white">{rating}/10</span>
                </div>
              </div>
              <Slider
                value={[rating]}
                onValueChange={handleRatingChange}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#a0a0a0]">
                Your Review
              </label>
              <Textarea
                value={review}
                onChange={(e) => handleReviewChange(e.target.value)}
                placeholder="Share your thoughts about this fragrance..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-white">Fragrance Notes</h2>
        <NotesPyramid
          topNotes={fragrance.topNotes}
          middleNotes={fragrance.middleNotes}
          baseNotes={fragrance.baseNotes}
        />
      </div>
    </div>
  );
}
