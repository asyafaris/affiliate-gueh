type Item = { type: "PRO" | "CON"; content: string };

export function ProsConsList({ items }: { items: Item[] }) {
  const pros = items.filter((item) => item.type === "PRO");
  const cons = items.filter((item) => item.type === "CON");
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-leaf/30 bg-leaf/10 p-4">
        <h3 className="font-semibold text-moss">Kelebihan</h3>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink/75">
          {pros.map((item) => <li key={item.content}>+ {item.content}</li>)}
        </ul>
      </div>
      <div className="rounded-lg border border-clay/30 bg-clay/10 p-4">
        <h3 className="font-semibold text-clay">Kekurangan</h3>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink/75">
          {cons.map((item) => <li key={item.content}>- {item.content}</li>)}
        </ul>
      </div>
    </div>
  );
}
