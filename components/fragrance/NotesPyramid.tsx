import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Droplet } from "lucide-react";

interface NotesPyramidProps {
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  className?: string;
}

export function NotesPyramid({ topNotes, middleNotes, baseNotes, className }: NotesPyramidProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Top Notes */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-[#ff6b35] flex items-center gap-2">
          <Droplet className="h-4 w-4" />
          Top Notes
        </h4>
        <div className="flex flex-wrap gap-2">
          {topNotes.map((note, index) => (
            <Badge key={index} variant="outline" className="text-xs border-[#ff6b35] text-white bg-[#1a1a1a]">
              {note}
            </Badge>
          ))}
        </div>
      </div>

      {/* Middle Notes */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-[#ff6b35] flex items-center gap-2">
          <Droplet className="h-4 w-4" />
          Middle Notes
        </h4>
        <div className="flex flex-wrap gap-2">
          {middleNotes.map((note, index) => (
            <Badge key={index} variant="outline" className="text-xs border-[#ff6b35] text-white bg-[#1a1a1a]">
              {note}
            </Badge>
          ))}
        </div>
      </div>

      {/* Base Notes */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-[#ff6b35] flex items-center gap-2">
          <Droplet className="h-4 w-4" />
          Base Notes
        </h4>
        <div className="flex flex-wrap gap-2">
          {baseNotes.map((note, index) => (
            <Badge key={index} variant="outline" className="text-xs border-[#ff6b35] text-white bg-[#1a1a1a]">
              {note}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
