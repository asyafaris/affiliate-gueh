# TASK 001: ISR Caching - Fix Homepage force-dynamic

**Priority:** 1 (CRITICAL)
**Impact:** 70% cost reduction + 3x faster homepage
**Effort:** 30 min
**Risk:** Low (rollback trivial)

---

## PROBLEM ANALYSIS

**Current state:**
- File: `src/app/page.tsx` line 21
- Code: `export const dynamic = "force-dynamic";`
- Effect: EVERY request hits database (5 parallel queries)
- Cost at scale: 1000 concurrent users = 5000 DB queries/sec

**Solution:**
- Change to: `export const revalidate = 3600;` (1-hour ISR cache)
- Effect: Database hit only 1x per hour (999/1000 from CDN)
- Cost reduction: 70%, Speed: 3x faster

**Validation:**
- Homepage is 100% public content (no auth, no cookies)
- Data changes 1-5x/day (acceptable 1-hour stale)
- Can revalidate on-demand when admin publishes

---

## IMPLEMENTATION

### Step 1: Modify Homepage Export
File: `src/app/page.tsx`
Line: 21

**BEFORE:**
```typescript
export const dynamic = "force-dynamic";
```

**AFTER:**
```typescript
// ISR: Revalidate every 3600 seconds (1 hour)
// Homepage content (categories, products, articles) can be static
// On-demand revalidation when admin publishes content
export const revalidate = 3600;
```

**Command:**
```bash
# Edit file manually or use sed
# Line 21 should now have: export const revalidate = 3600;
```

### Step 2: Add Revalidation Import
File: `src/app/page.tsx`
After existing imports (around line 2-18), add:

**ADD:**
```typescript
import { revalidatePath } from "next/cache";
```

**Note:** Not used in this file, but needed for Step 3

### Step 3: Create Admin Actions File (if doesn't exist)
File: `src/app/admin/actions.ts`

**If file already exists:** Skip to Step 4
**If file doesn't exist:** Create new with:

```typescript
"use server"

import { revalidatePath } from "next/cache";

/**
 * Revalidate homepage after content changes
 * Called when admin publishes/updates product or article
 */
export async function revalidateHomepage() {
  try {
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Revalidation failed:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Revalidate all routes (nuclear option)
 * Use only if multiple changes or emergency
 */
export async function revalidateAllPages() {
  try {
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Revalidation failed:", error);
    return { success: false, error: String(error) };
  }
}
```

### Step 4: Hook Revalidation to Product Creation (Optional for Phase 1)
**Optional:** Add this AFTER TASK_001 tests pass, not mandatory for launch

If you want: When admin publishes product, homepage cache clears immediately
File: `src/app/admin/products/new/page.tsx` (or wherever product form is)
Find: Form submission handler, add after DB save:

```typescript
import { revalidateHomepage } from "../actions";

// After db.product.create() succeeds:
await revalidateHomepage();
```

**Same pattern for:** `src/app/admin/articles/new/page.tsx`

---

## TESTING

### Test 1: Verify Code Change
Run:
```bash
grep -n "revalidate" src/app/page.tsx
```
Expected: Line 21 shows `export const revalidate = 3600;`
Stop if: Still shows `force-dynamic`

### Test 2: Build Succeeds
Run:
```bash
npm run build
```
Expected: Build completes without errors
Stop if: Build fails, report error

### Test 3: Local Dev - Cache Test
Run:
```bash
npm run dev
```
Then in browser:
1. Open DevTools → Network tab
2. Visit http://localhost:3000
3. Check response headers for: `x-middleware-cache: MISS` (first load)
4. Reload page immediately
5. Check response headers for: `x-middleware-cache: HIT` (cached)

Expected: Second load is cached (Network shows smaller size or instant load)
Stop if: Still see database queries on every load

### Test 4: Response Time Improvement
Browser DevTools → Network:
1. First load (cold cache): Check DOMContentLoaded time
2. Second load (warm cache): Should be <200ms
3. Compare to baseline (should see 3x improvement)

Expected: Warm cache <200ms
Stop if: Still >500ms, ISR not working

### Test 5: Affiliate Click Still Works
1. Visit http://localhost:3000/produk/[any-published-product-slug]
2. Click any affiliate button
3. Should redirect to external link
4. Database should log click

Verify:
```bash
# In another terminal/psql
SELECT * FROM "AffiliateClick" ORDER BY "clickedAt" DESC LIMIT 1;
```

Expected: New row appears with current timestamp
Stop if: Affiliate click broken

### Test 6: Mobile View No Regression
1. DevTools → Toggle device toolbar (iOS/Android)
2. Visit homepage
3. Verify all sections render (no layout break)
4. Verify affiliate buttons clickable

Expected: Mobile view identical to before
Stop if: Any layout issues

### Test 7: Sitemap Still Generated
Run:
```bash
npm run build
```
Check:
```bash
ls -la .next/static/
```
Expected: Routes cached correctly
Stop if: Missing cache entries

---

## SUCCESS CRITERIA

- [ ] `export const revalidate = 3600;` at line 21
- [ ] Build succeeds
- [ ] First load: MISS (database hit)
- [ ] Second load: HIT (from cache)
- [ ] Warm cache response <200ms
- [ ] Affiliate click tracked
- [ ] Mobile view works
- [ ] No console errors

---

## ROLLBACK (If Something Breaks)

Quick revert:
```bash
git checkout src/app/page.tsx
npm run build
npm run dev
```

---

## REPORT TEMPLATE

When complete, report: