"use client";

import { useMemo, useState } from "react";
import { Check, Crown, RotateCcw, X } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { generateComparisonVerdict, type VerdictProduct } from "@/lib/comparison";
import { MerchantCta } from "@/components/public/AffiliateButtonGroup";
import { VerdictPanel } from "@/components/shared/VerdictPanel";
import { FeatureMatrix } from "@/components/shared/FeatureMatrix";

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
    price?: number | null;
  }[];
};

const INSIGHT_ICONS = ["✓", "↓", "≈"];

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
          <h2 className="text-3xl">Pilih kategori produk</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
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
                className={cn("card min-h-44 min-w-0 p-5 text-left", active && "border-accent ring-2 ring-accent/20")}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="badge bg-accent-tint text-accent-dark">{category.productCount} produk</span>
                  {active ? <Check className="h-5 w-5 text-accent-dark" /> : null}
                </div>
                <h3 className="mt-4 break-words text-2xl">{category.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">{category.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="container-page">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Langkah 2</p>
            <h2 className="text-3xl">Pilih 2 sampai 4 produk</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              {selectedCategory ? `Produk yang tampil hanya dari kategori ${selectedCategory.name}.` : "Pilih kategori dulu untuk melihat produk."}
            </p>
          </div>
          <button type="button" onClick={() => setSelectedProductIds([])} className="btn-secondary w-fit">
            <RotateCcw className="h-4 w-4" />
            Reset pilihan
          </button>
        </div>

        <div className="sticky top-[76px] z-30 mb-5 rounded-card border border-neutral-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">Produk terpilih: {selectedProducts.length}/4</p>
              <p className="text-xs text-neutral-500">Minimal 2 produk diperlukan untuk menampilkan perbandingan.</p>
            </div>
            <div className="flex min-w-0 flex-wrap gap-2">
              {selectedProducts.length ? selectedProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product)}
                  className="inline-flex max-w-full items-center gap-2 rounded-full border-2 border-accent bg-accent-tint px-3 py-1.5 text-left text-xs font-semibold text-accent-dark"
                >
                  <span className="min-w-0 break-words">{product.name}</span>
                  <X className="h-3.5 w-3.5" />
                </button>
              )) : <span className="text-sm text-neutral-500">Belum ada produk dipilih.</span>}
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
                className={cn("card min-w-0 p-5 text-left disabled:cursor-not-allowed disabled:opacity-50", selected && "border-accent ring-2 ring-accent/20")}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-accent-dark">{product.brand.name}</span>
                  {selected ? <Check className="h-5 w-5 text-accent-dark" /> : null}
                </div>
                <h3 className="mt-3 break-words text-2xl">{product.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{product.shortDescription}</p>
                <p className="mt-3 text-sm font-semibold text-primary">{formatRupiah(product.priceEstimate)}</p>
                <p className="mt-2 text-xs leading-5 text-neutral-500">Cocok untuk: {product.bestFor}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section id="hasil" className="bg-white py-12">
        <div className="container-page">
          <div className="mb-6">
            <p className="eyebrow">Langkah 3</p>
            <h2 className="text-3xl">Hasil perbandingan</h2>
          </div>

          {selectedProducts.length < 2 ? (
            <div className="card p-8 text-center text-sm leading-6 text-neutral-600">
              Pilih minimal dua produk dari kategori yang sama untuk melihat verdict, spesifikasi, pros/cons, dan CTA pembelian.
            </div>
          ) : (
            <div className="grid gap-8">
              <VerdictPanel eyebrow="Verdict pintar berdasarkan data produk" headline="Rekomendasi otomatis dari data yang tersedia">
                <p className="max-w-4xl">{verdict.summary}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {verdict.notes.map((note, index) => (
                    <p key={note} className="flex gap-2 rounded-control border border-neutral-200 bg-white p-3 text-sm leading-6 text-neutral-700">
                      <span className="flex-none font-bold text-accent-dark">{INSIGHT_ICONS[index % INSIGHT_ICONS.length]}</span>
                      {note}
                    </p>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <VerdictChip label="Paling worth it" product={verdict.worthIt} winner />
                  <VerdictChip label="Budget terbatas" product={verdict.budget} />
                  <VerdictChip label="Kerja serius" product={verdict.seriousWork} />
                  <VerdictChip label="Setup minimalis" product={verdict.minimalSetup} />
                </div>
              </VerdictPanel>

              <div className="grid items-start gap-4 xl:grid-cols-2">
                {selectedProducts.map((product) => (
                  <article key={product.id} className="card relative flex min-w-0 flex-col gap-4 p-5">
                    {product.id === verdict.worthIt?.id ? (
                      <span className="badge absolute -top-2.5 left-4 rounded-full bg-primary text-white">
                        <Crown className="h-3 w-3" /> Winner
                      </span>
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-accent-dark">{product.brand.name} / {product.category.name}</p>
                      <h3 className="mt-2 break-words text-2xl">{product.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-neutral-600">{product.editorialSummary}</p>
                    </div>
                    <div className="rounded-control bg-accent-tint p-3">
                      <p className="text-xs font-semibold text-accent-dark">Best for</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{product.bestFor}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-neutral-500">Estimasi harga </span>
                      <strong>{formatRupiah(product.priceEstimate)}</strong>
                    </div>
                    <ProsConsMini items={product.prosCons} />
                    <div className="grid justify-items-start gap-2 pt-2">
                      {product.affiliateLinks.length ? product.affiliateLinks.map((link) => (
                        <MerchantCta
                          key={link.id}
                          link={link}
                          sourcePageType="interactive_comparison"
                          sourcePageSlug={product.slug}
                          compact
                        />
                      )) : <p className="text-sm text-neutral-500">Link pembelian belum tersedia.</p>}
                    </div>
                  </article>
                ))}
              </div>

              <section>
                <h3 className="text-3xl">Perbandingan spesifikasi</h3>
                <div className="mt-4">
                  <FeatureMatrix products={selectedProducts} />
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function VerdictChip({ label, product, winner }: { label: string; product?: VerdictProduct; winner?: boolean }) {
  return (
    <div className={cn("rounded-control border-2 bg-white p-3", winner && product ? "border-accent" : "border-neutral-200")}>
      <p className="text-xs font-semibold text-accent-dark">{winner && product ? "★ " : ""}{label}</p>
      <p className="mt-1 text-sm font-bold text-primary">{product?.name ?? "-"}</p>
    </div>
  );
}

function ProsConsMini({ items }: { items: { type: "PRO" | "CON"; content: string }[] }) {
  const pros = items.filter((item) => item.type === "PRO").slice(0, 3);
  const cons = items.filter((item) => item.type === "CON").slice(0, 3);
  return (
    <div className="grid gap-3 text-sm leading-6">
      <div>
        <p className="font-semibold text-accent-dark">Kelebihan</p>
        <ul className="mt-1 grid gap-1 text-neutral-600">
          {pros.map((item) => <li key={item.content} className="break-words">+ {item.content}</li>)}
        </ul>
      </div>
      <div>
        <p className="font-semibold text-warn">Kekurangan</p>
        <ul className="mt-1 grid gap-1 text-neutral-600">
          {cons.map((item) => <li key={item.content} className="break-words">- {item.content}</li>)}
        </ul>
      </div>
    </div>
  );
}
