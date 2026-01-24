import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  label: string;
  value: number;
  max?: number;
  className?: string;
}

export function RatingDisplay({ label, value, max = 10, className }: RatingDisplayProps) {
  const percentage = (value / max) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[#a0a0a0]">{label}</span>
        <span className="text-white">{value}/{max}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
        <div
          className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
