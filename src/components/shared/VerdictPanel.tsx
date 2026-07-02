import { cn } from "@/lib/utils";

export function VerdictPanel({
  eyebrow,
  score,
  headline,
  cta,
  className,
  children
}: {
  eyebrow?: string;
  score?: number | null;
  headline: string;
  cta?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-panel border border-accent-border bg-gradient-wash p-6", className)}>
      <div className="flex items-start gap-4">
        {typeof score === "number" ? (
          <div className="flex h-14 w-14 flex-none flex-col items-center justify-center rounded-full bg-primary text-white">
            <span className="text-lg font-bold leading-none">{score.toFixed(1)}</span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/70">skor</span>
          </div>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h3 className="mt-1 text-2xl font-bold leading-snug">{headline}</h3>
          {children ? <div className="mt-3 text-sm leading-7 text-neutral-700">{children}</div> : null}
          {cta ? <div className="mt-4">{cta}</div> : null}
        </div>
      </div>
    </div>
  );
}
