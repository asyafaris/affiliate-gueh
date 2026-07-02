import { cn } from "@/lib/utils";

export function ImagePlaceholder({ label = "gambar", className }: { label?: string; className?: string }) {
  return <div className={cn("image-placeholder h-full w-full", className)}>{label}</div>;
}
