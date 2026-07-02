import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";

type ClickGroupByProduct = {
  productId: string;
  _count: number;
};

type ClickGroupByLink = {
  affiliateLinkId: string;
  _count: number;
};

type ProductLookup = {
  id: string;
  name: string;
};

type AffiliateLinkLookup = {
  id: string;
  merchantName: string;
  buttonLabel: string;
  product: { name: string };
};

type RecentClick = {
  id: string;
  clickedAt: Date;
  sourcePageType: string | null;
  sourcePageSlug: string | null;
  deviceType: string | null;
  product: { name: string };
  affiliateLink: { merchantName: string };
};

export default async function AnalyticsPage() {
  await requireAdmin();
  const db = getDb();
  const [total, byProduct, byMerchant, recent]: [number, ClickGroupByProduct[], ClickGroupByLink[], RecentClick[]] = await Promise.all([
    db.affiliateClick.count(),
    db.affiliateClick.groupBy({ by: ["productId"], _count: true, orderBy: { _count: { productId: "desc" } }, take: 10 }),
    db.affiliateClick.groupBy({ by: ["affiliateLinkId"], _count: true, orderBy: { _count: { affiliateLinkId: "desc" } }, take: 10 }),
    db.affiliateClick.findMany({ include: { product: true, affiliateLink: true }, orderBy: { clickedAt: "desc" }, take: 25 })
  ]);

  const [products, affiliateLinks]: [ProductLookup[], AffiliateLinkLookup[]] = await Promise.all([
    byProduct.length
      ? db.product.findMany({
          where: { id: { in: byProduct.map((item) => item.productId) } },
          select: { id: true, name: true }
        })
      : [],
    byMerchant.length
      ? db.productAffiliateLink.findMany({
          where: { id: { in: byMerchant.map((item) => item.affiliateLinkId) } },
          select: {
            id: true,
            merchantName: true,
            buttonLabel: true,
            product: { select: { name: true } }
          }
        })
      : []
  ]);

  const productById = new Map(products.map((product) => [product.id, product]));
  const linkById = new Map(affiliateLinks.map((link) => [link.id, link]));

  return (
    <AdminShell>
      <div className="grid gap-6">
        <div><p className="eyebrow">Analytics</p><h1 className="font-serif text-4xl font-bold">Klik Affiliate</h1></div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-5"><p className="text-sm text-ink/60">Total Klik Affiliate</p><p className="mt-2 text-4xl font-bold">{total}</p></div>
          <div className="card p-5">
            <h2 className="font-semibold">Produk Paling Banyak Diklik</h2>
            <div className="mt-4 grid gap-3">
              {byProduct.length ? byProduct.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 rounded-md border border-line bg-paper/60 px-3 py-2">
                  <span className="text-sm font-medium">{productById.get(item.productId)?.name ?? "Produk tidak ditemukan"}</span>
                  <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">{item._count}</span>
                </div>
              )) : <p className="text-sm text-ink/55">Belum ada klik produk.</p>}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold">Merchant Paling Banyak Diklik</h2>
            <div className="mt-4 grid gap-3">
              {byMerchant.length ? byMerchant.map((item) => {
                const link = linkById.get(item.affiliateLinkId);
                return (
                  <div key={item.affiliateLinkId} className="flex items-center justify-between gap-3 rounded-md border border-line bg-paper/60 px-3 py-2">
                    <span className="text-sm font-medium">{link ? `${link.merchantName} - ${link.product.name}` : "Link tidak ditemukan"}</span>
                    <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">{item._count}</span>
                  </div>
                );
              }) : <p className="text-sm text-ink/55">Belum ada klik affiliate.</p>}
            </div>
          </div>
        </div>
        <div className="card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink text-left text-white"><tr><th className="p-3">Waktu</th><th className="p-3">Produk</th><th className="p-3">Merchant</th><th className="p-3">Halaman Sumber Klik</th><th className="p-3">Device</th></tr></thead>
            <tbody>{recent.map((click) => (
              <tr key={click.id} className="border-b border-line">
                <td className="p-3">{click.clickedAt.toLocaleString("id-ID")}</td><td className="p-3">{click.product.name}</td><td className="p-3">{click.affiliateLink.merchantName}</td><td className="p-3">{click.sourcePageType}/{click.sourcePageSlug}</td><td className="p-3">{click.deviceType}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
