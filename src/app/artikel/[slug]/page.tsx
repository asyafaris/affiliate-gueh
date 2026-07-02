import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { ArticleBody } from "@/components/public/ArticleBody";
import { DisclosureBox } from "@/components/public/DisclosureBox";
import { MarkdownText } from "@/components/public/MarkdownText";
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
        include: { product: { include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } } } }
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
  return (
    <>
      <Header />
      <main className="container-page grid gap-8 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }} />
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Artikel", href: "/" }, { label: article.title, href: `/artikel/${article.slug}` }]} />
        <header className="max-w-4xl">
          <p className="eyebrow">{article.articleType.replace("_", " ")}</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">{article.title}</h1>
          <MarkdownText content={article.excerpt} className="mt-4 text-lg leading-8 text-ink/70 prose-p:m-0" />
          <p className="mt-4 text-sm text-ink/55">Oleh {article.author.name} / diperbarui {article.updatedAt.toLocaleDateString("id-ID")}</p>
        </header>
        {article.coverImageUrl ? (
          <div className="relative aspect-[16/7] overflow-hidden rounded-lg bg-line">
            <Image src={article.coverImageUrl} alt={article.title} fill priority className="object-cover" />
          </div>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <ArticleBody content={article.contentMd} products={products} />
          <aside className="grid content-start gap-4">
            <DisclosureBox />
            <div className="card p-5">
              <h2 className="font-semibold">Artikel terkait</h2>
              <div className="mt-3 grid gap-3 text-sm">
                {related.map((item) => <Link key={item.slug} href={`/artikel/${item.slug}`} className="hover:text-moss">{item.title}</Link>)}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
