import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteArticle } from "@/app/admin/actions";
import { articleTypeConfigs } from "@/components/admin/ArticleTypeAdminPage";
import type { ArticleSummary } from "@/types/domain";

type AdminArticle = ArticleSummary & {
  _count: { products: number };
};

export default async function ArticlesPage() {
  await requireAdmin();
  const articles: AdminArticle[] = await getDb().article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: true, _count: { select: { products: true } } }
  });

  return (
    <AdminShell>
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-4xl font-bold">Articles</h1>
          <Link href="/admin/articles/new" className="btn-primary">Create article</Link>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          {Object.values(articleTypeConfigs).map((config) => (
            <Link key={config.href} href={config.href} className="rounded-lg border border-line bg-white p-4 hover:border-moss">
              <p className="text-sm font-semibold">{config.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/55">{config.description}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-lg border border-line bg-white p-5">
          <p className="eyebrow">Struktur Best Pick</p>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Best Pick memakai tipe artikel <strong>BEST_PICKS</strong>. Title/excerpt menjadi hero, content menjadi intro dan metodologi, sedangkan produk terkait menjadi quick picks dan ranked product list.
          </p>
        </div>

        <div className="card overflow-auto">
          <table className="w-full text-sm">
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-line">
                  <td className="p-3 font-semibold">
                    {article.title}
                    <p className="text-xs text-ink/55">{article.articleType}</p>
                    {article.articleType === "BEST_PICKS" ? (
                      <p className="mt-1 text-xs font-semibold text-moss">{article._count.products} produk untuk quick picks/ranking</p>
                    ) : null}
                  </td>
                  <td className="p-3">{article.isPublished ? "Published" : "Draft"}</td>
                  <td className="flex gap-2 p-3">
                    <Link className="btn-secondary py-1.5" href={`/admin/articles/${article.id}/edit`}>Edit</Link>
                    <form action={deleteArticle}>
                      <input type="hidden" name="id" value={article.id} />
                      <button className="btn-secondary py-1.5">Delete</button>
                    </form>
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
