"use client";

import { FragranceGrid } from "@/components/fragrance/FragranceGrid";
import { useFragrance } from "@/context/FragranceContext";

export default function DiscoverPage() {
  const { fragrances } = useFragrance();
  // Show first 8 fragrances as mock recommendations
  const recommendations = fragrances.slice(0, 8);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          AI Recommendations Coming Soon
        </h1>
        <p className="text-lg text-[#a0a0a0] max-w-2xl mx-auto">
          Rate more fragrances to unlock personalized suggestions tailored to your preferences.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Featured Recommendations
        </h2>
        <FragranceGrid fragrances={recommendations} />
      </div>
    </div>
  );
}
