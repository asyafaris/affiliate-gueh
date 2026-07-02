import { ProductCard } from "@/components/public/ProductCard";

type GridProduct = Parameters<typeof ProductCard>[0]["product"];

export function ProductGrid({ products }: { products: GridProduct[] }) {
  if (!products.length) {
    return (
      <div className="rounded-card border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
        Belum ada produk yang cocok dengan filter ini.
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
