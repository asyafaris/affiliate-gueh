import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { ARTICLE_TYPES, type ArticleType } from "@/types/domain";

function getArticleType(value?: string): ArticleType | undefined {
  return ARTICLE_TYPES.includes(value as ArticleType) ? value as ArticleType : undefined;
}

export default async function NewArticlePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const search = await searchParams;
  const defaultType = getArticleType(search.type);
  const returnTo = search.returnTo?.startsWith("/admin/") ? search.returnTo : undefined;
  const products = await getDb().product.findMany({ include: { brand: true, category: true }, orderBy: { name: "asc" } });
  return <AdminShell><div className="card p-6"><h1 className="mb-5 font-serif text-4xl font-bold">Artikel baru</h1><ArticleForm products={products} defaultType={defaultType} lockedType={defaultType} returnTo={returnTo} /></div></AdminShell>;
}
