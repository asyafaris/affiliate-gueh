import { cn } from "@/lib/utils";

export type BadgeVariant = "tested" | "best" | "discount" | "category" | "budget" | "rating" | "neutral" | "accent";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  tested: "bg-accent-tint text-accent-dark",
  best: "rounded-full bg-primary text-white",
  discount: "rounded-lg bg-accent-dark text-white",
  category: "bg-neutral-100 text-neutral-600",
  budget: "bg-warn-tint text-warn",
  rating: "border border-neutral-200 bg-white text-neutral-700",
  neutral: "bg-neutral-100 text-neutral-600",
  accent: "bg-accent-tint text-accent-dark"
};

export function Badge({
  variant = "neutral",
  className,
  children
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={cn("badge", VARIANT_CLASSES[variant], className)}>{children}</span>;
}
