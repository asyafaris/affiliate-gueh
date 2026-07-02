"use client";

import { cn } from "@/lib/utils";

export type FilterOption = { id: string; label: string };

export function FilterChipBar({
  options,
  activeId,
  onChange,
  sortOptions,
  activeSortId,
  onSortChange,
  className
}: {
  options: FilterOption[];
  activeId: string;
  onChange: (id: string) => void;
  sortOptions?: FilterOption[];
  activeSortId?: string;
  onSortChange?: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.id === activeId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                active
                  ? "border-accent bg-accent-tint text-accent-dark"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {sortOptions && onSortChange ? (
        <select
          value={activeSortId}
          onChange={(event) => onSortChange(event.target.value)}
          className="rounded-control border-2 border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 outline-none focus:border-accent"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
