import { cn } from "@/lib/utils";

export type Status = "live" | "review" | "draft" | "error";

const STYLES: Record<Status, string> = {
  live: "bg-accent-tint text-accent-dark",
  review: "bg-warn-tint text-warn",
  draft: "bg-neutral-100 text-neutral-600",
  error: "bg-red-50 text-error"
};

const LABELS: Record<Status, string> = {
  live: "Live",
  review: "Review",
  draft: "Draft",
  error: "Error"
};

export function StatusChip({ status, label, className }: { status: Status; label?: string; className?: string }) {
  return <span className={cn("badge", STYLES[status], className)}>{label ?? LABELS[status]}</span>;
}
