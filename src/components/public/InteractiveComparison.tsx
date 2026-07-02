"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ExternalLink, RotateCcw, X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { generateComparisonVerdict, type VerdictProduct } from "@/lib/comparison";

type CompareCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
};

type CompareProduct = VerdictProduct & {
  slug: string;
  shortDescription: string;
  category: { id: string; name: string; slug: string };
  brand: { name: string };
  specs: { id: string; specGroup: string; label: string; value: string }[];
  affiliateLinks: {
    id: string;
    redirectCode: string;
    buttonLabel: string;
    merchantName: string;
    isPrimary: boolean;
  }[];
};

export function InteractiveComparison({
  categories,
  products,
  initialCategorySlug
}: {
  categories: CompareCategory[];
  products: CompareProduct[];
  initialCategorySlug?: string;
}) {
  const firstCategory = categories.find((category) => category.slug === initialCategorySlug) ?? categories[0];
  const [selectedCategoryId, setSelectedCategoryId] = useState(firstCategory?.id ?? "");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const categoryProducts = useMemo(
    () => products.filter((product) => product.category.id === selectedCategoryId),
    [products, selectedCategoryId]
  );
  const selectedProducts = useMemo(
    () => selectedProductIds.map((id) => products.find((product) => product.id === id)).filter((product): product is CompareProduct => Boolean(product)),
    [products, selectedProductIds]
  );
  const verdict = useMemo(() => generateComparisonVerdict(selectedProducts), [selectedProducts]);
  const specLabels = useMemo(() => {
    const labels = new Set<string>();
    selectedProducts.forEach((product) => product.specs.forEach((spec) => labels.add(spec.label)));
    return [...labels];
  }, [selectedProducts]);

  function selectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setSelectedProductIds([]);
  }

  function toggleProduct(product: CompareProduct) {
    if (product.category.id !== selectedCategoryId) return;
    setSelectedProductIds((current) => {
      if (current.includes(product.id)) return current.filter((id) => id !== product.id);
      if (current.length >= 4) return current;
      return [...current, product.id];
    });
  }

  return (
    <div className="grid gap-10">
      <section id="kategori" className="container-page">
        <div className="mb-6">
          <p className="eyebrow">Langkah 1</p>
          <h2 className="font-serif text-3xl font-bold">Pilih kategori produk</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
            Produk harus berasal dari kategori yang sama agar hasil perbandingan tetap relevan.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const active = category.id === selectedCategoryId;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                className={`card min-h-44 p-5 text-left transition hover:border-moss ${active ? "border-moss ring-2 ring-moss/10" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">{category.productCount} produk</span>
                  {active ? <Check className="h-5 w-5 text-moss" /> : null}
                </div>
                <h3 className="mt-4 font-serif text-2xl font-bold">{category.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/65">{category.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="container-page">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Langkah 2</p>
            <h2 className="font-serif text-3xl font-bold">Pilih 2 sampai 4 produk</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              {selectedCategory ? `Produk yang tampil hanya dari kategori ${selectedCategory.name}.` : "Pilih kategori dulu untuk melihat produk."}
            </p>
          </div>
          <button type="button" onClick={() => setSelectedProductIds([])} className="btn-secondary w-fit">
            <RotateCcw className="h-4 w-4" />
            Reset pilihan
          </button>
        </div>

        <div className="sticky top-16 z-30 mb-5 rounded-lg border border-line bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">Produk terpilih: {selectedProducts.length}/4</p>
              <p className="text-xs text-ink/55">Minimal 2 produk diperlukan untuk menampilkan perbandingan.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedProducts.length ? selectedProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product)}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold"
                >
                  {product.name}
                  <X className="h-3.5 w-3.5" />
                </button>
              )) : <span className="text-sm text-ink/55">Belum ada produk dipilih.</span>}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryProducts.map((product) => {
            const selected = selectedProductIds.includes(product.id);
            const disabled = !selected && selectedProductIds.length >= 4;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product)}
                disabled={disabled}
                className={`card p-5 text-left transition hover:border-moss disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-moss ring-2 ring-moss/10" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-moss">{product.brand.name}</span>
                  {selected ? <Check className="h-5 w-5 text-moss" /> : null}
                </div>
                <h3 className="mt-3 font-serif text-2xl font-bold">{product.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/65">{product.shortDescription}</p>
                <p className="mt-3 text-sm font-semibold text-ink">{formatRupiah(product.priceEstimate)}</p>
                <p className="mt-2 text-xs leading-5 text-ink/60">Cocok untuk: {product.bestFor}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section id="hasil" className="bg-white py-12">
        <div className="container-page">
          <div className="mb-6">
            <p className="eyebrow">Langkah 3</p>
            <h2 className="font-serif text-3xl font-bold">Hasil perbandingan</h2>
          </div>

          {selectedProducts.length < 2 ? (
            <div className="card p-8 text-center text-sm leading-6 text-ink/65">
              Pilih minimal dua produk dari kategori yang sama untuk melihat verdict, spesifikasi, pros/cons, dan CTA pembelian.
            </div>
          ) : (
            <div className="grid gap-8">
              <article className="rounded-lg border border-moss/30 bg-[linear-gradient(135deg,#edf4eb,#ffffff)] p-6">
                <p className="eyebrow">Verdict pintar berdasarkan data produk</p>
                <h3 className="mt-3 font-serif text-3xl font-bold">Rekomendasi otomatis dari data yang tersedia</h3>
                <p className="mt-3 max-w-4xl leading-7 text-ink/75">{verdict.summary}</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {verdict.notes.map((note) => (
                    <p key={note} className="rounded-md border border-line bg-white p-3 text-sm leading-6 text-ink/70">{note}</p>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <VerdictPill label="Paling worth it" product={verdict.worthIt?.name} />
                  <VerdictPill label="Budget terbatas" product={verdict.budget?.name} />
                  <VerdictPill label="Kerja serius" product={verdict.seriousWork?.name} />
                  <VerdictPill label="Setup minimalis" product={verdict.minimalSetup?.name} />
                </div>
              </article>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {selectedProducts.map((product) => (
                  <article key={product.id} className="card grid gap-4 p-5">
                    <div>
                      <p className="text-xs font-semibold text-moss">{product.brand.name} / {product.category.name}</p>
                      <h3 className="mt-2 font-serif text-2xl font-bold">{product.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-ink/65">{product.editorialSummary}</p>
                    </div>
                    <div className="rounded-md border border-line bg-paper p-3">
                      <p className="text-xs font-semibold text-ink/55">Best for</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{product.bestFor}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-ink/55">Estimasi harga </span>
                      <strong>{formatRupiah(product.priceEstimate)}</strong>
                    </div>
                    <ProsConsMini items={product.prosCons} />
                    <div className="grid gap-2">
                      {product.affiliateLinks.length ? product.affiliateLinks.map((link) => (
                        <Link
                          key={link.id}
                          href={`/go/${link.redirectCode}?source_page_type=interactive_comparison&source_page_slug=${product.slug}`}
                          className={link.isPrimary ? "btn-primary w-full" : "btn-secondary w-full"}
                          rel="sponsored nofollow noopener"
                        >
                          {link.buttonLabel || `Cek di ${link.merchantName}`}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )) : <p className="text-sm text-ink/55">Link pembelian belum tersedia.</p>}
                    </div>
                  </article>
                ))}
              </div>

              <section>
                <h3 className="font-serif text-3xl font-bold">Perbandingan spesifikasi</h3>
                <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                  <table className="min-w-[720px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-line bg-ink text-left text-white">
                        <th className="w-48 px-4 py-3">Spesifikasi</th>
                        {selectedProducts.map((product) => (
                          <th key={product.id} className="px-4 py-3">{product.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {specLabels.map((label) => (
                        <tr key={label} className="border-b border-line last:border-0">
                          <th className="bg-white px-4 py-3 text-left font-semibold">{label}</th>
                          {selectedProducts.map((product) => (
                            <td key={`${product.id}-${label}`} className="bg-paper px-4 py-3 text-ink/75">
                              {product.specs.find((spec) => spec.label === label)?.value ?? "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function VerdictPill({ label, product }: { label: string; product?: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <p className="text-xs font-semibold text-moss">{label}</p>
      <p className="mt-1 text-sm font-bold text-ink">{product ?? "-"}</p>
    </div>
  );
}

function ProsConsMini({ items }: { items: { type: "PRO" | "CON"; content: string }[] }) {
  const pros = items.filter((item) => item.type === "PRO").slice(0, 3);
  const cons = items.filter((item) => item.type === "CON").slice(0, 3);
  return (
    <div className="grid gap-3 text-sm leading-6">
      <div>
        <p className="font-semibold text-moss">Kelebihan</p>
        <ul className="mt-1 grid gap-1 text-ink/70">
          {pros.map((item) => <li key={item.content}>+ {item.content}</li>)}
        </ul>
      </div>
      <div>
        <p className="font-semibold text-clay">Kekurangan</p>
        <ul className="mt-1 grid gap-1 text-ink/70">
          {cons.map((item) => <li key={item.content}>- {item.content}</li>)}
        </ul>
      </div>
    </div>
  );
}
