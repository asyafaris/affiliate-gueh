import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { AffiliateButtonGroup } from "@/components/public/AffiliateButtonGroup";
import { ProsConsList } from "@/components/public/ProsConsList";
import { SpecsTable } from "@/components/public/SpecsTable";
import type { ComparisonProduct } from "@/types/domain";

export const dynamic = "force-dynamic";

async function getComparison(slug: string) {
  return getDb().article.findFirst({
    where: { slug, articleType: "COMPARISON" },
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
        take: 2,
        include: {
          product: { include: { brand: true, category: true, specs: { orderBy: { sortOrder: "asc" } }, prosCons: { orderBy: { sortOrder: "asc" } }, affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } } }
        }
      }
    }
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getComparison(slug);
  if (!article) return {};
  return buildMetadata({ title: article.title, description: article.excerpt, path: `/bandingkan/${slug}`, image: article.coverImageUrl });
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getComparison(slug);
  if (!article?.isPublished || article.products.length < 2) notFound();
  const [a, b] = (article.products as { product: ComparisonProduct }[]).map((item) => item.product);
  return (
    <>
      <Header />
      <main className="container-page grid gap-8 py-10">
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Bandingkan", href: "/" }, { label: article.title, href: `/bandingkan/${article.slug}` }]} />
        <header className="max-w-4xl">
          <p className="eyebrow">Perbandingan</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">{a.name} vs {b.name}</h1>
          <p className="mt-4 text-lg leading-8 text-ink/70">{article.excerpt}</p>
        </header>
        <section className="grid gap-4 md:grid-cols-2">
          {[a, b].map((product) => (
            <article key={product.slug} className="card p-5">
              <p className="eyebrow">{product.brand.name}</p>
              <h2 className="mt-2 font-serif text-3xl font-bold">{product.name}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/70">{product.editorialSummary}</p>
              <p className="mt-3 text-sm font-semibold text-moss">Menang untuk: {product.bestFor}</p>
              <div className="mt-5"><AffiliateButtonGroup links={product.affiliateLinks} sourcePageType="comparison" sourcePageSlug={article.slug} /></div>
            </article>
          ))}
        </section>
        <section className="grid gap-5 md:grid-cols-2">
          <div><h2 className="mb-3 font-serif text-2xl font-bold">Pros/cons {a.name}</h2><ProsConsList items={a.prosCons} /></div>
          <div><h2 className="mb-3 font-serif text-2xl font-bold">Pros/cons {b.name}</h2><ProsConsList items={b.prosCons} /></div>
        </section>
        <section className="grid gap-5 md:grid-cols-2">
          <div><h2 className="mb-3 font-serif text-2xl font-bold">Spesifikasi {a.name}</h2><SpecsTable specs={a.specs} /></div>
          <div><h2 className="mb-3 font-serif text-2xl font-bold">Spesifikasi {b.name}</h2><SpecsTable specs={b.specs} /></div>
        </section>
        <section className="card p-6">
          <h2 className="font-serif text-3xl font-bold">Verdict</h2>
          <p className="mt-3 leading-7 text-ink/72">
            Pilih {a.name} jika prioritas Anda adalah {a.bestFor.toLowerCase()}. Pilih {b.name} jika kebutuhan Anda lebih dekat dengan {b.bestFor.toLowerCase()}.
            Keduanya layak, tetapi keputusan terbaik tetap mengikuti masalah utama yang ingin Anda selesaikan.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
