"use client";

import { useRouter } from "next/navigation";
import { useFragrance } from "@/context/FragranceContext";
import { FragranceDetail } from "@/components/fragrance/FragranceDetail";

export default function FragranceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { getFragranceById, catalogLoading, catalogError } = useFragrance();
  const fragranceId = Number(id);

  if (!Number.isFinite(fragranceId)) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white">Fragrance not found</h1>
      </div>
    );
  }

  if (catalogLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white">Loading fragrance...</h1>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white">Failed to load fragrance</h1>
        <p className="mt-2 text-sm text-red-400">{catalogError}</p>
      </div>
    );
  }

  const fragrance = getFragranceById(fragranceId);

  if (!fragrance) {
    router.push("/");
    return null;
  }

  return <FragranceDetail fragrance={fragrance} />;
}
