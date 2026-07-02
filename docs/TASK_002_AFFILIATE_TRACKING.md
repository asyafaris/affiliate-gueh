# TASK 002: Affiliate Tracking Dashboard

**Priority:** 2 (HIGH)
**Impact:** Monetization visibility + optimization data
**Effort:** 2-3 hours
**Dependency:** TASK_001 must pass

---

## PROBLEM ANALYSIS

**Current state:**
- Database model `AffiliateClick` exists (tracks clicks)
- But: No dashboard/query logic to view the data
- Problem: Can't see which products convert, which merchants best, which traffic source works

**Solution:**
- Build SQL queries to extract: Daily CTR, merchant breakdown, source breakdown
- Create simple dashboard (Google Sheets, Metabase, or manual SQL + chart)
- Integrate Google Analytics 4 for traffic source

**This task:** Create query logic + manual dashboard (simplest path)

---

## IMPLEMENTATION

### Step 1: Create Analytics Query File
File: `src/lib/analytics.ts` (create new)

```typescript
import { getDb } from "./db";

export async function getAffiliateStats(startDate: Date, endDate: Date) {
  const db = getDb();

  // Get all clicks in date range
  const clicks = await db.affiliateClick.findMany({
    where: {
      clickedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      product: true,
      affiliateLink: true,
    },
  });

  // Breakdown by merchant
  const byMerchant: Record<string, number> = {};
  clicks.forEach((click) => {
    const merchant = click.affiliateLink.merchantName;
    byMerchant[merchant] = (byMerchant[merchant] || 0) + 1;
  });

  // Breakdown by product
  const byProduct: Record<string, { count: number; name: string }> = {};
  clicks.forEach((click) => {
    const productId = click.productId;
    byProduct[productId] = {
      count: (byProduct[productId]?.count || 0) + 1,
      name: click.product.name,
    };
  });

  // Breakdown by source page
  const bySourcePage: Record<string, number> = {};
  clicks.forEach((click) => {
    const source = `${click.sourcePageType}:${click.sourcePageSlug}`;
    bySourcePage[source] = (bySourcePage[source] || 0) + 1;
  });

  return {
    totalClicks: clicks.length,
    dateRange: { start: startDate, end: endDate },
    byMerchant,
    byProduct,
    bySourcePage,
    rawData: clicks,
  };
}

export async function getDailyCTR(productId: string, days: number = 7) {
  const db = getDb();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get product impressions (from page views)
  // Note: This requires Google Analytics integration
  // For now, return clicks only

  const clicks = await db.affiliateClick.findMany({
    where: {
      productId,
      clickedAt: {
        gte: startDate,
      },
    },
  });

  return {
    productId,
    period: days,
    totalClicks: clicks.length,
    avgPerDay: (clicks.length / days).toFixed(2),
  };
}
```

### Step 2: Create Analytics Endpoint
File: `src/app/api/admin/analytics/route.ts` (create new)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAffiliateStats } from "@/lib/analytics";

/**
 * GET /api/admin/analytics?days=7
 * Returns affiliate click stats for last N days
 * Only for admin use
 */
export async function GET(request: NextRequest) {
  // TODO: Add auth check (verify admin session)
  // For now, assume dev/admin only

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "7");

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const stats = await getAffiliateStats(startDate, endDate);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

### Step 3: Manual Dashboard SQL Queries
Save these in `/docs/ANALYTICS_QUERIES.sql` for manual execution:

```sql
-- Query 1: Daily click count last 7 days
SELECT
  DATE(clicked_at) as date,
  COUNT(*) as clicks
FROM "AffiliateClick"
WHERE clicked_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(clicked_at)
ORDER BY date DESC;

-- Query 2: Clicks by merchant
SELECT
  m.merchant_name,
  COUNT(*) as clicks
FROM "AffiliateClick" c
JOIN "ProductAffiliateLink" m ON c.affiliate_link_id = m.id
WHERE c.clicked_at >= NOW() - INTERVAL '7 days'
GROUP BY m.merchant_name
ORDER BY clicks DESC;

-- Query 3: Top 10 products by clicks
SELECT
  p.name,
  COUNT(*) as clicks,
  (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()) as percentage
FROM "AffiliateClick" c
JOIN "Product" p ON c.product_id = p.id
WHERE c.clicked_at >= NOW() - INTERVAL '7 days'
GROUP BY p.id, p.name
ORDER BY clicks DESC
LIMIT 10;

-- Query 4: Click to product page conversion rate
-- (clicks / product page views)
-- NOTE: Requires GA4 data integration (future task)
SELECT
  'TBD' as metric
WHERE FALSE; -- Placeholder

-- Query 5: Source page analysis
SELECT
  source_page_type,
  source_page_slug,
  COUNT(*) as clicks
FROM "AffiliateClick"
WHERE clicked_at >= NOW() - INTERVAL '7 days'
GROUP BY source_page_type, source_page_slug
ORDER BY clicks DESC;
```

### Step 4: Test Endpoint
Run:
```bash
npm run dev
```

Then manually test:
```bash
curl http://localhost:3000/api/admin/analytics?days=7
```

Expected: Returns JSON with affiliate stats
If no data yet: Empty arrays (normal if no clicks yet)

---

## TESTING

### Test 1: Verify Files Created
Run:
```bash
ls -la src/lib/analytics.ts
ls -la src/app/api/admin/analytics/route.ts
```
Expected: Both files exist
Stop if: Not found

### Test 2: Build Succeeds
Run:
```bash
npm run build
```
Expected: No errors
Stop if: Build fails

### Test 3: Endpoint Works
Run:
```bash
npm run dev
```

Then (in another terminal):
```bash
curl -s http://localhost:3000/api/admin/analytics?days=7 | json_pp
```

Expected: JSON output with structure:
```json
{
  "totalClicks": 0,
  "dateRange": {...},
  "byMerchant": {},
  "byProduct": {},
  "bySourcePage": {}
}
```

Stop if: 500 error, report error

### Test 4: Create Test Click Data
Add manually to database:
```sql
INSERT INTO "Product" (id, category_id, brand_id, name, slug, short_description, editorial_summary, best_for, price_estimate, is_published)
VALUES (
  'test-prod-1',
  (SELECT id FROM "Category" LIMIT 1),
  (SELECT id FROM "Brand" LIMIT 1),
  'Test Product',
  'test-product',
  'Test',
  'Test',
  'Testing',
  100000,
  true
);

INSERT INTO "ProductAffiliateLink" (id, product_id, merchant_name, button_label, affiliate_url, redirect_code, is_primary, is_active)
VALUES (
  'test-link-1',
  'test-prod-1',
  'Shopee',
  'Cek di Shopee',
  'https://shopee.co.id/test',
  'test-redirect-1',
  true,
  true
);

INSERT INTO "AffiliateClick" (id, product_id, affiliate_link_id, source_page_type, source_page_slug, clicked_at)
VALUES (
  'test-click-1',
  'test-prod-1',
  'test-link-1',
  'product',
  'test-product',
  NOW()
);
```

Then test endpoint again:
```bash
curl -s http://localhost:3000/api/admin/analytics?days=7 | json_pp
```

Expected: Should show 1 click in byMerchant["Shopee"], etc

### Test 5: Test Different Date Ranges
```bash
curl "http://localhost:3000/api/admin/analytics?days=1"
curl "http://localhost:3000/api/admin/analytics?days=30"
```

Expected: Returns data for requested range
Stop if: Always 0 or error

---

## SUCCESS CRITERIA

- [ ] analytics.ts created with query functions
- [ ] /api/admin/analytics endpoint working
- [ ] Endpoint returns valid JSON
- [ ] Queries show byMerchant, byProduct, bySourcePage breakdown
- [ ] Test click data appears in results
- [ ] Build succeeds

---

## NEXT STEPS

After this task, analytics dashboard is queryable via API.

**Later (Phase 2):**
- Create admin dashboard UI to visualize this data
- Integrate Google Analytics 4 for traffic source
- Automated email daily report

---

## REPORT TEMPLATE