import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import type { CategorySummary } from "@/types/domain";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const search = await searchParams;
  const categories: CategorySummary[] = await getDb().category.findMany({ orderBy: { sortOrder: "asc" } });
  const editingCategory = categories.find((category) => category.id === search.edit);

  return (
    <AdminShell>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form action={saveCategory} className="card grid min-w-0 content-start gap-4 overflow-hidden p-5">
          <input type="hidden" name="id" value={editingCategory?.id ?? ""} />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">{editingCategory ? "Edit data" : "Tambah data"}</p>
              <h1 className="text-3xl font-bold">Kategori</h1>
            </div>
            {editingCategory ? <Link href="/admin/categories" className="btn-ghost min-h-0 px-3 py-2">Batal</Link> : null}
          </div>
          <AdminField label="Name"><input name="name" className={inputClass} required defaultValue={editingCategory?.name} /></AdminField>
          <AdminField label="Slug"><input name="slug" className={inputClass} defaultValue={editingCategory?.slug} /></AdminField>
          <AdminField label="Gambar kategori"><ImageUploadInput name="imageUrl" placeholder="https://..." defaultValue={editingCategory?.imageUrl ?? ""} /></AdminField>
          <AdminField label="Deskripsi"><MarkdownEditor name="description" required rows={5} defaultValue={editingCategory?.description} /></AdminField>
          <p className="rounded-md border border-line bg-paper p-3 text-xs leading-5 text-ink/60">
            Gambar kategori akan dipakai di kartu kategori dan heading kategori. Jika kosong, public page memakai visual fallback.
          </p>
          <AdminField label="Sort order"><input name="sortOrder" type="number" className={inputClass} defaultValue={editingCategory?.sortOrder ?? 0} /></AdminField>
          <label className="text-sm"><input type="checkbox" name="featured" defaultChecked={editingCategory?.featured ?? false} /> Featured</label>
          <button className="btn-primary">{editingCategory ? "Update kategori" : "Save"}</button>
        </form>
        <div className="card min-w-0 overflow-auto">
          <table className="w-full min-w-[640px] text-sm"><tbody>{categories.map((c) => (
            <tr key={c.id} className="border-b border-line"><td className="p-3 font-semibold">{c.name}<p className="text-xs text-ink/55">{c.slug}</p>{c.imageUrl ? <p className="mt-1 text-xs text-moss">Ada gambar</p> : null}</td><td className="p-3">{c.featured ? "Featured" : ""}</td><td className="p-3"><div className="flex gap-2"><Link className="btn-secondary min-h-0 px-3 py-1.5" href={`/admin/categories?edit=${c.id}`}>Edit</Link><form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><button className="btn-secondary min-h-0 py-1.5">Delete</button></form></div></td></tr>
          ))}</tbody></table>
        </div>
      </div>
    </AdminShell>
  );
}
