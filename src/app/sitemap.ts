import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";
import type { ArticleType } from "@/types/domain";

export const dynamic = "force-dynamic";

type SitemapItem = { slug: string; updatedAt: Date };
type SitemapArticle = SitemapItem & { articleType: ArticleType };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();
  const [products, categories, articles]: [SitemapItem[], SitemapItem[], SitemapArticle[]] = await Promise.all([
    db.product.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true, updatedAt: true } }),
    db.article.findMany({ where: { isPublished: true }, select: { slug: true, articleType: true, updatedAt: true } })
  ]);
  const articlePath = (type: string, slug: string) => type === "BEST_PICKS" ? `/best/${slug}` : type === "COMPARISON" ? `/bandingkan/${slug}` : `/artikel/${slug}`;
  return [
    { url: absoluteUrl("/"), lastModified: new Date() },
    { url: absoluteUrl("/tentang"), lastModified: new Date() },
    { url: absoluteUrl("/affiliate-disclosure"), lastModified: new Date() },
    ...categories.map((item) => ({ url: absoluteUrl(`/kategori/${item.slug}`), lastModified: item.updatedAt })),
    ...products.map((item) => ({ url: absoluteUrl(`/produk/${item.slug}`), lastModified: item.updatedAt })),
    ...articles.map((item) => ({ url: absoluteUrl(articlePath(item.articleType, item.slug)), lastModified: item.updatedAt }))
  ];
}
