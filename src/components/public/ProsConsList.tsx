import { Minus, Plus } from "lucide-react";

type Item = { type: "PRO" | "CON"; content: string };

export function ProsConsList({ items }: { items: Item[] }) {
  const pros = items.filter((item) => item.type === "PRO");
  const cons = items.filter((item) => item.type === "CON");
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="flex items-center gap-2 text-lg">
          <Plus className="h-4 w-4 text-accent-dark" /> Kelebihan
        </h3>
        <ul className="mt-3 grid gap-2.5">
          {pros.map((item) => (
            <li key={item.content} className="flex gap-2.5 text-sm leading-6 text-neutral-700">
              <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-accent-tint text-[10px] font-bold text-accent-dark">+</span>
              {item.content}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="flex items-center gap-2 text-lg">
          <Minus className="h-4 w-4 text-warn" /> Kekurangan
        </h3>
        <ul className="mt-3 grid gap-2.5">
          {cons.map((item) => (
            <li key={item.content} className="flex gap-2.5 text-sm leading-6 text-neutral-700">
              <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-warn-tint text-[10px] font-bold text-warn">−</span>
              {item.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
