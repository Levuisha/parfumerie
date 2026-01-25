"use client";

import Link from "next/link";
import { ShelfTabs } from "@/components/shelves/ShelfTabs";
import { ShelfGrid } from "@/components/shelves/ShelfGrid";
import { Button } from "@/components/ui/button";
import { useFragrance } from "@/context/FragranceContext";

export default function ShelvesPage() {
  const { isAuthenticated, authReady } = useFragrance();

  if (authReady && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Shelves</h1>
          <p className="text-[#a0a0a0]">Manage your fragrance collection</p>
        </div>
        <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-6 text-center">
          <p className="text-sm text-[#a0a0a0]">
            Please log in to view your shelves.
          </p>
          <Link href="/auth/login">
            <Button className="mt-4">Log in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Shelves</h1>
        <p className="text-[#a0a0a0]">Manage your fragrance collection</p>
      </div>

      <ShelfTabs
        ownedContent={<ShelfGrid shelf="owned" />}
        wantContent={<ShelfGrid shelf="want" />}
        testedContent={<ShelfGrid shelf="tested" />}
      />
    </div>
  );
}
