import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { StatusChip } from "@/components/shared/StatusChip";
import { deleteAffiliateLink, saveAffiliateLink } from "@/app/admin/actions";

type AdminProductOption = { id: string; name: string };
type AdminAffiliateLink = {
  id: string;
  productId: string;
  buttonLabel: string;
  merchantName: string;
  affiliateUrl: string;
  redirectCode: string;
  isPrimary: boolean;
  isActive: boolean;
  price: number | null;
  sortOrder: number;
  product: { name: string };
  _count: { clicks: number };
};

export default async function AffiliateLinksPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const search = await searchParams;
  const [products, links]: [AdminProductOption[], AdminAffiliateLink[]] = await Promise.all([
    getDb().product.findMany({ orderBy: { name: "asc" } }),
    getDb().productAffiliateLink.findMany({ include: { product: true, _count: { select: { clicks: true } } }, orderBy: { updatedAt: "desc" } })
  ]);
  const editingLink = links.find((link) => link.id === search.edit);

  const activeCount = links.filter((link) => link.isActive).length;
  const totalClicks = links.reduce((sum, link) => sum + link._count.clicks, 0);
  const merchantCount = new Set(links.map((link) => link.merchantName)).size;

  return (
    <AdminShell>
      <div className="grid gap-6">
        <div>
          <p className="eyebrow">Afiliasi</p>
          <h1 className="text-4xl">Link affiliate</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Total link", links.length],
            ["Link aktif", activeCount],
            ["Total klik", totalClicks],
            ["Merchant", merchantCount]
          ].map(([label, value]) => (
            <div key={label} className="card p-5">
              <p className="text-sm text-neutral-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
          <form action={saveAffiliateLink} className="card grid min-w-0 content-start gap-4 overflow-hidden p-5">
            <input type="hidden" name="id" value={editingLink?.id ?? ""} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{editingLink ? "Edit data" : "Tambah data"}</p>
                <h2 className="text-2xl">Link affiliate</h2>
              </div>
              {editingLink ? <Link href="/admin/affiliate-links" className="btn-ghost min-h-0 px-3 py-2">Batal</Link> : null}
            </div>
            <p className="text-sm leading-6 text-neutral-500">CTA akan diarahkan melalui route tracking sebelum menuju link affiliate.</p>
            <AdminField label="Produk"><select name="productId" className={inputClass} defaultValue={editingLink?.productId}>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></AdminField>
            <AdminField label="Merchant"><input name="merchantName" className={inputClass} required defaultValue={editingLink?.merchantName} /></AdminField>
            <AdminField label="Label tombol"><input name="buttonLabel" className={inputClass} required placeholder="Cek harga terbaru" defaultValue={editingLink?.buttonLabel} /></AdminField>
            <AdminField label="Harga (opsional)"><input name="price" type="number" className={inputClass} placeholder="289000" defaultValue={editingLink?.price ?? undefined} /></AdminField>
            <AdminField label="Affiliate URL"><input name="affiliateUrl" className={inputClass} required defaultValue={editingLink?.affiliateUrl} /></AdminField>
            <AdminField label="Redirect code"><input name="redirectCode" className={inputClass} required defaultValue={editingLink?.redirectCode} /></AdminField>
            <AdminField label="Urutan tampil"><input name="sortOrder" type="number" className={inputClass} defaultValue={editingLink?.sortOrder ?? 0} /></AdminField>
            <div className="rounded-control bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
              Label natural yang disarankan: Cek harga terbaru, Cek di Official Store, Lihat toko terpercaya, atau Cek produk di marketplace.
            </div>
            <div className="flex gap-4 text-sm"><label><input type="checkbox" name="isPrimary" defaultChecked={editingLink?.isPrimary ?? false} /> Link utama</label><label><input type="checkbox" name="isActive" defaultChecked={editingLink?.isActive ?? true} /> Aktif</label></div>
            <button className="btn-primary">{editingLink ? "Update link" : "Simpan link"}</button>
          </form>
          <div className="card min-w-0 overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-neutral-50 text-left text-neutral-500">
                <tr>
                  <th className="p-3 font-semibold">Link</th>
                  <th className="p-3 font-semibold">Merchant</th>
                  <th className="p-3 font-semibold">Klik</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                    <td className="p-3 font-semibold text-primary">{link.buttonLabel}<p className="text-xs font-normal text-neutral-500">{link.product.name}</p></td>
                    <td className="p-3 text-neutral-600">{link.merchantName}</td>
                    <td className="p-3 text-neutral-600">{link._count.clicks}</td>
                    <td className="p-3"><StatusChip status={link.isActive ? "live" : "draft"} label={link.isActive ? "Aktif" : "Nonaktif"} /></td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Link className="btn-ghost min-h-0 px-3 py-1.5" href={`/admin/affiliate-links?edit=${link.id}`}>Edit</Link>
                        <form action={deleteAffiliateLink}>
                          <input type="hidden" name="id" value={link.id} />
                          <button className="btn-ghost min-h-0 px-3 py-1.5 text-error">Hapus</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
