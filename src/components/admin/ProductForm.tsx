import { saveProduct } from "@/app/admin/actions";
import { AdminField, inputClass, textareaClass } from "@/components/admin/AdminField";
import { ImageListInput } from "@/components/admin/ImageListInput";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";

type ProductForForm = {
  id?: string;
  name?: string;
  slug?: string;
  categoryId?: string;
  brandId?: string;
  shortDescription?: string;
  editorialSummary?: string;
  bestFor?: string;
  priceEstimate?: number;
  compareAtPrice?: number | null;
  currency?: string;
  score?: number | null;
  hoursTested?: number | null;
  evidenceStats?: { label: string; value: string }[];
  isFeatured?: boolean;
  isPublished?: boolean;
  images?: { imageUrl: string }[];
  specs?: { label: string; value: string }[];
  prosCons?: { type: "PRO" | "CON"; content: string }[];
};

export function ProductForm({ product, categories, brands }: { product?: ProductForForm; categories: { id: string; name: string }[]; brands: { id: string; name: string }[] }) {
  return (
    <form action={saveProduct} className="grid gap-5">
      <input type="hidden" name="id" defaultValue={product?.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Nama"><input name="name" className={inputClass} required defaultValue={product?.name} /></AdminField>
        <AdminField label="Slug"><input name="slug" className={inputClass} defaultValue={product?.slug} /></AdminField>
        <AdminField label="Kategori"><select name="categoryId" className={inputClass} required defaultValue={product?.categoryId}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></AdminField>
        <AdminField label="Brand"><select name="brandId" className={inputClass} required defaultValue={product?.brandId}>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></AdminField>
        <AdminField label="Estimasi harga"><input name="priceEstimate" type="number" className={inputClass} required defaultValue={product?.priceEstimate} /></AdminField>
        <AdminField label="Harga coret (opsional)"><input name="compareAtPrice" type="number" className={inputClass} defaultValue={product?.compareAtPrice ?? undefined} /></AdminField>
        <AdminField label="Currency"><input name="currency" className={inputClass} defaultValue={product?.currency ?? "IDR"} /></AdminField>
        <AdminField label="Skor worth-it (0-10)"><input name="score" type="number" step="0.1" min="0" max="10" className={inputClass} defaultValue={product?.score ?? undefined} /></AdminField>
        <AdminField label="Jam pengujian"><input name="hoursTested" type="number" className={inputClass} defaultValue={product?.hoursTested ?? undefined} /></AdminField>
      </div>
      <AdminField label="Deskripsi singkat"><MarkdownEditor name="shortDescription" required rows={4} defaultValue={product?.shortDescription} /></AdminField>
      <AdminField label="Ringkasan editor"><MarkdownEditor name="editorialSummary" required rows={5} defaultValue={product?.editorialSummary} /></AdminField>
      <AdminField label="Cocok untuk siapa"><input name="bestFor" className={inputClass} required defaultValue={product?.bestFor} /></AdminField>
      <AdminField label="Gambar produk"><ImageListInput name="images" defaultValue={product?.images?.map((i) => i.imageUrl).join("\n")} /></AdminField>
      <AdminField label="Specs, format label|value per baris"><textarea name="specs" className={textareaClass} defaultValue={product?.specs?.map((s) => `${s.label}|${s.value}`).join("\n")} /></AdminField>
      <AdminField label="Bukti uji (stat tiles), format label|value per baris">
        <textarea name="evidenceStats" className={textareaClass} placeholder={"Batch diuji|40 batch\nDaya|395W"} defaultValue={product?.evidenceStats?.map((s) => `${s.label}|${s.value}`).join("\n")} />
      </AdminField>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Pros, satu per baris"><textarea name="pros" className={textareaClass} defaultValue={product?.prosCons?.filter((p) => p.type === "PRO").map((p) => p.content).join("\n")} /></AdminField>
        <AdminField label="Cons, satu per baris"><textarea name="cons" className={textareaClass} defaultValue={product?.prosCons?.filter((p) => p.type === "CON").map((p) => p.content).join("\n")} /></AdminField>
      </div>
      <div className="flex flex-wrap gap-5 text-sm">
        <label><input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} /> Featured</label>
        <label><input type="checkbox" name="isPublished" defaultChecked={product?.isPublished} /> Published</label>
      </div>
      <button className="btn-primary w-fit">Simpan produk</button>
    </form>
  );
}
