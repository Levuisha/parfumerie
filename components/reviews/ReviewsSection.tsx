"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchReviewsForFragrance, ReviewRow } from "@/lib/reviews";

type ReviewsSectionProps = {
  fragranceId: number;
  refreshToken: number;
};

const formatDate = (value: string) => {
  try {
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

const initialsFrom = (name: string) => {
  return name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export function ReviewsSection({ fragranceId, refreshToken }: ReviewsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await fetchReviewsForFragrance(fragranceId);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error ?? "Failed to load reviews.");
        setReviews([]);
      } else {
        setReviews(result.data);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fragranceId, refreshToken]);

  const rendered = useMemo(() => {
    return reviews.map((review) => {
      const username = review.profiles?.username?.trim();
      const displayName = username || `User ${review.user_id.slice(0, 6)}`;
      const avatarUrl = review.profiles?.avatar_url ?? null;
      const initials = initialsFrom(displayName);
      return { ...review, displayName, avatarUrl, initials };
    });
  }, [reviews]);

  if (loading) {
    return <p className="text-sm text-[#a0a0a0]">Loading reviews…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (rendered.length === 0) {
    return <p className="text-sm text-[#a0a0a0]">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {rendered.map((review) => (
        <div
          key={review.id}
          className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-center text-sm font-semibold text-white">
              {review.avatarUrl ? (
                <img
                  src={review.avatarUrl}
                  alt={review.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{review.initials}</span>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{review.displayName}</p>
                <p className="text-xs text-[#a0a0a0]">{formatDate(review.created_at)}</p>
              </div>
              <p className="text-sm text-[#a0a0a0] whitespace-pre-wrap">{review.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
