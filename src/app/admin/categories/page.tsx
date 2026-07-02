import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import type { CategorySummary } from "@/types/domain";

export default async function CategoriesPage() {
  await requireAdmin();
  const categories: CategorySummary[] = await getDb().category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form action={saveCategory} className="card grid content-start gap-4 p-5">
          <h1 className="font-serif text-3xl font-bold">Kategori</h1>
          <AdminField label="Name"><input name="name" className={inputClass} required /></AdminField>
          <AdminField label="Slug"><input name="slug" className={inputClass} /></AdminField>
          <AdminField label="Gambar kategori"><ImageUploadInput name="imageUrl" placeholder="https://..." /></AdminField>
          <AdminField label="Deskripsi"><MarkdownEditor name="description" required rows={5} /></AdminField>
          <p className="rounded-md border border-line bg-paper p-3 text-xs leading-5 text-ink/60">
            Gambar kategori akan dipakai di kartu kategori dan heading kategori. Jika kosong, public page memakai visual fallback.
          </p>
          <AdminField label="Sort order"><input name="sortOrder" type="number" className={inputClass} defaultValue={0} /></AdminField>
          <label className="text-sm"><input type="checkbox" name="featured" /> Featured</label>
          <button className="btn-primary">Save</button>
        </form>
        <div className="card overflow-auto">
          <table className="w-full text-sm"><tbody>{categories.map((c) => (
            <tr key={c.id} className="border-b border-line"><td className="p-3 font-semibold">{c.name}<p className="text-xs text-ink/55">{c.slug}</p>{c.imageUrl ? <p className="mt-1 text-xs text-moss">Ada gambar</p> : null}</td><td className="p-3">{c.featured ? "Featured" : ""}</td><td className="p-3"><form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><button className="btn-secondary py-1.5">Delete</button></form></td></tr>
          ))}</tbody></table>
        </div>
      </div>
    </AdminShell>
  );
}
