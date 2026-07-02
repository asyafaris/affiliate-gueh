# Pre-Design Audit: Baseline Metrics + Constraints

**Objective:** Measure current state BEFORE redesign. Prevent regression, identify quick wins.

---

## PART 1: CAPTURE BASELINE (Day 1)

### Metric 1: Homepage Bounce Rate
**How to measure:**
1. Add GA4 event to page load:
```typescript
// src/app/page.tsx - add at top
useEffect(() => {
  gtag.event('page_view', {
    page_path: '/',
    page_title: 'Homepage'
  });
}, []);
```

2. Check Google Analytics → Engagement → Bounce rate
3. Record: **Current bounce rate: [X]%**
4. Target after redesign: <40% (typical for editorial)

**Baseline report template:**
Homepage Bounce Rate: 48% (guess if nggak ada GA)
Expected after: 38% (remove confusion from 6 sections)
Measurement: GA4, check daily

### Metric 2: Product Page CTR (Click-Through to Affiliate)
**How to measure:**
1. Already tracking via `AffiliateClick` table
2. Query:
```sql
SELECT
  COUNT(*) as total_clicks,
  COUNT(DISTINCT "productId") as products_with_clicks,
  AVG(clicks_per_product) as avg_ctr
FROM (
  SELECT "productId", COUNT(*) as clicks_per_product
  FROM "AffiliateClick"
  WHERE "clickedAt" >= NOW() - INTERVAL '7 days'
  GROUP BY "productId"
) subq;
```

3. Record: **Current product CTR: [X]%**
4. Target: ≥2% (current probably 0.5-1%)

### Metric 3: Email Capture Rate
**How to measure:**
1. Add tracking to email form (TASK_004 should have this):
```typescript
const emailCaptureRate = (subscriberCount / totalVisitors) * 100
```

2. Record: **Current capture: [X]%**
3. Target: 15-20%

### Metric 4: Page Load Performance
**How to measure:**
```bash
# Lighthouse audit
npm run build
# Use Chrome DevTools → Lighthouse
# Record: Performance score, LCP (Largest Contentful Paint)
```

Record:
Homepage LCP: [X]ms (target: <2500ms)
Product page LCP: [X]ms (target: <2500ms)

### Metric 5: Mobile Usability
**How to measure:**
1. Open on iPhone 12 (390px), Samsung A12 (412px) actual device
2. Check:
   - Hero overlflow? (yes/no)
   - Buttons clickable without zooming? (yes/no)
   - Text readable? (yes/no)
   - Layout break anywhere? (yes/no)

Record:
iPhone 12: [issue1], [issue2]
Samsung A12: [issue1], [issue2]

---

## PART 2: CONSTRAINTS MAPPING

### Constraint 1: Viewport Sizes (Not "test on 3 devices")
**Actual breakpoints:**
```typescript
// Tailwind defaults
sm: 640px   // Most tablets
md: 768px   // iPad
lg: 1024px  // Desktop small
xl: 1280px  // Desktop normal
2xl: 1536px // Desktop large

// BUT: Mobile phone real size:
// iPhone 12/13: 390px
// Samsung Galaxy A12: 412px
// iPhone SE: 375px
// These are < sm breakpoint!

// So design must work at:
// 375px (iPhone SE minimum)
// 390px (iPhone 12)
// 412px (Samsung A12)
// 640px (tablet)
// 1024px (desktop)
```

**For sticky mobile CTA "2 buttons":**
Viewport: 390px
Available width: 390px - 16px padding = 358px
2 buttons side-by-side: 358px / 2 = 179px each
Button element minimum:

Text: "Lihat di Shopee" = 80px
Padding LR: 16px = 96px
Icon (if any): +20px = 116px
Gap between buttons: 8px

Result: 116px + 8px + 116px = 240px needed
Available: 179px × 2 = 358px ✓ (fits, but cramped)
Better: Stack vertically (1 button full width, 1 button full width)
Or: 1 button + dropdown for other merchants

### Constraint 2: Color Accessibility
**Current palette:**
- Moss (#10b981) on white: contrast = 4.5:1 (OK for normal text, marginal for small)
- Clay (#d4af37) on white: contrast = 1.8:1 (FAIL—unreadable)

**Fix:**
- Moss: Keep (dark enough)
- Clay: Replace with darker gold (#b8860b) or use as background accent, not text
- Navy (#1a365d) on white: 17:1 (excellent, keep)
- Emerald (#10b981): same as Moss, already good

**Record:** Current WCAG score [X], Target: AA (4.5:1 minimum)

### Constraint 3: Database/API Limits
**What agent can't do during redesign:**
- Can't sync real-time prices (Tokopedia/Shopee API integration = future task)
- Can't fetch YouTube metadata (YouTube API = future task)
- Can't auto-generate expert sources (manual for now)

**What agent CAN do:**
- Change UI/layout
- Update component props
- Reorder data display
- Add conditional rendering

Record: **API integration status = BLOCKED until Week 4**

### Constraint 4: File Size / Performance Impact
**Homepage current:**
- 5 Promise.all queries
- ~2-3 MB HTML (estimate)

**After redesign:**
- Queries should drop to 3-4 (remove intent cards, comparisons, methodology)
- HTML should drop to ~1.5-2 MB
- Verify with Lighthouse performance score

Record: **Target homepage LCP improvement: [current]ms → <2000ms**

---

## PART 3: DESIGN TONE AUDIT

**Current tone (visual):**
- Moss green: "natural, organic"
- Clay orange: "warm, approachable"
- Combined: "eco-friendly health brand" (nggak match affiliate product rec)

**Target tone (should match positioning):**
- "Kurasi editorial + expert sources + trustworthy"
- Not "luxury premium" (navy + gold is too fancy)
- Not "eco-friendly" (moss alone)
- Should be: "trusted authority, modern, clean, slightly premium"

**Recommendation:**
- Keep moss for accent (trust signal)
- Keep neutral colors (white/gray)
- Add darker moss (#047857) for text hierarchy
- Remove clay entirely OR use as subtle background only
- Add proper navy (#1f2937 or #111827) for headings

**Decision needed from you:** 
Do you want to keep moss-based (adjust tone) or pivot to navy-based (more editorial)?

---

## PART 4: REGRESSION TEST PLAN

**Before redesign, document current:**
1. All product pages load without 404? (check 5 random products)
2. All category pages load? (check 5 categories)
3. Affiliate links work? (click 3 affiliate buttons, verify redirect)
4. Email form submits? (test subscribe, verify in Mailchimp)

**After redesign, re-test all above** → confirm no regression

---

## PART 5: PHASED ROLLOUT STRATEGY

**Option A: Full redesign release (risky)**
- Change all pages at once
- PRO: Clear before/after for A/B test
- CON: If broken, all pages affected

**Option B: Phased per-page (safer)**
- Week 1: Redesign homepage only → measure bounce rate impact
- Week 2: Redesign product page → measure CTR impact
- Week 3: Redesign category page → measure engagement

**Recommendation:** Option B (phased) because:
- Can rollback single page if metrics drop
- GA4 data cleaner (isolated changes)
- Lower risk of total regression
- Time to iterate based on feedback

Record: **Rollout strategy: [A or B], Measurement window: [7 days per page]**

---

## EXECUTION CHECKLIST

Before running DESIGN_BUILD.md:

- [ ] GA4 baseline captured (bounce, CTR, email capture)
- [ ] Mobile viewport constraints documented (375px-2xl sizes)
- [ ] Color accessibility checked (contrast ratios WCAG AA)
- [ ] API/integration blockers noted
- [ ] Current state tested (no regressions exist)
- [ ] Design tone decision made (moss-based or navy-based)
- [ ] Rollout strategy chosen (phased or full)
- [ ] Regression test plan written

**If any unchecked:** Stop, ask user first.

---

## REPORT TO USER
BASELINE METRICS CAPTURED
Current state:

Homepage bounce rate: [X]%
Product CTR: [X]%
Email capture: [X]%
Homepage LCP: [X]ms
Mobile issues: [list]

Constraints:

Minimum viewport: 375px (iPhone SE)
Color accessibility: [WCAG score]
API blockers: Price sync, YouTube metadata
Expected regression risk: [Low/Medium/High]

Design decision needed:

Color tone: Keep moss? (or pivot navy?)

Rollout strategy: [Phased or Full]
Approved to proceed → docs/DESIGN_BUILD.md