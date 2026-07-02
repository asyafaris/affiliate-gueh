import Link from "next/link";
import { BarChart3, Boxes, FileText, MousePointerClick, Tags } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/types/domain";

const DAY_MS = 24 * 60 * 60 * 1000;

function periodDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function KpiCard({ icon: Icon, label, value, delta }: { icon: typeof Boxes; label: string; value: number; delta: number }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-accent-tint text-accent-dark">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className={cn("text-xs font-bold", delta >= 0 ? "text-accent-dark" : "text-warn")}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
        </span>
      </div>
      <p className="mt-3 text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-primary">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const db = getDb();
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * DAY_MS);
  const d14 = new Date(now.getTime() - 14 * DAY_MS);
  const d30 = new Date(now.getTime() - 30 * DAY_MS);
  const d60 = new Date(now.getTime() - 60 * DAY_MS);

  const [
    products,
    productsPrev,
    articles,
    articlesPrev,
    categories,
    categoriesPrev,
    clicksThisWeek,
    clicksPrevWeek,
    recentArticles,
    pendingReviews,
    recentClicks
  ]: [number, number, number, number, number, number, number, number, ArticleSummary[], ArticleSummary[], { clickedAt: Date; affiliateLink: { merchantName: string } }[]] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    db.article.count(),
    db.article.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    db.category.count(),
    db.category.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    db.affiliateClick.count({ where: { clickedAt: { gte: d7 } } }),
    db.affiliateClick.count({ where: { clickedAt: { gte: d14, lt: d7 } } }),
    db.article.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    db.article.findMany({ where: { articleType: "REVIEW", isPublished: false }, orderBy: { updatedAt: "desc" }, take: 5 }),
    db.affiliateClick.findMany({ where: { clickedAt: { gte: d14 } }, select: { clickedAt: true, affiliateLink: { select: { merchantName: true } } } })
  ]);

  const productsPrevPeriod = await db.product.count({ where: { createdAt: { gte: d30 } } });
  const articlesPrevPeriod = await db.article.count({ where: { createdAt: { gte: d30 } } });
  const categoriesPrevPeriod = await db.category.count({ where: { createdAt: { gte: d30 } } });

  const dayBuckets = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(now.getTime() - (13 - i) * DAY_MS);
    return { key: day.toDateString(), label: day.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit" }), count: 0 };
  });
  const dayIndex = new Map(dayBuckets.map((bucket, i) => [bucket.key, i]));
  recentClicks.forEach((click) => {
    const idx = dayIndex.get(click.clickedAt.toDateString());
    if (idx !== undefined) dayBuckets[idx].count += 1;
  });
  const maxDay = Math.max(1, ...dayBuckets.map((b) => b.count));

  const merchantCounts = new Map<string, number>();
  recentClicks.forEach((click) => {
    const name = click.affiliateLink.merchantName;
    merchantCounts.set(name, (merchantCounts.get(name) ?? 0) + 1);
  });
  const merchantSplit = [...merchantCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxMerchant = Math.max(1, ...merchantSplit.map(([, count]) => count));

  return (
    <AdminShell>
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="text-4xl">Ringkasan CMS dan klik affiliate</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/products/new" className="btn-primary">Tambah Produk</Link>
            <Link href="/admin/articles/new" className="btn-secondary">Tambah Artikel</Link>
            <Link href="/admin/homepage" className="btn-secondary">Kelola Homepage</Link>
            <Link href="/admin/analytics" className="btn-secondary">Lihat Analytics</Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard icon={Boxes} label="Total Produk" value={products} delta={periodDelta(productsPrevPeriod, productsPrev)} />
          <KpiCard icon={FileText} label="Total Artikel" value={articles} delta={periodDelta(articlesPrevPeriod, articlesPrev)} />
          <KpiCard icon={Tags} label="Total Kategori" value={categories} delta={periodDelta(categoriesPrevPeriod, categoriesPrev)} />
          <KpiCard icon={MousePointerClick} label="Klik Affiliate (7 hari)" value={clicksThisWeek} delta={periodDelta(clicksThisWeek, clicksPrevWeek)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent-dark" />
              <h2 className="font-semibold text-primary">Klik afiliasi 14 hari terakhir</h2>
            </div>
            <div className="flex h-32 items-end gap-1.5">
              {dayBuckets.map((bucket) => (
                <div key={bucket.key} className="group flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t bg-accent transition group-hover:bg-accent-dark"
                    style={{ height: `${Math.max(4, (bucket.count / maxDay) * 100)}%` }}
                    title={`${bucket.label}: ${bucket.count} klik`}
                  />
                  <span className="text-[9px] text-neutral-400">{bucket.label.slice(0, 2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-primary">Klik per merchant (14 hari)</h2>
            <div className="grid gap-3">
              {merchantSplit.length ? merchantSplit.map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-700">{name}</span>
                    <span className="text-neutral-500">{count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(count / maxMerchant) * 100}%` }} />
                  </div>
                </div>
              )) : <p className="text-sm text-neutral-500">Belum ada klik affiliate.</p>}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="font-semibold text-primary">Antrian ulasan</h2>
            <div className="mt-3 grid gap-2">
              {pendingReviews.length ? pendingReviews.map((article) => (
                <Link key={article.id} href={`/admin/articles/${article.id}/edit`} className="flex items-center justify-between gap-3 rounded-control border border-neutral-200 px-3 py-2 text-sm">
                  <span className="font-medium text-primary">{article.title}</span>
                  <span className="badge bg-warn-tint text-warn">Draft</span>
                </Link>
              )) : <p className="text-sm text-neutral-500">Tidak ada review yang menunggu.</p>}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-primary">Konten terbaru diubah</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {recentArticles.map((article) => (
                <Link key={article.id} href={`/admin/articles/${article.id}/edit`} className="rounded-control px-3 py-2 font-medium text-primary hover:bg-neutral-50">
                  {article.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
