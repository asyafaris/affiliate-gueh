import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, GitCompare, Sparkles } from "lucide-react";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { MarkdownText } from "@/components/public/MarkdownText";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Best Pick worthgoods",
  description: "Kumpulan rekomendasi produk berdasarkan tema kebutuhan seperti kerja remote, setup minimalis, produktivitas harian, dan WFH hemat.",
  path: "/best"
});

type BestArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  products: { product: { category: { name: string }; bestFor: string } }[];
  _count: { products: number };
};

const methodology = [
  "Dimulai dari kebutuhan pengguna, bukan urutan produk yang sedang ramai.",
  "Menimbang fungsi, kenyamanan, estimasi harga, dan kompromi yang realistis.",
  "Mengutamakan sumber pembelian yang lebih aman jika informasinya tersedia."
];

export default async function BestIndexPage() {
  const collections: BestArticle[] = await getDb().article.findMany({
    where: { isPublished: true, articleType: "BEST_PICKS" },
    include: {
      _count: { select: { products: true } },
      products: {
        orderBy: { sortOrder: "asc" },
        take: 3,
        include: { product: { include: { category: true } } }
      }
    },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-neutral-100 bg-gradient-wash">
          <div className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="eyebrow">Best Pick</p>
              <h1 className="mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl">
                Pilihan produk berdasarkan kebutuhan, bukan sekadar hype.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-600">
                Koleksi rekomendasi disusun dari fungsi, kenyamanan, estimasi harga, reputasi sumber pembelian, dan kecocokan untuk use case harian.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#koleksi" className="btn-primary">Lihat koleksi</Link>
                <Link href="/bandingkan" className="btn-secondary">Bandingkan produk</Link>
              </div>
            </div>
            <div className="card p-5">
              <p className="eyebrow">Cara membaca Best Pick</p>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-neutral-600">
                <p>Mulai dari kebutuhan utama, lalu cek pros, cons, estimasi harga, dan catatan paling cocok untuk siapa.</p>
                <p>Urutan tidak selalu mengikuti harga termurah. Value dan kompromi tetap dipertimbangkan.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-12">
          <div className="mb-6">
            <p className="eyebrow">Koleksi dari CMS</p>
            <h2 className="text-3xl">Pilih Best Pick yang sudah dikurasi</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((article) => (
              <Link key={article.slug} href={`/best/${article.slug}`} className="card flex min-h-48 flex-col justify-between overflow-hidden">
                <div className="relative aspect-[16/8]">
                  {article.coverImageUrl ? (
                    <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 50vw" />
                  ) : (
                    <div className="image-placeholder h-full w-full"><Sparkles className="h-6 w-6 text-neutral-400" /></div>
                  )}
                </div>
                <div className="p-5">
                  <p className="eyebrow">{article.products[0]?.product.category.name ?? "Best Pick"}</p>
                  <h3 className="mt-2 line-clamp-2 text-2xl leading-tight">{article.title}</h3>
                  <p className="mt-3 text-xs font-semibold text-neutral-400">{article._count.products} produk dalam koleksi</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="eyebrow">Metodologi</p>
              <h2 className="mt-2 text-4xl">Best Pick disusun seperti panduan belanja, bukan daftar promo.</h2>
              <p className="mt-4 text-lg leading-8 text-neutral-600">
                Setiap koleksi membantu kamu melihat produk yang paling relevan untuk satu kebutuhan spesifik, lengkap dengan alasan, pros/cons, dan estimasi harga.
              </p>
            </div>
            <div className="grid gap-3">
              {methodology.map((item) => (
                <p key={item} className="flex gap-3 rounded-control bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section id="koleksi" className="container-page py-12">
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Koleksi editorial</p>
                <h2 className="text-3xl">Featured Best Pick</h2>
              </div>
              <Link href="/bandingkan" className="btn-secondary">
                Bandingkan sebelum beli <GitCompare className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {collections.map((article) => (
                <Link key={article.slug} href={`/best/${article.slug}`} className="card block overflow-hidden">
                  <div className="relative aspect-[16/7]">
                    {article.coverImageUrl ? (
                      <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
                    ) : (
                      <div className="image-placeholder h-full w-full px-5 text-center">Kurasi berdasarkan fungsi dan value</div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="eyebrow">{article.products[0]?.product.category.name ?? "Best Pick"}</p>
                    <h3 className="mt-2 text-2xl">{article.title}</h3>
                    <MarkdownText content={article.excerpt} className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600 prose-p:m-0" />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {article.products.slice(0, 3).map((item) => (
                        <span key={item.product.bestFor} className="badge bg-accent-tint text-accent-dark">
                          {item.product.bestFor}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                      <span className="text-neutral-400">{article._count.products} produk utama</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-accent-dark">
                        Buka koleksi <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
