import { cn } from "@/lib/utils";

export type MatrixProduct = {
  id: string;
  name: string;
  priceEstimate: number;
  prosCons?: { type: "PRO" | "CON" }[];
  specs: { label: string; value: string }[];
};

function pickWinnerId(products: MatrixProduct[]) {
  if (products.length < 2) return undefined;
  const scored = products.map((product) => ({
    id: product.id,
    score:
      (product.prosCons?.filter((item) => item.type === "PRO").length ?? 0) -
      (product.prosCons?.filter((item) => item.type === "CON").length ?? 0),
    price: product.priceEstimate
  }));
  scored.sort((a, b) => b.score - a.score || a.price - b.price);
  return scored[0]?.id;
}

export function FeatureMatrix({ products }: { products: MatrixProduct[] }) {
  const labels = [...new Set(products.flatMap((product) => product.specs.map((spec) => spec.label)))];
  const winnerId = pickWinnerId(products);

  if (!labels.length) {
    return <p className="text-sm text-neutral-500">Spesifikasi belum tersedia.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-neutral-200">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="bg-neutral-50 text-left">
            <th className="sticky left-0 z-10 w-[180px] bg-neutral-50 px-4 py-3 font-semibold text-neutral-500">Spesifikasi</th>
            {products.map((product) => (
              <th
                key={product.id}
                className={cn(
                  "px-4 py-3 font-semibold text-primary",
                  product.id === winnerId && "border-t-4 border-accent bg-accent-wash"
                )}
              >
                {product.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label) => (
            <tr key={label} className="border-t border-neutral-100 hover:bg-neutral-50">
              <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-semibold text-neutral-700">{label}</th>
              {products.map((product) => (
                <td
                  key={product.id}
                  className={cn("px-4 py-3 text-neutral-600", product.id === winnerId && "bg-accent-wash")}
                >
                  {product.specs.find((spec) => spec.label === label)?.value ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
