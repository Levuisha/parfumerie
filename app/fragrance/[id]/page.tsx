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
  const { getFragranceById } = useFragrance();
  const fragrance = getFragranceById(Number(id));

  if (!fragrance) {
    router.push("/");
    return null;
  }

  return <FragranceDetail fragrance={fragrance} />;
}
