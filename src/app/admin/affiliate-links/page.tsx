import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { deleteAffiliateLink, saveAffiliateLink } from "@/app/admin/actions";

type AdminProductOption = { id: string; name: string };
type AdminAffiliateLink = {
  id: string;
  buttonLabel: string;
  redirectCode: string;
  isActive: boolean;
  product: { name: string };
};

export default async function AffiliateLinksPage() {
  await requireAdmin();
  const [products, links]: [AdminProductOption[], AdminAffiliateLink[]] = await Promise.all([
    getDb().product.findMany({ orderBy: { name: "asc" } }),
    getDb().productAffiliateLink.findMany({ include: { product: true }, orderBy: { updatedAt: "desc" } })
  ]);
  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form action={saveAffiliateLink} className="card grid content-start gap-4 p-5">
          <h1 className="font-serif text-3xl font-bold">Link affiliate</h1>
          <p className="text-sm leading-6 text-ink/65">CTA akan diarahkan melalui route tracking sebelum menuju link affiliate.</p>
          <AdminField label="Produk"><select name="productId" className={inputClass}>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></AdminField>
          <AdminField label="Merchant"><input name="merchantName" className={inputClass} required /></AdminField>
          <AdminField label="Label tombol"><input name="buttonLabel" className={inputClass} required placeholder="Cek harga terbaru" /></AdminField>
          <AdminField label="Affiliate URL"><input name="affiliateUrl" className={inputClass} required /></AdminField>
          <AdminField label="Redirect code"><input name="redirectCode" className={inputClass} required /></AdminField>
          <AdminField label="Urutan tampil"><input name="sortOrder" type="number" className={inputClass} defaultValue={0} /></AdminField>
          <div className="rounded-md border border-line bg-paper p-3 text-xs leading-5 text-ink/65">
            Label natural yang disarankan: Cek harga terbaru, Cek di Official Store, Lihat toko terpercaya, atau Cek produk di marketplace.
          </div>
          <div className="flex gap-4 text-sm"><label><input type="checkbox" name="isPrimary" /> Link utama</label><label><input type="checkbox" name="isActive" defaultChecked /> Aktif</label></div>
          <button className="btn-primary">Simpan link</button>
        </form>
        <div className="card overflow-auto">
          <table className="w-full text-sm"><tbody>{links.map((link) => (
            <tr key={link.id} className="border-b border-line"><td className="p-3 font-semibold">{link.buttonLabel}<p className="text-xs text-ink/55">{link.product.name}</p></td><td className="p-3">{link.redirectCode}</td><td className="p-3">{link.isActive ? "Aktif" : "Nonaktif"}</td><td className="p-3"><form action={deleteAffiliateLink}><input type="hidden" name="id" value={link.id} /><button className="btn-secondary py-1.5">Hapus</button></form></td></tr>
          ))}</tbody></table>
        </div>
      </div>
    </AdminShell>
  );
}
