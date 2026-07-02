import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, brands] = await Promise.all([getDb().category.findMany(), getDb().brand.findMany()]);
  return (
    <AdminShell>
      <div className="card p-6">
        <h1 className="mb-5 text-4xl font-bold">Produk baru</h1>
        <ProductForm categories={categories} brands={brands} />
      </div>
    </AdminShell>
  );
}
