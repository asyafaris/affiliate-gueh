"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/public/ProductGrid";
import type { ProductCardData } from "@/types/domain";

const PAGE_SIZE = 8;

export function LoadMoreProductGrid({ products }: { products: ProductCardData[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = products.slice(0, visible);
  const remaining = products.length - shown.length;

  return (
    <div className="grid gap-6">
      <ProductGrid products={shown} />
      {remaining > 0 ? (
        <div className="grid justify-items-center gap-3 pt-2">
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(shown.length / products.length) * 100}%` }} />
          </div>
          <button type="button" onClick={() => setVisible((value) => value + PAGE_SIZE)} className="btn-secondary">
            Muat {Math.min(remaining, PAGE_SIZE)} produk lainnya
          </button>
        </div>
      ) : null}
    </div>
  );
}
