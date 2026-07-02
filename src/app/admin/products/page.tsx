import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteProduct } from "@/app/admin/actions";

type AdminProduct = {
  id: string;
  name: string;
  isPublished: boolean;
  isFeatured: boolean;
  category: { name: string };
  brand: { name: string };
};

export default async function ProductsAdminPage() {
  await requireAdmin();
  const products: AdminProduct[] = await getDb().product.findMany({ include: { category: true, brand: true }, orderBy: { updatedAt: "desc" } });
  return (
    <AdminShell>
      <div className="grid gap-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif text-4xl font-bold">Products</h1>
          <Link href="/admin/products/new" className="btn-primary">Create product</Link>
        </div>
        <div className="card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink text-left text-white"><tr><th className="p-3">Nama</th><th className="p-3">Kategori</th><th className="p-3">Status</th><th className="p-3">Aksi</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-line">
                  <td className="p-3 font-semibold">{product.name}<p className="text-xs text-ink/55">{product.brand.name}</p></td>
                  <td className="p-3">{product.category.name}</td>
                  <td className="p-3">{product.isPublished ? "Published" : "Draft"} {product.isFeatured ? "/ Featured" : ""}</td>
                  <td className="flex gap-2 p-3">
                    <Link className="btn-secondary py-1.5" href={`/admin/products/${product.id}/edit`}>Edit</Link>
                    <form action={deleteProduct}><input type="hidden" name="id" value={product.id} /><button className="btn-secondary py-1.5">Delete</button></form>
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
