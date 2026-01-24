"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFragrance } from "@/context/FragranceContext";
import { ReactNode } from "react";

interface ShelfTabsProps {
  ownedContent: ReactNode;
  wantContent: ReactNode;
  testedContent: ReactNode;
}

export function ShelfTabs({ ownedContent, wantContent, testedContent }: ShelfTabsProps) {
  const { getFragrancesByShelf } = useFragrance();
  
  const ownedCount = getFragrancesByShelf("owned").length;
  const wantCount = getFragrancesByShelf("want").length;
  const testedCount = getFragrancesByShelf("tested").length;

  return (
    <Tabs defaultValue="owned" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="owned">
          Owned {ownedCount > 0 && `(${ownedCount})`}
        </TabsTrigger>
        <TabsTrigger value="want">
          Want {wantCount > 0 && `(${wantCount})`}
        </TabsTrigger>
        <TabsTrigger value="tested">
          Tested {testedCount > 0 && `(${testedCount})`}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="owned" className="mt-6">
        {ownedContent}
      </TabsContent>
      <TabsContent value="want" className="mt-6">
        {wantContent}
      </TabsContent>
      <TabsContent value="tested" className="mt-6">
        {testedContent}
      </TabsContent>
    </Tabs>
  );
}
