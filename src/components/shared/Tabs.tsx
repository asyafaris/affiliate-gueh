"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type TabPanel = { id: string; label: string; content: React.ReactNode };

export function Tabs({
  panels,
  defaultTabId,
  className
}: {
  panels: TabPanel[];
  defaultTabId?: string;
  className?: string;
}) {
  const [active, setActive] = useState(defaultTabId ?? panels[0]?.id ?? "");

  return (
    <div className={className}>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-neutral-200">
        {panels.map((panel) => (
          <button
            key={panel.id}
            type="button"
            role="tab"
            aria-selected={active === panel.id}
            onClick={() => setActive(panel.id)}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-bold transition",
              active === panel.id ? "border-accent text-accent-dark" : "border-transparent text-neutral-500 hover:text-primary"
            )}
          >
            {panel.label}
          </button>
        ))}
      </div>
      <div className="pt-5">{panels.find((panel) => panel.id === active)?.content}</div>
    </div>
  );
}
