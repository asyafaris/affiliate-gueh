import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { saveHomepageSection } from "@/app/admin/actions";

type HomepageSectionRow = {
  id: string;
  sectionKey: string;
  title: string;
  isActive: boolean;
  sortOrder: number;
};

export default async function HomepageAdminPage() {
  await requireAdmin();
  const sections: HomepageSectionRow[] = await getDb().homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form action={saveHomepageSection} className="card grid content-start gap-4 p-5">
          <h1 className="font-serif text-3xl font-bold">Section homepage</h1>
          <AdminField label="Kunci section"><input name="sectionKey" className={inputClass} required /></AdminField>
          <AdminField label="Judul"><input name="title" className={inputClass} required /></AdminField>
          <AdminField label="Deskripsi / subtitle"><MarkdownEditor name="subtitle" rows={5} /></AdminField>
          <AdminField label="Urutan tampil"><input name="sortOrder" type="number" className={inputClass} defaultValue={0} /></AdminField>
          <label className="text-sm"><input type="checkbox" name="isActive" defaultChecked /> Aktif</label>
          <button className="btn-primary">Simpan section</button>
        </form>
        <div className="card overflow-auto">
          <table className="w-full text-sm"><tbody>{sections.map((section) => (
            <tr key={section.id} className="border-b border-line"><td className="p-3 font-semibold">{section.title}<p className="text-xs text-ink/55">{section.sectionKey}</p></td><td className="p-3">{section.isActive ? "Active" : "Inactive"}</td><td className="p-3">{section.sortOrder}</td></tr>
          ))}</tbody></table>
        </div>
      </div>
    </AdminShell>
  );
}
