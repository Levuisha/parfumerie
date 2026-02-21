export interface Fragrance {
  id: number;
  name: string;
  brand: string;
  year: number;
  concentration?: string | null;
  gender: "Male" | "Female" | "Unisex";
  description: string;
  image: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  longevity: number; // 1-10
  sillage: number; // 1-10
  season: string[];
  timeOfDay: string[];
  userRating?: number | null;
  shelf?: "owned" | "want" | "tested" | null;
}

export type ShelfType = "owned" | "want" | "tested" | null;
