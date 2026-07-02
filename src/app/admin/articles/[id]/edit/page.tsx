import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function EditArticlePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const { id } = await params;
  const search = await searchParams;
  const returnTo = search.returnTo?.startsWith("/admin/") ? search.returnTo : undefined;
  const [article, products] = await Promise.all([
    getDb().article.findUnique({ where: { id }, include: { products: true } }),
    getDb().product.findMany({ include: { brand: true, category: true }, orderBy: { name: "asc" } })
  ]);
  if (!article) notFound();
  return <AdminShell><div className="card p-6"><h1 className="mb-5 text-4xl font-bold">Edit artikel</h1><ArticleForm article={article} products={products} returnTo={returnTo} /></div></AdminShell>;
}
