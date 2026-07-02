# TASK 003: SEO Metadata Admin Functionality

**Priority:** 3 (HIGH)
**Impact:** Custom meta tags per product → better SEO ranking potential
**Effort:** 2-3 hours
**Dependency:** TASK_001 must pass

---

## PROBLEM ANALYSIS

**Current state:**
- Database model `SeoMetadata` exists but never used in code
- Product page metadata hardcoded template: `"${product.name}: review, pros cons, dan link pembelian"`
- Admin cannot customize meta title/description per product
- Missed SEO optimization opportunity

**Solution:**
- Admin form to edit SeoMetadata per product
- Product page queries SeoMetadata, fallback to template if not set
- Component generates proper Open Graph tags

---

## IMPLEMENTATION

### Step 1: Create Admin SeoMetadata Editor Component
File: `src/components/admin/SeoMetadataForm.tsx` (create new)

```typescript
"use client"

import { useState } from "react";
import { updateSeoMetadata } from "@/app/admin/actions";

type Props = {
  productId: string;
  productName: string;
  currentData?: {
    seoTitle: string;
    metaDescription: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
  };
};

export function SeoMetadataForm({ productId, productName, currentData }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    seoTitle: currentData?.seoTitle || `${productName}: review, pros cons, dan link pembelian`,
    metaDescription:
      currentData?.metaDescription ||
      `Kurasi produk ${productName} dengan pros/cons, spesifikasi, harga, dan rekomendasi pembeli terpercaya.`,
    ogTitle: currentData?.ogTitle || productName,
    ogDescription: currentData?.ogDescription || `Baca review dan rekomendasi ${productName}`,
    ogImageUrl: currentData?.ogImageUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await updateSeoMetadata(productId, formData);
      if (result.success) {
        setMessage("✅ SEO metadata saved");
      } else {
        setMessage("❌ Error: " + result.error);
      }
    } catch (error) {
      setMessage("❌ Error: " + String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-line bg-white p-6">
      <div>
        <label className="block text-sm font-semibold">SEO Title (60 chars max)</label>
        <input
          type="text"
          maxLength={60}
          value={formData.seoTitle}
          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
          className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
          placeholder="Product name with key keyword"
        />
        <p className="mt-1 text-xs text-ink/60">{formData.seoTitle.length}/60</p>
      </div>

      <div>
        <label className="block text-sm font-semibold">Meta Description (160 chars max)</label>
        <textarea
          maxLength={160}
          rows={3}
          value={formData.metaDescription}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
          placeholder="Summary for search results snippet"
        />
        <p className="mt-1 text-xs text-ink/60">{formData.metaDescription.length}/160</p>
      </div>

      <div>
        <label className="block text-sm font-semibold">OG Title (for social share)</label>
        <input
          type="text"
          value={formData.ogTitle}
          onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
          className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
          placeholder="How it appears when shared on Twitter/Facebook"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold">OG Description (for social share)</label>
        <textarea
          rows={2}
          value={formData.ogDescription}
          onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
          className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
          placeholder="Teaser text for social preview"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold">OG Image URL (for social preview)</label>
        <input
          type="url"
          value={formData.ogImageUrl}
          onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
          className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-moss px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Simpan SEO Metadata"}
      </button>

      {message && (
        <p className={`text-sm ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
```

### Step 2: Add Server Action for Saving SeoMetadata
File: `src/app/admin/actions.ts`

Add to existing file (or create if doesn't exist):

```typescript
"use server"

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";

export async function updateSeoMetadata(
  productId: string,
  data: {
    seoTitle: string;
    metaDescription: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
  }
) {
  try {
    const db = getDb();

    // Upsert: update if exists, create if not
    await db.seoMetadata.upsert({
      where: {
        subjectType_subjectId: {
          subjectType: "product",
          subjectId: productId,
        },
      },
      update: {
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImageUrl: data.ogImageUrl,
      },
      create: {
        subjectType: "product",
        subjectId: productId,
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImageUrl: data.ogImageUrl,
      },
    });

    // Revalidate product page
    revalidatePath(`/produk/${productId}`);

    return { success: true };
  } catch (error) {
    console.error("SEO metadata update error:", error);
    return { success: false, error: String(error) };
  }
}
```

### Step 3: Update Product Page to Use SeoMetadata
File: `src/app/produk/[slug]/page.tsx`

Find: `generateMetadata` function (around line 56)

**BEFORE:**
```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return buildMetadata({
    title: `${product.name}: review, pros cons, dan link pembelian`,
    description: product.shortDescription,
    path: `/produk/${slug}`,
    image: product.images[0]?.imageUrl,
  });
}
```

**AFTER:**
```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  // Check for custom SEO metadata
  const db = getDb();
  const seoMeta = await db.seoMetadata.findUnique({
    where: {
      subjectType_subjectId: {
        subjectType: "product",
        subjectId: product.id,
      },
    },
  });

  // Use custom metadata if exists, fallback to template
  const title = seoMeta?.seoTitle || `${product.name}: review, pros cons, dan link pembelian`;
  const description = seoMeta?.metaDescription || product.shortDescription;
  const image = seoMeta?.ogImageUrl || product.images[0]?.imageUrl;

  return buildMetadata({
    title,
    description,
    path: `/produk/${slug}`,
    image,
    ogTitle: seoMeta?.ogTitle,
    ogDescription: seoMeta?.ogDescription,
  });
}
```

### Step 4: Add SeoMetadataForm to Product Edit Page
File: `src/app/admin/products/[id]/edit/page.tsx`

At top, add import:
```typescript
import { SeoMetadataForm } from "@/components/admin/SeoMetadataForm";
```

In page component, after product form, add:

```typescript
<section className="mt-8 border-t border-line pt-8">
  <h2 className="mb-4 text-2xl font-bold">SEO & Social Preview</h2>
  <SeoMetadataForm
    productId={product.id}
    productName={product.name}
    currentData={seoMeta} // Fetch seoMeta in page component
  />
</section>
```

**Note:** May need to fetch seoMeta in page component first:
```typescript
const seoMeta = await db.seoMetadata.findUnique({
  where: {
    subjectType_subjectId: {
      subjectType: "product",
      subjectId: product.id,
    },
  },
});
```

---

## TESTING

### Test 1: Build Succeeds
Run:
```bash
npm run build
```
Expected: No errors
Stop if: Build fails

### Test 2: Component Renders
1. Navigate to admin → Products → Edit any product
2. Scroll down to "SEO & Social Preview" section
3. Should see form with 5 fields

Expected: Form visible
Stop if: Not rendering, check console for errors

### Test 3: Save SeoMetadata
1. Fill in all fields:
   - SEO Title: "Keyboard Mekanik Terbaik 2024 + Review Lengkap"
   - Meta Description: "Kurasi 5 keyboard mekanik terbaik untuk kerja. Bandingkan spec, harga, dan rating dari pembeli terpercaya."
   - OG Title: "Best Mechanical Keyboard 2024"
   - OG Description: "Review lengkap keyboard terbaik untuk produktivitas"
   - OG Image: (leave blank for now)
2. Click "Simpan SEO Metadata"

Expected: "✅ SEO metadata saved" message
Stop if: Error, check database connection

### Test 4: Verify in Database
Run:
```bash
psql $DATABASE_URL -c "SELECT * FROM \"SeoMetadata\" ORDER BY \"updatedAt\" DESC LIMIT 1;"
```

Expected: Row shows your saved data
Stop if: Empty or incorrect

### Test 5: Product Page Uses Custom Metadata
1. Rebuild: `npm run build`
2. Visit product page: `/produk/[slug]`
3. View page source (Ctrl+U)
4. Search for: `<title>` tag
5. Should show custom title you entered, not template

Expected: Title matches custom value
Stop if: Still shows template

### Test 6: Character Counters Work
1. In form, edit "SEO Title" field
2. Add text until 60+ characters
3. Should show "61/60" (red counter)

Expected: Counter updates real-time
Stop if: Not counting

### Test 7: Database Upsert Works
1. Edit same product again
2. Change SEO title to different text
3. Save
4. Verify database shows new value (check with psql)

Expected: Update successful
Stop if: Creates duplicate row instead of updating

---

## SUCCESS CRITERIA

- [ ] SeoMetadataForm component created
- [ ] updateSeoMetadata server action working
- [ ] Product page queries SeoMetadata on load
- [ ] Custom metadata saved to database
- [ ] Product page renders custom title
- [ ] Character counters working
- [ ] Edit existing SEO data (upsert) working

---

## NEXT STEPS

After this task, each product can have custom meta tags for better SEO.

**Later:**
- Create batch SEO metadata generator (AI or template-based)
- Monitor keyword rankings in Search Console
- A/B test different titles/descriptions

---

## REPORT TEMPLATE

```
✅ TASK_003 COMPLETE

Files created:
- src/components/admin/SeoMetadataForm.tsx

Files modified:
- src/app/admin/actions.ts (added updateSeoMetadata)
- src/app/produk/[slug]/page.tsx (query SeoMetadata in generateMetadata)
- src/app/admin/products/[id]/edit/page.tsx (added SeoMetadataForm)

Test results:
- Build: ✅ PASS
- Form renders: ✅ PASS
- Save metadata: ✅ PASS
- Database upsert: ✅ PASS
- Product page uses custom title: ✅ PASS

Next: docs/TASK_004_EMAIL_CAPTURE.md
```