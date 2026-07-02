import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteProduct } from "@/app/admin/actions";
import { StatusChip } from "@/components/shared/StatusChip";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { cn } from "@/lib/utils";

type AdminProduct = {
  id: string;
  name: string;
  isPublished: boolean;
  isFeatured: boolean;
  score: number | null;
  category: { name: string };
  brand: { name: string };
  images: { imageUrl: string; altText: string }[];
};

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "live", label: "Live" },
  { id: "draft", label: "Draft" }
] as const;

export default async function ProductsAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const search = await searchParams;
  const activeFilter = search.status === "live" || search.status === "draft" ? search.status : "all";
  const products: AdminProduct[] = await getDb().product.findMany({
    where: activeFilter === "all" ? undefined : { isPublished: activeFilter === "live" },
    include: { category: true, brand: true, images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { updatedAt: "desc" }
  });
  return (
    <AdminShell>
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl">Products</h1>
          <Link href="/admin/products/new" className="btn-primary">Create product</Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <Link
              key={filter.id}
              href={filter.id === "all" ? "/admin/products" : `/admin/products?status=${filter.id}`}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                activeFilter === filter.id ? "border-accent bg-accent-tint text-accent-dark" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              )}
            >
              {filter.label}
            </Link>
          ))}
          <span className="text-sm text-neutral-400">{products.length} produk</span>
        </div>
        <div className="card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="p-3 font-semibold">Produk</th>
                <th className="p-3 font-semibold">Kategori</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="flex items-center gap-3 p-3">
                    <div className="relative h-10 w-10 flex-none overflow-hidden rounded-control">
                      {product.images[0] ? (
                        <Image src={product.images[0].imageUrl} alt={product.images[0].altText} fill className="object-cover" />
                      ) : (
                        <ImagePlaceholder label="" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-primary">{product.name}</p>
                      <p className="text-xs text-neutral-500">
                        {product.brand.name}
                        {typeof product.score === "number" ? ` · skor ${product.score.toFixed(1)}` : ""}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 text-neutral-600">{product.category.name}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <StatusChip status={product.isPublished ? "live" : "draft"} />
                      {product.isFeatured ? <StatusChip status="review" label="Featured" /> : null}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link className="btn-ghost px-3 py-1.5" href={`/admin/products/${product.id}/edit`}>Edit</Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button className="btn-ghost px-3 py-1.5 text-error">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
