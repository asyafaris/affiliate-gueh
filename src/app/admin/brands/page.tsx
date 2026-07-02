import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { deleteBrand, saveBrand } from "@/app/admin/actions";

type AdminBrand = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string | null;
  description: string | null;
  logoUrl: string | null;
};

export default async function BrandsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const search = await searchParams;
  const brands: AdminBrand[] = await getDb().brand.findMany({ orderBy: { name: "asc" } });
  const editingBrand = brands.find((brand) => brand.id === search.edit);

  return (
    <AdminShell>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form action={saveBrand} className="card grid min-w-0 content-start gap-4 overflow-hidden p-5">
          <input type="hidden" name="id" value={editingBrand?.id ?? ""} />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">{editingBrand ? "Edit data" : "Tambah data"}</p>
              <h1 className="text-3xl font-bold">Brands</h1>
            </div>
            {editingBrand ? <Link href="/admin/brands" className="btn-ghost min-h-0 px-3 py-2">Batal</Link> : null}
          </div>
          <AdminField label="Name"><input name="name" className={inputClass} required defaultValue={editingBrand?.name} /></AdminField>
          <AdminField label="Slug"><input name="slug" className={inputClass} defaultValue={editingBrand?.slug} /></AdminField>
          <AdminField label="Website URL"><input name="websiteUrl" className={inputClass} defaultValue={editingBrand?.websiteUrl ?? ""} /></AdminField>
          <AdminField label="Logo URL"><input name="logoUrl" className={inputClass} defaultValue={editingBrand?.logoUrl ?? ""} /></AdminField>
          <AdminField label="Deskripsi"><MarkdownEditor name="description" rows={5} defaultValue={editingBrand?.description} /></AdminField>
          <button className="btn-primary">{editingBrand ? "Update brand" : "Save"}</button>
        </form>
        <div className="card min-w-0 overflow-auto">
          <table className="w-full min-w-[640px] text-sm"><tbody>{brands.map((b) => (
            <tr key={b.id} className="border-b border-line"><td className="p-3 font-semibold">{b.name}<p className="text-xs text-ink/55">{b.slug}</p></td><td className="p-3">{b.websiteUrl}</td><td className="p-3"><div className="flex gap-2"><Link className="btn-secondary min-h-0 px-3 py-1.5" href={`/admin/brands?edit=${b.id}`}>Edit</Link><form action={deleteBrand}><input type="hidden" name="id" value={b.id} /><button className="btn-secondary min-h-0 py-1.5">Delete</button></form></div></td></tr>
          ))}</tbody></table>
        </div>
      </div>
    </AdminShell>
  );
}
