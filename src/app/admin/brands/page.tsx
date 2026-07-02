import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { deleteBrand, saveBrand } from "@/app/admin/actions";
import type { BrandSummary } from "@/types/domain";

export default async function BrandsPage() {
  await requireAdmin();
  const brands: BrandSummary[] = await getDb().brand.findMany({ orderBy: { name: "asc" } });
  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form action={saveBrand} className="card grid content-start gap-4 p-5">
          <h1 className="font-serif text-3xl font-bold">Brands</h1>
          <AdminField label="Name"><input name="name" className={inputClass} required /></AdminField>
          <AdminField label="Slug"><input name="slug" className={inputClass} /></AdminField>
          <AdminField label="Website URL"><input name="websiteUrl" className={inputClass} /></AdminField>
          <AdminField label="Logo URL"><input name="logoUrl" className={inputClass} /></AdminField>
          <AdminField label="Deskripsi"><MarkdownEditor name="description" rows={5} /></AdminField>
          <button className="btn-primary">Save</button>
        </form>
        <div className="card overflow-auto">
          <table className="w-full text-sm"><tbody>{brands.map((b) => (
            <tr key={b.id} className="border-b border-line"><td className="p-3 font-semibold">{b.name}<p className="text-xs text-ink/55">{b.slug}</p></td><td className="p-3">{b.websiteUrl}</td><td className="p-3"><form action={deleteBrand}><input type="hidden" name="id" value={b.id} /><button className="btn-secondary py-1.5">Delete</button></form></td></tr>
          ))}</tbody></table>
        </div>
      </div>
    </AdminShell>
  );
}
