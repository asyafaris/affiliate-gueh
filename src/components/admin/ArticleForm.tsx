import { saveArticle } from "@/app/admin/actions";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { ARTICLE_TYPES, type ArticleType } from "@/types/domain";

type ArticleForForm = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  contentMd?: string;
  articleType?: ArticleType;
  isPublished?: boolean;
  products?: { productId: string }[];
};

type ProductOption = {
  id: string;
  name: string;
  brand?: { name: string };
  category?: { name: string };
  bestFor?: string;
};

const articleTypeLabels: Record<ArticleType, string> = {
  GUIDE: "Guide / Panduan",
  REVIEW: "Review",
  COMPARISON: "Comparison / Bandingkan",
  BEST_PICKS: "Best Pick",
  TIPS: "Tips"
};

const visibleArticleTypes = ARTICLE_TYPES.filter((type) => type !== "GUIDE");

const bestPickStructure = [
  ["Hero", "Title, excerpt, dan cover image menjadi pembuka halaman."],
  ["Metodologi", "Konten artikel bisa menjelaskan cara kurasi, kriteria, dan batasan rekomendasi."],
  ["Quick picks", "Produk terhubung ditampilkan sebagai ringkasan cepat berdasarkan urutan pilihan."],
  ["Ranking produk", "Produk terhubung menjadi daftar peringkat. Urutan mengikuti urutan produk yang tersimpan."],
  ["Mini review", "Editorial summary, best-for, pros/cons, estimasi harga, dan CTA affiliate diambil dari data produk."],
  ["Disclosure", "Disclosure affiliate tetap tampil otomatis di halaman publik."]
];

export function ArticleForm({
  article,
  products,
  defaultType,
  lockedType,
  returnTo
}: {
  article?: ArticleForForm;
  products: ProductOption[];
  defaultType?: ArticleType;
  lockedType?: ArticleType;
  returnTo?: string;
}) {
  const selected = new Set(article?.products?.map((p) => p.productId));
  const selectedProducts = products.filter((product) => selected.has(product.id));
  const currentType = article?.articleType ?? defaultType ?? "REVIEW";
  return (
    <form action={saveArticle} className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <input type="hidden" name="id" defaultValue={article?.id} />
          {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Title"><input name="title" className={inputClass} required defaultValue={article?.title} /></AdminField>
            <AdminField label="Slug"><input name="slug" className={inputClass} defaultValue={article?.slug} /></AdminField>
            <AdminField label="Tipe konten">
              {lockedType ? (
                <>
                  <input type="hidden" name="articleType" value={lockedType} />
                  <input className={inputClass} value={articleTypeLabels[lockedType]} readOnly />
                </>
              ) : (
                <select name="articleType" className={inputClass} defaultValue={currentType}>
                  {visibleArticleTypes.map((type) => <option key={type} value={type}>{articleTypeLabels[type]}</option>)}
                </select>
              )}
            </AdminField>
            <AdminField label="Gambar heading / cover image"><ImageUploadInput name="coverImageUrl" defaultValue={article?.coverImageUrl ?? ""} placeholder="https://..." /></AdminField>
          </div>
          <AdminField label="Ringkasan artikel"><MarkdownEditor name="excerpt" required rows={4} defaultValue={article?.excerpt} /></AdminField>
          <AdminField label="Konten artikel"><MarkdownEditor name="contentMd" required rows={16} defaultValue={article?.contentMd} imageHint /></AdminField>
          <fieldset className="grid gap-2 rounded-lg border border-line bg-white p-4">
            <legend className="px-2 text-sm font-semibold">Produk terkait / ranking Best Pick</legend>
            <p className="text-xs leading-5 text-ink/55">
              Untuk Best Pick, produk yang dicentang akan menjadi quick picks dan ranked product list di halaman publik.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {products.map((product) => (
                <label key={product.id} className="rounded-md border border-line bg-paper/50 p-3 text-sm">
                  <input name="productIds" type="checkbox" value={product.id} defaultChecked={selected.has(product.id)} />{" "}
                  <span className="font-semibold">{product.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-ink/55">
                    {[product.brand?.name, product.category?.name, product.bestFor].filter(Boolean).join(" / ")}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="text-sm"><input type="checkbox" name="isPublished" defaultChecked={article?.isPublished} /> Published</label>
          <button className="btn-primary w-fit">Simpan artikel</button>
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-lg border border-line bg-white p-5">
            <p className="eyebrow">Struktur Best Pick</p>
            <h2 className="mt-2 text-2xl font-bold">Mapping halaman publik</h2>
            <div className="mt-4 grid gap-3">
              {bestPickStructure.map(([title, description]) => (
                <div key={title} className="rounded-md border border-line bg-paper p-3">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-ink/60">{description}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-line bg-white p-5">
            <p className="eyebrow">Analisis produk terhubung</p>
            <h2 className="mt-2 text-2xl font-bold">{selectedProducts.length} produk dipilih</h2>
            <div className="mt-4 grid gap-3">
              {selectedProducts.length ? selectedProducts.map((product, index) => (
                <div key={product.id} className="rounded-md border border-line bg-paper p-3">
                  <p className="text-sm font-semibold">#{index + 1} {product.name}</p>
                  <p className="mt-1 text-xs leading-5 text-ink/60">
                    {[product.brand?.name, product.category?.name, product.bestFor].filter(Boolean).join(" / ")}
                  </p>
                </div>
              )) : (
                <p className="rounded-md border border-line bg-paper p-3 text-xs leading-5 text-ink/60">
                  Belum ada produk dipilih. Untuk Best Pick, pilih minimal beberapa produk agar quick picks dan ranking publik terisi.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
