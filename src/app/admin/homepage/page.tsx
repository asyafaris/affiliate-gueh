import Link from "next/link";
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
  subtitle: string | null;
  isActive: boolean;
  sortOrder: number;
};

export default async function HomepageAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const search = await searchParams;
  const sections: HomepageSectionRow[] = await getDb().homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
  const editingSection = sections.find((section) => section.id === search.edit);

  return (
    <AdminShell>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form action={saveHomepageSection} className="card grid min-w-0 content-start gap-4 overflow-hidden p-5">
          <input type="hidden" name="id" value={editingSection?.id ?? ""} />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">{editingSection ? "Edit data" : "Tambah data"}</p>
              <h1 className="text-3xl font-bold">Section homepage</h1>
            </div>
            {editingSection ? <Link href="/admin/homepage" className="btn-ghost min-h-0 px-3 py-2">Batal</Link> : null}
          </div>
          <AdminField label="Kunci section"><input name="sectionKey" className={inputClass} required defaultValue={editingSection?.sectionKey} /></AdminField>
          <AdminField label="Judul"><input name="title" className={inputClass} required defaultValue={editingSection?.title} /></AdminField>
          <AdminField label="Deskripsi / subtitle"><MarkdownEditor name="subtitle" rows={5} defaultValue={editingSection?.subtitle} /></AdminField>
          <AdminField label="Urutan tampil"><input name="sortOrder" type="number" className={inputClass} defaultValue={editingSection?.sortOrder ?? 0} /></AdminField>
          <label className="text-sm"><input type="checkbox" name="isActive" defaultChecked={editingSection?.isActive ?? true} /> Aktif</label>
          <button className="btn-primary">{editingSection ? "Update section" : "Simpan section"}</button>
        </form>
        <div className="card min-w-0 overflow-auto">
          <table className="w-full min-w-[640px] text-sm"><tbody>{sections.map((section) => (
            <tr key={section.id} className="border-b border-line"><td className="p-3 font-semibold">{section.title}<p className="text-xs text-ink/55">{section.sectionKey}</p></td><td className="p-3">{section.isActive ? "Active" : "Inactive"}</td><td className="p-3">{section.sortOrder}</td><td className="p-3"><Link className="btn-secondary min-h-0 px-3 py-1.5" href={`/admin/homepage?edit=${section.id}`}>Edit</Link></td></tr>
          ))}</tbody></table>
        </div>
      </div>
    </AdminShell>
  );
}
