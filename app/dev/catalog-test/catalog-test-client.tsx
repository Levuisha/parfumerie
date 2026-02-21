"use client";

import { useEffect, useState } from "react";
import { fetchCatalogFragrances } from "@/lib/catalog";

type Status =
  | { state: "idle" | "loading" }
  | { state: "error"; message: string }
  | { state: "success"; count: number; preview: string[] };

export default function CatalogTestClient() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  useEffect(() => {
    let cancelled = false;

    async function runTest() {
      setStatus({ state: "loading" });
      const result = await fetchCatalogFragrances();
      if (cancelled) return;

      if (result.error) {
        setStatus({ state: "error", message: result.error });
        return;
      }

      const preview = result.data.slice(0, 5).map((item) => `${item.name} — ${item.brand.name}`);
      setStatus({ state: "success", count: result.data.length, preview });
    }

    runTest();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.state === "loading" || status.state === "idle") {
    return <p className="text-sm text-[#a0a0a0]">Loading catalog...</p>;
  }

  if (status.state === "error") {
    return <p className="text-sm text-red-400">Catalog error: {status.message}</p>;
  }

  return (
    <div className="space-y-3 text-sm text-[#a0a0a0]">
      <div>
        <span className="text-white font-medium">Count:</span> {status.count}
      </div>
      <div>
        <span className="text-white font-medium">Preview:</span>
        <ul className="mt-2 space-y-1">
          {status.preview.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
