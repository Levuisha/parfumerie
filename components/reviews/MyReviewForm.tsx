"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { deleteMyReview, fetchMyReview, upsertMyReview } from "@/lib/reviews";

type MyReviewFormProps = {
  fragranceId: number;
  onUpdated: () => void;
};

export function MyReviewForm({ fragranceId, onUpdated }: MyReviewFormProps) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const { supabase } = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        setIsLoggedIn(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!data.user) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      const result = await fetchMyReview(fragranceId);
      if (cancelled) return;
      if (result.ok && result.data) {
        setReviewId(result.data.id);
        setText(result.data.text);
      } else {
        setReviewId(null);
        setText("");
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fragranceId]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = text.trim();
    if (trimmed.length < 10) {
      setErrorMessage("Review must be at least 10 characters.");
      return;
    }
    if (trimmed.length > 1000) {
      setErrorMessage("Review must be 1000 characters or less.");
      return;
    }

    setSubmitting(true);
    const result = await upsertMyReview(fragranceId, trimmed);
    setSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.error ?? "Failed to post review.");
      return;
    }

    setSuccessMessage(reviewId ? "Review updated." : "Review posted.");
    onUpdated();
  };

  const handleDelete = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);
    const result = await deleteMyReview(fragranceId);
    setSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.error ?? "Failed to delete review.");
      return;
    }

    setReviewId(null);
    setText("");
    setSuccessMessage("Review deleted.");
    onUpdated();
  };

  if (loading) {
    return <p className="text-sm text-[#a0a0a0]">Loading your review…</p>;
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4">
        <p className="text-sm text-[#a0a0a0]">Log in to write a review.</p>
        <Link href="/auth/login" className="text-sm text-[#ff6b35] hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Share your thoughts about this fragrance..."
        className="min-h-[120px]"
      />
      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
      {successMessage && <p className="text-sm text-amber-400">{successMessage}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={submitting}>
          {reviewId ? "Update review" : "Post review"}
        </Button>
        {reviewId && (
          <Button variant="outline" onClick={handleDelete} disabled={submitting}>
            Delete review
          </Button>
        )}
      </div>
    </div>
  );
}
