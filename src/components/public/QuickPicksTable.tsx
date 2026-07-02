import Link from "next/link";
import { PriceEstimate } from "@/components/public/PriceEstimate";

type Pick = { name: string; slug: string; bestFor: string; priceEstimate: number };

export function QuickPicksTable({ products }: { products: Pick[] }) {
  return (
    <div className="overflow-hidden rounded-card border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Paling cocok</th>
            <th className="px-4 py-3 font-semibold">Estimasi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.slug} className="border-t border-neutral-100 hover:bg-neutral-50">
              <td className="px-4 py-3 font-semibold text-primary"><Link href={`/produk/${product.slug}`}>{product.name}</Link></td>
              <td className="hidden px-4 py-3 text-neutral-600 md:table-cell">{product.bestFor}</td>
              <td className="px-4 py-3"><PriceEstimate value={product.priceEstimate} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
