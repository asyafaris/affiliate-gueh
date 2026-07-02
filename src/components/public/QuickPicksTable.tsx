import Link from "next/link";
import { PriceEstimate } from "@/components/public/PriceEstimate";

type Pick = { name: string; slug: string; bestFor: string; priceEstimate: number };

export function QuickPicksTable({ products }: { products: Pick[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="bg-ink text-left text-white">
          <tr>
            <th className="px-4 py-3">Produk</th>
            <th className="hidden px-4 py-3 md:table-cell">Paling cocok</th>
            <th className="px-4 py-3">Estimasi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.slug} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-semibold"><Link href={`/produk/${product.slug}`}>{product.name}</Link></td>
              <td className="hidden px-4 py-3 text-ink/70 md:table-cell">{product.bestFor}</td>
              <td className="px-4 py-3"><PriceEstimate value={product.priceEstimate} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
