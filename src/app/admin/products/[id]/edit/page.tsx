import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { parseEvidenceStats } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { SeoMetadataForm } from "@/components/admin/SeoMetadataForm";
import { ExpertSourceForm } from "@/components/admin/ExpertSourceForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories, brands, seoMeta] = await Promise.all([
    getDb().product.findUnique({ where: { id }, include: { images: true, specs: true, prosCons: true, expertSources: { orderBy: { addedAt: "desc" } } } }),
    getDb().category.findMany(),
    getDb().brand.findMany(),
    getDb().seoMetadata.findUnique({ where: { subjectType_subjectId: { subjectType: "product", subjectId: id } } })
  ]);
  if (!product) notFound();
  return (
    <AdminShell>
      <div className="card p-6">
        <h1 className="mb-5 text-4xl">Edit produk</h1>
        <ProductForm product={{ ...product, evidenceStats: parseEvidenceStats(product.evidenceStats) }} categories={categories} brands={brands} />
      </div>
      <section className="mt-8 border-t border-neutral-200 pt-8">
        <h2 className="mb-4 text-2xl">SEO & Social Preview</h2>
        <SeoMetadataForm
          productId={product.id}
          productName={product.name}
          currentData={seoMeta ?? undefined}
        />
      </section>
      <section className="mt-8 border-t border-neutral-200 pt-8">
        <h2 className="mb-4 text-2xl">Expert Sources</h2>
        <ExpertSourceForm productId={product.id} expertSources={product.expertSources} />
      </section>
    </AdminShell>
  );
}
