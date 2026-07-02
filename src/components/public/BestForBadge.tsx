import { Sparkles } from "lucide-react";

export function BestForBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-leaf/15 px-3 py-1 text-xs font-semibold text-moss">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}
