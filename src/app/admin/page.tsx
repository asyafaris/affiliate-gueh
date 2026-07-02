import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import type { ArticleSummary } from "@/types/domain";

type TopProductClick = {
  productId: string;
  _count: number;
};

type TopAffiliateLinkClick = {
  affiliateLinkId: string;
  _count: number;
};

type ProductLookup = {
  id: string;
  name: string;
  slug: string;
};

type AffiliateLinkLookup = {
  id: string;
  merchantName: string;
  buttonLabel: string;
  redirectCode: string;
  product: { name: string };
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const db = getDb();
  const [products, articles, categories, clicks, topProducts, topLinks, recentArticles]: [
    number,
    number,
    number,
    number,
    TopProductClick[],
    TopAffiliateLinkClick[],
    ArticleSummary[]
  ] = await Promise.all([
    db.product.count(),
    db.article.count(),
    db.category.count(),
    db.affiliateClick.count(),
    db.affiliateClick.groupBy({ by: ["productId"], _count: true, orderBy: { _count: { productId: "desc" } }, take: 5 }),
    db.affiliateClick.groupBy({ by: ["affiliateLinkId"], _count: true, orderBy: { _count: { affiliateLinkId: "desc" } }, take: 5 }),
    db.article.findMany({ orderBy: { updatedAt: "desc" }, take: 5 })
  ]);

  const [topProductDetails, topLinkDetails]: [ProductLookup[], AffiliateLinkLookup[]] = await Promise.all([
    topProducts.length
      ? db.product.findMany({
          where: { id: { in: topProducts.map((item) => item.productId) } },
          select: { id: true, name: true, slug: true }
        })
      : [],
    topLinks.length
      ? db.productAffiliateLink.findMany({
          where: { id: { in: topLinks.map((item) => item.affiliateLinkId) } },
          select: {
            id: true,
            merchantName: true,
            buttonLabel: true,
            redirectCode: true,
            product: { select: { name: true } }
          }
        })
      : []
  ]);

  const productById = new Map(topProductDetails.map((product) => [product.id, product]));
  const linkById = new Map(topLinkDetails.map((link) => [link.id, link]));

  return (
    <AdminShell>
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="font-serif text-4xl font-bold">Ringkasan CMS dan klik affiliate</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/products/new" className="btn-primary">Tambah Produk</Link>
            <Link href="/admin/articles/new" className="btn-secondary">Tambah Artikel</Link>
            <Link href="/admin/articles/new" className="btn-secondary">Buat Best Pick</Link>
            <Link href="/admin/articles/new" className="btn-secondary">Buat Comparison</Link>
            <Link href="/admin/homepage" className="btn-secondary">Kelola Homepage</Link>
            <Link href="/admin/analytics" className="btn-secondary">Lihat Analytics</Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[["Total Produk", products], ["Total Artikel", articles], ["Total Kategori", categories], ["Total Klik Affiliate", clicks]].map(([label, value]) => (
            <div key={label} className="card p-5"><p className="text-sm text-ink/60">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-5">
            <h2 className="font-semibold">Produk Paling Banyak Diklik</h2>
            <div className="mt-4 grid gap-3">
              {topProducts.length ? topProducts.map((item) => {
                const product = productById.get(item.productId);
                return (
                  <div key={item.productId} className="flex items-center justify-between gap-4 rounded-md border border-line bg-paper/60 px-3 py-2">
                    <div>
                      <Link href={product ? `/produk/${product.slug}` : "#"} className="text-sm font-semibold hover:text-moss">
                        {product?.name ?? "Produk tidak ditemukan"}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink/50">{item.productId}</p>
                    </div>
                    <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">{item._count} klik</span>
                  </div>
                );
              }) : <p className="text-sm text-ink/55">Belum ada klik produk.</p>}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold">Merchant Paling Banyak Diklik</h2>
            <div className="mt-4 grid gap-3">
              {topLinks.length ? topLinks.map((item) => {
                const link = linkById.get(item.affiliateLinkId);
                return (
                  <div key={item.affiliateLinkId} className="flex items-center justify-between gap-4 rounded-md border border-line bg-paper/60 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold">{link ? `${link.merchantName} - ${link.buttonLabel}` : "Link tidak ditemukan"}</p>
                      <p className="mt-0.5 text-xs text-ink/50">{link ? `${link.product.name} / ${link.redirectCode}` : item.affiliateLinkId}</p>
                    </div>
                    <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">{item._count} klik</span>
                  </div>
                );
              }) : <p className="text-sm text-ink/55">Belum ada klik affiliate.</p>}
            </div>
          </div>
          <div className="card p-5"><h2 className="font-semibold">Klik Terbaru dan Konten Terbaru</h2><div className="mt-3 grid gap-2 text-sm">{recentArticles.map((a) => <Link key={a.id} href={`/admin/articles/${a.id}/edit`}>{a.title}</Link>)}</div></div>
        </div>
      </div>
    </AdminShell>
  );
}
