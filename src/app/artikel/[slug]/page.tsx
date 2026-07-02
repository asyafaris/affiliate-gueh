import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import { estimateReadTime } from "@/lib/utils";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { ArticleBody } from "@/components/public/ArticleBody";
import { ReadingProgressBar } from "@/components/public/ReadingProgressBar";
import { MarkdownText } from "@/components/public/MarkdownText";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import type { ArticleSummary, ProductCardData } from "@/types/domain";

export const dynamic = "force-dynamic";

type ArticlePlacement = {
  placementNote: string | null;
  product: ProductCardData;
};

async function getArticle(slug: string) {
  return getDb().article.findUnique({
    where: { slug },
    include: {
      author: true,
      products: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: {
            include: {
              brand: true,
              category: true,
              images: { where: { isPrimary: true }, take: 1 },
              affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 }
            }
          }
        }
      }
    }
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return buildMetadata({ title: article.title, description: article.excerpt, path: `/artikel/${slug}`, image: article.coverImageUrl });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article?.isPublished) notFound();
  const related: ArticleSummary[] = await getDb().article.findMany({ where: { isPublished: true, articleType: article.articleType, NOT: { id: article.id } }, take: 3 });
  const products = (article.products as ArticlePlacement[]).map((placement) => ({ ...placement.product, placementNote: placement.placementNote }));
  const readTime = estimateReadTime(article.contentMd);

  return (
    <>
      <Header />
      <ReadingProgressBar />
      <main className="container-page grid gap-8 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }} />
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Artikel", href: "/" }, { label: article.title, href: `/artikel/${article.slug}` }]} />
        <header className="max-w-4xl">
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-accent-tint text-accent-dark">{article.articleType.replace("_", " ")}</span>
            <span className="badge border border-neutral-200 bg-white text-neutral-600">✓ Diuji tim</span>
          </div>
          <h1 className="mt-4 max-w-[20ch] text-4xl leading-tight sm:text-5xl">{article.title}</h1>
          <MarkdownText content={article.excerpt} className="mt-4 text-lg leading-8 text-neutral-600 prose-p:m-0" />
          <div className="mt-5 flex items-center gap-3">
            <div className="relative h-10 w-10 flex-none overflow-hidden rounded-full bg-accent-tint">
              {article.author.avatarUrl ? (
                <Image src={article.author.avatarUrl} alt={article.author.name} fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-bold text-accent-dark">
                  {article.author.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-primary">
                {article.author.name}
                {article.author.title ? <span className="font-normal text-neutral-500"> · {article.author.title}</span> : null}
              </p>
              <p className="text-neutral-500">
                Diperbarui {article.updatedAt.toLocaleDateString("id-ID")} · {readTime} mnt baca
              </p>
            </div>
          </div>
        </header>
        {article.coverImageUrl ? (
          <div className="relative aspect-[16/7] overflow-hidden rounded-card border border-neutral-200">
            <Image src={article.coverImageUrl} alt={article.title} fill priority className="object-cover" />
          </div>
        ) : (
          <div className="relative aspect-[16/7] overflow-hidden rounded-card border border-neutral-200">
            <ImagePlaceholder label="cover 16:7" />
          </div>
        )}

        <ArticleBody content={article.contentMd} products={products} />

        {related.length ? (
          <section className="grid gap-4 border-t border-neutral-100 pt-8">
            <h2 className="text-2xl">Baca juga</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} href={`/artikel/${item.slug}`} className="card p-4 font-semibold hover:text-accent-dark">
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
