# TASK 005: Expert Sources Infrastructure

**Priority:** 5 (HIGH for credibility)
**Impact:** Trust signal → converts skeptics into clickers
**Effort:** 3-4 hours
**Dependency:** TASK_001 must pass

---

## PROBLEM ANALYSIS

**Current state:**
- Products have no expert source attribution
- Positioning claim: "Editorial kurasi + expert sources" but zero expert data in schema
- Missed trust opportunity

**Solution:**
- Add `ExpertSource` model to database
- Admin can add YouTube links, blog references, forum mentions to each product
- Product page displays: "Dikonfirmasi oleh @YouTuber (250k followers): [quote]"
- Increases credibility (not made up by affiliate site, actual experts endorse)

---

## IMPLEMENTATION

### Step 1: Add ExpertSource Model to Schema
File: `prisma/schema.prisma`

Add model before closing:
```prisma
model ExpertSource {
  id                    String   @id @default(cuid())
  productId             String
  sourceType            String   // "YOUTUBE" | "BLOG" | "FORUM" | "REVIEW"
  sourceName            String   // "@YouTuberName" or "Blog Name"
  sourceUrl             String
  sourceAuthorFollowers Int?     // Follower count for credibility
  quote                 String?  // What they said about product
  addedAt               DateTime @default(now())
  product               Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([sourceType])
}

// Also modify Product model to include:
model Product {
  // ... existing fields ...
  expertSources ExpertSource[]
}
```

Migration:
```bash
npx prisma migrate dev --name add_expert_sources
```

### Step 2: Create ExpertSource Form Component
File: `src/components/admin/ExpertSourceForm.tsx` (create new)

```typescript
"use client"

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { addExpertSource, removeExpertSource } from "@/app/admin/actions";

type ExpertSource = {
  id: string;
  sourceType: string;
  sourceName: string;
  sourceUrl: string;
  sourceAuthorFollowers: number | null;
  quote: string | null;
};

type Props = {
  productId: string;
  expertSources: ExpertSource[];
};

export function ExpertSourceForm({ productId, expertSources }: Props) {
  const [sources, setSources] = useState<ExpertSource[]>(expertSources);
  const [newSource, setNewSource] = useState({
    sourceType: "YOUTUBE",
    sourceName: "",
    sourceUrl: "",
    sourceAuthorFollowers: "",
    quote: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAdd = async () => {
    if (!newSource.sourceName || !newSource.sourceUrl) {
      setMessage("❌ Isi nama dan URL");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await addExpertSource(productId, {
        sourceType: newSource.sourceType,
        sourceName: newSource.sourceName,
        sourceUrl: newSource.sourceUrl,
        sourceAuthorFollowers: newSource.sourceAuthorFollowers
          ? parseInt(newSource.sourceAuthorFollowers)
          : null,
        quote: newSource.quote || null,
      });

      if (result.success) {
        setSources([...sources, result.data]);
        setNewSource({
          sourceType: "YOUTUBE",
          sourceName: "",
          sourceUrl: "",
          sourceAuthorFollowers: "",
          quote: "",
        });
        setMessage("✅ Expert source added");
      } else {
        setMessage("❌ Error: " + result.error);
      }
    } catch (error) {
      setMessage("❌ Error: " + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sourceId: string) => {
    setLoading(true);

    try {
      const result = await removeExpertSource(sourceId);

      if (result.success) {
        setSources(sources.filter((s) => s.id !== sourceId));
      } else {
        setMessage("❌ Error deleting");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-line bg-white p-6">
      <h3 className="font-bold">Expert Sources (Influencer, Blog, Forum yang mention produk ini)</h3>

      {/* List existing */}
      <div className="space-y-2">
        {sources.map((source) => (
          <div key={source.id} className="flex items-start justify-between rounded-lg border border-line/50 bg-paper p-3">
            <div className="flex-1">
              <div className="flex gap-2 text-xs font-semibold">
                <span className="rounded bg-moss/10 px-2 py-0.5 text-moss">{source.sourceType}</span>
                <span>{source.sourceName}</span>
                {source.sourceAuthorFollowers && (
                  <span className="text-ink/60">({source.sourceAuthorFollowers.toLocaleString()} followers)</span>
                )}
              </div>
              <p className="mt-1 text-xs text-ink/70">{source.sourceUrl}</p>
              {source.quote && <p className="mt-1 text-xs italic text-ink/75">"{source.quote}"</p>}
            </div>
            <button
              onClick={() => handleDelete(source.id)}
              className="ml-2 rounded p-1 hover:bg-red-100"
              type="button"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="border-t border-line pt-4">
        <h4 className="mb-3 text-sm font-semibold">Tambah Expert Source</h4>

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold">Tipe Sumber</label>
              <select
                value={newSource.sourceType}
                onChange={(e) => setNewSource({ ...newSource, sourceType: e.target.value })}
                className="mt-1 w-full rounded border border-line px-2 py-2 text-sm"
              >
                <option>YOUTUBE</option>
                <option>BLOG</option>
                <option>FORUM</option>
                <option>REVIEW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold">Nama Expert / Channel</label>
              <input
                type="text"
                value={newSource.sourceName}
                onChange={(e) => setNewSource({ ...newSource, sourceName: e.target.value })}
                placeholder="@YouTuberName atau Blog Name"
                className="mt-1 w-full rounded border border-line px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold">URL</label>
            <input
              type="url"
              value={newSource.sourceUrl}
              onChange={(e) => setNewSource({ ...newSource, sourceUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="mt-1 w-full rounded border border-line px-2 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Followers (optional)</label>
            <input
              type="number"
              value={newSource.sourceAuthorFollowers}
              onChange={(e) => setNewSource({ ...newSource, sourceAuthorFollowers: e.target.value })}
              placeholder="250000"
              className="mt-1 w-full rounded border border-line px-2 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Quote (apa yang mereka bilang, optional)</label>
            <textarea
              value={newSource.quote}
              onChange={(e) => setNewSource({ ...newSource, quote: e.target.value })}
              placeholder="Keyboard ini best budget option 2024"
              rows={2}
              className="mt-1 w-full rounded border border-line px-2 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded bg-moss px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            type="button"
          >
            <Plus className="h-4 w-4" /> Add Source
          </button>

          {message && (
            <p className={`text-sm ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Add Server Actions
File: `src/app/admin/actions.ts`

Add functions:
```typescript
export async function addExpertSource(
  productId: string,
  data: {
    sourceType: string;
    sourceName: string;
    sourceUrl: string;
    sourceAuthorFollowers: number | null;
    quote: string | null;
  }
) {
  try {
    const db = getDb();
    const expertSource = await db.expertSource.create({
      data: {
        productId,
        ...data,
      },
    });

    revalidatePath(`/produk/${productId}`);

    return { success: true, data: expertSource };
  } catch (error) {
    console.error("Add expert source error:", error);
    return { success: false, error: String(error) };
  }
}

export async function removeExpertSource(sourceId: string) {
  try {
    const db = getDb();

    // Get source to find product ID for revalidation
    const source = await db.expertSource.findUnique({
      where: { id: sourceId },
      include: { product: true },
    });

    await db.expertSource.delete({ where: { id: sourceId } });

    if (source) {
      revalidatePath(`/produk/${source.product.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Remove expert source error:", error);
    return { success: false, error: String(error) };
  }
}
```

### Step 4: Create ExpertSources Display Component
File: `src/components/public/ExpertSourcesList.tsx` (create new)

```typescript
import { ExternalLink, Youtube, BookOpen, MessageCircle } from "lucide-react";

type Source = {
  sourceType: string;
  sourceName: string;
  sourceUrl: string;
  sourceAuthorFollowers: number | null;
  quote: string | null;
};

type Props = {
  sources: Source[];
};

export function ExpertSourcesList({ sources }: Props) {
  if (sources.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "YOUTUBE":
        return <Youtube className="h-4 w-4" />;
      case "BLOG":
        return <BookOpen className="h-4 w-4" />;
      case "FORUM":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-ink/75">Dikonfirmasi oleh expert sumber:</p>
      {sources.map((source, idx) => (
        
          key={idx}
          href={source.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg border border-line bg-paper p-3 transition hover:border-moss hover:bg-white"
        >
          <div className="mt-0.5 text-moss">{getIcon(source.sourceType)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span>{source.sourceName}</span>
              {source.sourceAuthorFollowers && (
                <span className="text-xs text-ink/60">({(source.sourceAuthorFollowers / 1000).toFixed(0)}k followers)</span>
              )}
            </div>
            {source.quote && (
              <p className="mt-1 text-sm italic text-ink/70">"{source.quote}"</p>
            )}
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-moss hover:underline">
              Lihat sumber <ExternalLink className="h-3 w-3" />
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
```

### Step 5: Add to Product Page
File: `src/app/produk/[slug]/page.tsx`

Find: `getProduct` query (around line 30)

Update to include expertSources:
```typescript
async function getProduct(slug: string) {
  return getDb().product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      specs: { orderBy: { sortOrder: "asc" } },
      prosCons: { orderBy: { sortOrder: "asc" } },
      expertSources: true, // ADD THIS
    },
  });
}
```

Then in component, add to product details section (after "Alasan rekomendasi"):

```typescript
import { ExpertSourcesList } from "@/components/public/ExpertSourcesList";

// In JSX:
{product.expertSources.length > 0 && (
  <section className="rounded-lg border border-line bg-paper p-6">
    <ExpertSourcesList sources={product.expertSources} />
  </section>
)}
```

### Step 6: Add to Admin Product Edit
File: `src/app/admin/products/[id]/edit/page.tsx`

Add import:
```typescript
import { ExpertSourceForm } from "@/components/admin/ExpertSourceForm";
```

Update product query to include expertSources:
```typescript
include: {
  // ... existing ...
  expertSources: true,
}
```

Then in JSX, after form:
```typescript
<section className="mt-8 border-t border-line pt-8">
  <h2 className="mb-4 text-2xl font-bold">Expert Sources</h2>
  <ExpertSourceForm
    productId={product.id}
    expertSources={product.expertSources}
  />
</section>
```

---

## TESTING

### Test 1: Build Succeeds
Run:
```bash
npm run build
```
Expected: No errors

### Test 2: Database Migration
Run:
```bash
npx prisma migrate dev
```
Expected: Migration succeeds
Stop if: Schema error

### Test 3: Admin Form Renders
1. `npm run dev`
2. Go to admin → Products → Edit any product
3. Should see "Expert Sources" section with form

Expected: Form visible with fields
Stop if: Not rendering

### Test 4: Add Expert Source
1. Fill in fields:
   - Tipe: YOUTUBE
   - Nama: @SetupKerjaIndonesia
   - URL: https://youtube.com/watch?v=example
   - Followers: 250000
   - Quote: "Keyboard ini worth it banget"
2. Click "Add Source"

Expected: Source appears in list
Stop if: Error, check database

### Test 5: Delete Expert Source
1. Click trash icon on added source
2. Source should disappear

Expected: Deletion works
Stop if: Error

### Test 6: Product Page Displays Sources
1. Visit product page `/produk/[slug]`
2. Should see "Dikonfirmasi oleh expert sumber:" section
3. Should show all added sources with icon, name, followers, quote

Expected: All sources display correctly
Stop if: Not showing, check console

### Test 7: Multiple Sources
1. Add 3+ expert sources to same product
2. Product page should show all

Expected: All display
Stop if: Only some show

### Test 8: Mobile View
1. DevTools → mobile
2. Visit product page
3. Expert sources should display stacked, not overflowing

Expected: Mobile layout works
Stop if: Overflow or cut off

### Test 9: Links Working
1. Click on expert source link
2. Should open in new tab

Expected: Link works (view in network tab)
Stop if: Broken link

---

## SUCCESS CRITERIA

- [ ] ExpertSource model created + migrated
- [ ] ExpertSourceForm component working
- [ ] Admin can add/delete sources
- [ ] Product page displays sources
- [ ] All 3 source types display (YOUTUBE, BLOG, FORUM)
- [ ] Links clickable
- [ ] Mobile view works
- [ ] Build succeeds

---

## NEXT STEPS

After this task, each product can showcase expert endorsements.

**Manual action (not code):**
- Watch 5-10 YouTube videos about "setup kerja"
- Find products mentioned + extract links
- Add to relevant products in admin
- Screenshot: "Added expert sources to 5 products"

**Later:**
- Auto-scrape YouTube channel data (advanced)
- Show expert leaderboard ("Most recommended by...")
- Notify experts when their content featured

---

## REPORT TEMPLATE

```
✅ TASK_005 COMPLETE

Files created:
- prisma/migrations/[timestamp]_add_expert_sources/migration.sql
- src/components/admin/ExpertSourceForm.tsx
- src/components/public/ExpertSourcesList.tsx

Files modified:
- prisma/schema.prisma (added ExpertSource model)
- src/app/admin/actions.ts (added addExpertSource, removeExpertSource)
- src/app/produk/[slug]/page.tsx (query expertSources, display component)
- src/app/admin/products/[id]/edit/page.tsx (added form)

Test results:
- Build: ✅ PASS
- Migration: ✅ PASS
- Admin form: ✅ PASS
- Add/delete: ✅ PASS
- Product page display: ✅ PASS
- Mobile view: ✅ PASS

Credibility improvement:
- Expert sources added to [X] products (update after manual work)

PHASE 1 COMPLETE.
All 5 core tasks done. Ready for Phase 2 (content seeding + launch).
```