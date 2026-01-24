"use client";

import { ShelfTabs } from "@/components/shelves/ShelfTabs";
import { ShelfGrid } from "@/components/shelves/ShelfGrid";

export default function ShelvesPage() {
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
