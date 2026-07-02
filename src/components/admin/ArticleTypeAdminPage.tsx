import Link from "next/link";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteArticle } from "@/app/admin/actions";
import type { ArticleType } from "@/types/domain";

type ArticleTypeConfig = {
  type: ArticleType;
  title: string;
  description: string;
  href: string;
  newLabel: string;
  structure: { label: string; description: string }[];
};

type TypeArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  isPublished: boolean;
  updatedAt: Date;
  _count: { products: number };
};

export const articleTypeConfigs: Record<string, ArticleTypeConfig> = {
  bestPicks: {
    type: "BEST_PICKS",
    title: "Best Pick",
    href: "/admin/best-picks",
    newLabel: "Buat Best Pick",
    description: "Kelola koleksi rekomendasi berbasis kebutuhan. Produk terkait menjadi quick picks dan ranking di halaman publik.",
    structure: [
      { label: "Hero", description: "Title, excerpt, dan cover image menjadi heading koleksi." },
      { label: "Metodologi", description: "Content menjelaskan kriteria kurasi dan konteks kebutuhan." },
      { label: "Ranking", description: "Produk terkait menjadi urutan rekomendasi dan quick picks." }
    ]
  },
  guides: {
    type: "GUIDE",
    title: "Guide",
    href: "/admin/guides",
    newLabel: "Buat Guide",
    description: "Kelola panduan membeli, cara memilih, dan edukasi sebelum pembaca membeli produk.",
    structure: [
      { label: "Masalah pembaca", description: "Jelaskan konteks dan kebutuhan utama." },
      { label: "Kriteria memilih", description: "Gunakan heading, list, quote, dan gambar per poin." },
      { label: "Produk terkait", description: "Hubungkan produk jika panduan menyebut rekomendasi spesifik." }
    ]
  },
  reviews: {
    type: "REVIEW",
    title: "Review",
    href: "/admin/reviews",
    newLabel: "Buat Review",
    description: "Kelola review produk atau kategori dengan ringkasan editorial, konteks pemakaian, dan produk terkait.",
    structure: [
      { label: "Ringkasan review", description: "Excerpt menjadi verdict pendek di heading." },
      { label: "Pembahasan", description: "Content memuat pengalaman, spesifikasi, pros/cons, dan gambar." },
      { label: "Produk utama", description: "Pilih produk terkait agar muncul di konten publik." }
    ]
  },
  tips: {
    type: "TIPS",
    title: "Tips",
    href: "/admin/tips",
    newLabel: "Buat Tips",
    description: "Kelola tips singkat, checklist, dan trik praktis untuk setup kerja atau belanja lebih aman.",
    structure: [
      { label: "Tips utama", description: "Buat poin-poin yang mudah dipindai." },
      { label: "Gambar per poin", description: "Tambahkan gambar Markdown di bawah poin penting." },
      { label: "CTA halus", description: "Hubungkan produk hanya jika relevan dengan tips." }
    ]
  },
  comparisons: {
    type: "COMPARISON",
    title: "Comparison",
    href: "/admin/comparisons",
    newLabel: "Buat Comparison",
    description: "Kelola artikel perbandingan editorial untuk route /bandingkan/[slug].",
    structure: [
      { label: "Produk dibandingkan", description: "Pilih dua atau lebih produk terkait sebagai bahan comparison." },
      { label: "Perbedaan utama", description: "Content menjelaskan harga, spesifikasi, pros/cons, dan use case." },
      { label: "Verdict", description: "Tulis rekomendasi akhir secara jujur tanpa klaim berlebihan." }
    ]
  }
};

export async function ArticleTypeAdminPage({ config }: { config: ArticleTypeConfig }) {
  const articles: TypeArticle[] = await getDb().article.findMany({
    where: { articleType: config.type },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { products: true } } }
  });

  return (
    <AdminShell>
      <div className="grid gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Manage {config.title}</p>
            <h1 className="font-serif text-4xl font-bold">{config.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{config.description}</p>
          </div>
          <Link href={`/admin/articles/new?type=${config.type}&returnTo=${encodeURIComponent(config.href)}`} className="btn-primary">{config.newLabel}</Link>
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          {config.structure.map((item) => (
            <div key={item.label} className="rounded-lg border border-line bg-white p-4">
              <h2 className="font-serif text-xl font-bold">{item.label}</h2>
              <p className="mt-2 text-xs leading-5 text-ink/60">{item.description}</p>
            </div>
          ))}
        </section>

        <div className="card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink text-left text-white">
              <tr><th className="p-3">Judul</th><th className="p-3">Status</th><th className="p-3">Produk</th><th className="p-3">Update</th><th className="p-3">Aksi</th></tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-line">
                  <td className="p-3 font-semibold">{article.title}<p className="text-xs text-ink/55">{article.slug}</p></td>
                  <td className="p-3">{article.isPublished ? "Published" : "Draft"}</td>
                  <td className="p-3">{article._count.products}</td>
                  <td className="p-3">{article.updatedAt.toLocaleDateString("id-ID")}</td>
                  <td className="flex gap-2 p-3">
                    <Link className="btn-secondary py-1.5" href={`/admin/articles/${article.id}/edit?returnTo=${encodeURIComponent(config.href)}`}>Edit</Link>
                    <form action={deleteArticle}>
                      <input type="hidden" name="id" value={article.id} />
                      <button className="btn-secondary py-1.5">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!articles.length ? (
                <tr><td colSpan={5} className="p-6 text-center text-sm text-ink/55">Belum ada konten untuk tipe ini.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
