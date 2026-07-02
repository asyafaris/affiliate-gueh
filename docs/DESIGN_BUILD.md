# DESIGN BUILD: UI/UX Overhaul (Implementation)

**Prerequisites:** PRE_DESIGN_CHECKLIST.md complete ✅

---

## PHASE 1: HOMEPAGE REDESIGN (Day 1-2)

### Step 1.1: Update Color Config
File: `tailwind.config.ts`

**REPLACE:**
```typescript
// OLD (remove these)
colors: {
  moss: '#10b981',
  clay: '#d4af37',
  // ink variants...
}
```

**WITH:**
```typescript
colors: {
  primary: '#1f2937',      // Charcoal (headings)
  accent: '#10b981',       // Moss (CTA, badges) - keep, it's good
  success: '#047857',      // Dark moss (highlights)
  neutral: {
    950: '#030712',
    900: '#111827',
    800: '#1f2937',
    700: '#374151',
    600: '#4b5563',
    500: '#6b7280',
    400: '#9ca3af',
    300: '#d1d5db',
    200: '#e5e7eb',
    100: '#f3f4f6',
    50: '#f9fafb'
  },
  white: '#ffffff'
}

// Remove all inline gradient definitions
// Instead use utility classes below
```

**Add gradient utilities:**
```typescript
backgroundImage: {
  'gradient-hero': 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
  'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
}
```

### Step 1.2: Restructure Homepage Component
File: `src/app/page.tsx`

**REMOVE these sections entirely (lines ~80-350):**
- Line ~120-180: Intent cards section (4 cards)
- Line ~200-250: Bandingkan section (comparison articles)
- Line ~350-400: Metodologi section (5 methodology bullets)

**KEEP & REORDER:**
1. Hero (fix height to 400px desktop, 320px mobile)
2. Social proof metrics (new)
3. Featured products (6 cards)
4. Best picks (4 cards)
5. Categories (6 cards)
6. Email signup (sticky responsive)
7. Footer

**New Hero component:**
```typescript
// src/components/public/HeroSection.tsx (create new)
"use client"

import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-[400px] md:min-h-[450px] bg-gradient-hero flex items-center">
      <div className="container-page grid md:grid-cols-2 gap-8 items-center py-12">
        
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
            Kurasi produk setup kerja yang paling worth it.
          </h1>
          
          <p className="mt-4 text-lg text-neutral-600">
            Riset editorial + spesifikasi + expert sources. Bantu kamu pilih produk original yang tepat.
          </p>

          {/* Search box - SIMPLE, not modal */}
          <div className="mt-6 flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-lg border-2 border-neutral-200 px-3 focus-within:border-accent">
              <Search className="w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari keyboard, kursi, lampu..."
                className="flex-1 py-3 bg-transparent outline-none text-sm"
              />
            </div>
            <Link
              href="/kategori"
              className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-success transition"
            >
              Jelajahi
            </Link>
          </div>

          {/* CTAs - 2 clear buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="#produk"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-neutral-800 transition"
            >
              Cari rekomendasi
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/best"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/5 transition"
            >
              Lihat best picks
            </Link>
          </div>
        </motion.div>

        {/* Right: Featured product quick pick */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:block"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-neutral-100">
            <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">
              ⭐ Editor's Pick
            </span>
            
            {/* Will fetch featured product via server component */}
            {/* Content from props */}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
```

**Update main page.tsx:**
```typescript
// src/app/page.tsx - REWRITTEN STRUCTURE

export default async function HomePage() {
  const db = getDb();
  
  // ONLY 3 queries (not 5)
  const [products, bestPicks, categories] = await Promise.all([
    db.product.findMany({
      where: { isPublished: true, isFeatured: true },
      include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } },
      take: 6
    }),
    db.article.findMany({
      where: { isPublished: true, articleType: "BEST_PICKS" },
      include: {
        _count: { select: { products: true } },
        products: { orderBy: { sortOrder: "asc" }, take: 3, include: { product: { include: { category: true } } } }
      },
      orderBy: { publishedAt: "desc" },
      take: 4
    }),
    db.category.findMany({
      where: { featured: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } }, products: { where: { isPublished: true }, include: { images: { where: { isPrimary: true }, take: 1 } }, take: 1 } },
      take: 6
    })
  ]);

  return (
    <>
      <Header />
      <main>
        
        {/* SECTION 1: Hero */}
        <HeroSection featuredProduct={products[0]} />

        {/* SECTION 2: Social proof metrics (NEW) */}
        <SocialProofMetrics />

        {/* SECTION 3: Featured products */}
        <section className="container-page py-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-primary">Produk yang lagi kami kurasi</h2>
          </div>
          <ProductGrid products={products} />
        </section>

        {/* SECTION 4: Best picks */}
        <section className="container-page py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-3xl font-bold text-primary">Pilihan berdasarkan kebutuhan</h2>
            <Link href="/best" className="text-accent font-semibold hover:underline">Lihat semua →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bestPicks.map((article) => (
              <BestPickCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        {/* SECTION 5: Categories */}
        <section className="container-page py-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-primary">Jelajahi kategori</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </section>

        {/* SECTION 6: Email signup */}
        <section className="bg-neutral-50 py-8">
          <div className="container-page max-w-md mx-auto">
            <EmailSignupForm location="homepage" />
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
```

### Step 1.3: Create Social Proof Component
File: `src/components/public/SocialProofMetrics.tsx`

```typescript
"use client"

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function SocialProofMetrics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Fetch from API
    fetch("/api/metrics")
      .then(r => r.json())
      .then(setMetrics);
  }, []);

  if (!metrics) return null;

  return (
    <section className="bg-white border-y border-neutral-200 py-8">
      <div className="container-page">
        <div className="grid grid-cols-3 gap-4">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-accent">
              {metrics.clicksThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-neutral-600 mt-2">Clicks this week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-accent">
              {metrics.emailSubscribers.toLocaleString()}
            </div>
            <p className="text-xs text-neutral-600 mt-2">Email subscribers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-accent">
              {metrics.productsReviewed}
            </div>
            <p className="text-xs text-neutral-600 mt-2">Products reviewed</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
```

### Step 1.4: Create Metrics API Endpoint
File: `src/app/api/metrics/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const clicksThisWeek = await db.affiliateClick.count({
      where: {
        clickedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const emailSubscribers = await db.emailSubscriber.count();

    const productsReviewed = await db.product.count({
      where: { isPublished: true }
    });

    return NextResponse.json({
      clicksThisWeek,
      emailSubscribers,
      productsReviewed
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

### Step 1.5: Update Component Styles
File: `src/app/globals.css`

**REMOVE:**
- All clay/orange color references
- All gradient overlays in inline styles

**ADD:**
```css
/* Typography hierarchy */
h1 {
  @apply text-4xl md:text-5xl font-bold text-primary leading-tight;
}

h2 {
  @apply text-3xl font-bold text-primary;
}

h3 {
  @apply text-xl font-bold text-primary;
}

p {
  @apply text-neutral-600 leading-relaxed;
}

/* Button defaults */
.btn-primary {
  @apply px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-success transition;
}

.btn-secondary {
  @apply px-6 py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/5 transition;
}

/* Card defaults */
.card {
  @apply bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200;
}

/* Focus states */
input:focus {
  @apply outline-none border-accent ring-2 ring-accent/30;
}

button:focus {
  @apply outline-none ring-2 ring-accent/30;
}
```

### Step 1.6: Test Homepage
Run:
```bash
npm run dev
```

Check:
- [ ] Hero height ≤400px desktop (measure DevTools)
- [ ] Hero height ≤320px mobile (measure on actual phone)
- [ ] No intent cards section (removed)
- [ ] No comparison section (removed)
- [ ] Social proof metrics showing (4 sections: clicks, subscribers, products)
- [ ] Featured products grid 6 cards (3 columns desktop, 1 column mobile)
- [ ] Best picks grid 4 cards
- [ ] Categories grid 6 cards
- [ ] Email form at bottom (not sticky)
- [ ] Mobile: no horizontal scroll, all buttons clickable (>48px)

---

## PHASE 2: PRODUCT PAGE REDESIGN (Day 3-4)

### Step 2.1: Update Product Page Layout
File: `src/app/produk/[slug]/page.tsx`

**RESTRUCTURE sections in this order:**
1. Breadcrumb + header (name, price, best-for tag)
2. Image gallery (left 55%) + info sidebar (right 45%)
3. Expert sources (badges, not separate section)
4. Quick verdict (editorial summary)
5. Affiliate buttons (merchant-specific)
6. Pros & cons (2 columns, top 5 pros + top 3 cons)
7. Why recommended (narrative bullets, 5 max)
8. Specs (collapsible, hide after 5)
9. Related products (3 cards max)

**Current structure is OK, just reorder and refactor:**

```typescript
// src/app/produk/[slug]/page.tsx - PARTIAL REWRITE

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product?.isPublished) notFound();

  const trustLabels = inferTrustLabels(product.affiliateLinks);
  const topPros = product.prosCons.filter((item) => item.type === "PRO").slice(0, 5);
  const topCons = product.prosCons.filter((item) => item.type === "CON").slice(0, 3);
  const topSpecs = product.specs.slice(0, 5);

  return (
    <>
      <Header />
      <main className="container-page py-10 space-y-8">
        
        {/* SECTION 1: Breadcrumb + Header */}
        <Breadcrumbs items={[
          { label: "Beranda", href: "/" },
          { label: product.category.name, href: `/kategori/${product.category.slug}` },
          { label: product.name }
        ]} />

        <div>
          <p className="text-sm text-neutral-600">{product.brand.name} / {product.category.name}</p>
          <h1 className="mt-2 text-4xl font-bold">{product.name}</h1>
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold">
              Cocok untuk: {product.bestFor}
            </span>
            <span className="text-sm text-neutral-600">
              Estimasi <PriceEstimate value={product.priceEstimate} />
            </span>
          </div>
        </div>

        {/* SECTION 2: Image + Info Layout */}
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8">
          
          {/* Left: Gallery */}
          <ProductImageGallery images={product.images} title={product.name} />

          {/* Right: Info Sidebar */}
          <div className="space-y-4">
            
            {/* Quick verdict */}
            <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-sm mb-3">Rekomendasi singkat</h3>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {product.editorialSummary}
              </p>
            </div>

            {/* Expert sources as badges */}
            {product.expertSources.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-sm">Dikonfirmasi oleh:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.expertSources.slice(0, 4).map((source) => (
                    
                      key={source.id}
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-semibold hover:bg-accent/20 transition"
                    >
                      {source.sourceType === 'YOUTUBE' && '🎬'}
                      {source.sourceType === 'BLOG' && '📝'}
                      {source.sourceType === 'FORUM' && '💬'}
                      {source.sourceName}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Affiliate buttons - MERCHANT SPECIFIC */}
            <div className="space-y-2">
              <AffiliateButtonGroupMerchantSpecific 
                links={product.affiliateLinks} 
                productName={product.name}
              />
            </div>

          </div>

        </div>

        {/* SECTION 3: Pros & Cons (2 columns) */}
        <div className="grid md:grid-cols-2 gap-6">
          
          <div>
            <h3 className="font-bold text-lg mb-4">✅ Kelebihan</h3>
            <ul className="space-y-2">
              {topPros.map((pro) => (
                <li key={pro.id} className="flex gap-3 text-sm">
                  <span className="text-accent">→</span>
                  <span className="text-neutral-700">{pro.content}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">⚠️ Kekurangan</h3>
            <ul className="space-y-2">
              {topCons.map((con) => (
                <li key={con.id} className="flex gap-3 text-sm">
                  <span className="text-red-500">•</span>
                  <span className="text-neutral-700">{con.content}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* SECTION 4: Why Recommended (narrative) */}
        <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
          <h3 className="font-bold text-lg mb-4">Kenapa masuk rekomendasi?</h3>
          <div className="space-y-2">
            {product.whyRecommended?.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3"
              >
                <span className="text-accent font-bold">{i + 1}.</span>
                <span className="text-sm text-neutral-700">{reason}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 5: Specs (collapsible) */}
        <SpecsTableCollapsible specs={product.specs} />

        {/* SECTION 6: Related products */}
        <div>
          <h3 className="font-bold text-lg mb-4">Produk sejenis</h3>
          <ProductGrid products={relatedProducts} />
        </div>

      </main>

      {/* Sticky mobile CTA - FIXED */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white p-3 md:hidden">
        <AffiliateButtonGroupMobileSticky 
          links={product.affiliateLinks.slice(0, 2)} 
          productName={product.name}
        />
      </div>

      <Footer />
    </>
  );
}
```

### Step 2.2: Create Merchant-Specific CTA Component
File: `src/components/public/AffiliateButtonGroupMerchantSpecific.tsx`

```typescript
"use client"

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

type Link = {
  redirectCode: string;
  buttonLabel: string;
  merchantName: string;
  affiliateUrl: string;
  isPrimary: boolean;
};

type Props = {
  links: Link[];
  productName: string;
};

const merchantColors: Record<string, { bg: string; text: string; icon: string }> = {
  'Shopee': { bg: 'bg-orange-500', text: 'text-white', icon: '🛒' },
  'Tokopedia': { bg: 'bg-green-500', text: 'text-white', icon: '📱' },
  'TikTok Shop': { bg: 'bg-black', text: 'text-white', icon: '🎵' },
  'Lazada': { bg: 'bg-blue-500', text: 'text-white', icon: '📦' },
};

export function AffiliateButtonGroupMerchantSpecific({ links, productName }: Props) {
  if (links.length === 0) return null;

  // Sort: primary first
  const sorted = [...links].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  const primary = sorted[0];
  const others = sorted.slice(1);

  return (
    <div className="space-y-2">
      {/* Primary button - merchant specific */}
      {primary && (
        <motion.a
          href={primary.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAffiliateClick(primary.redirectCode)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-lg font-bold
            text-white transition
            ${merchantColors[primary.merchantName]?.bg || 'bg-accent'}
          `}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{merchantColors[primary.merchantName]?.icon || '🛍️'}</span>
            <div className="text-left">
              <div>Lihat di {primary.merchantName}</div>
              <div className="text-xs opacity-80">{primary.buttonLabel}</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4" />
        </motion.a>
      )}

      {/* Secondary buttons - dropdown or stacked */}
      {others.length > 0 && (
        <details className="w-full">
          <summary className="w-full px-4 py-2 text-center text-sm font-semibold text-neutral-600 cursor-pointer hover:text-neutral-900 bg-neutral-100 rounded-lg">
            Lihat di {others.length} toko lain
          </summary>
          <div className="mt-2 space-y-2 pl-1">
            {others.map((link) => (
              
                key={link.redirectCode}
                href={link.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAffiliateClick(link.redirectCode)}
                className={`
                  block w-full px-3 py-2 text-sm font-semibold rounded
                  border border-neutral-200 hover:border-neutral-400
                  text-neutral-700 hover:text-neutral-900
                `}
              >
                {link.merchantName}: {link.buttonLabel}
              </a>
            ))}
          </div>
        </details>
      )}

      <p className="text-xs text-neutral-500 text-center">
        Kami dapat komisi tanpa biaya tambahan untuk kamu
      </p>
    </div>
  );
}

function trackAffiliateClick(code: string) {
  // Already handled by click redirect, but can add custom tracking
  console.log('Clicked:', code);
}
```

### Step 2.3: Create Mobile Sticky CTA
File: `src/components/public/AffiliateButtonGroupMobileSticky.tsx`

```typescript
"use client"

import { ExternalLink } from "lucide-react";

type Link = {
  redirectCode: string;
  buttonLabel: string;
  merchantName: string;
  affiliateUrl: string;
};

type Props = {
  links: Link[];
  productName: string;
};

export function AffiliateButtonGroupMobileSticky({ links, productName }: Props) {
  if (links.length === 0) return null;

  return (
    <div className="space-y-2">
      {links.map((link) => (
        
          key={link.redirectCode}
          href={link.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-bold bg-accent text-white rounded-lg hover:bg-success transition"
        >
          <span>Beli di {link.merchantName}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
}
```

### Step 2.4: Add whyRecommended Field to Schema
File: `prisma/schema.prisma`

**Add to Product model:**
```prisma
model Product {
  // ... existing fields ...
  whyRecommended  String[]  @default([])  // JSON array
  
  // ... existing relations ...
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_why_recommended_to_product
```

### Step 2.5: Test Product Page
Run:
```bash
npm run dev
```

Visit any product page, check:
- [ ] Hero shows name, brand, category
- [ ] Image gallery on left 55%, info sidebar on right 45%
- [ ] Quick verdict in sidebar
- [ ] Expert sources show as badges (if exist)
- [ ] Affiliate buttons: primary full-width, secondary in dropdown
- [ ] Mobile: sticky CTA at bottom with 2 buttons
- [ ] Pros/cons in 2 columns (desktop), 1 column (mobile)
- [ ] "Why recommended" narrative section (5 bullets with animation)
- [ ] Specs collapsible (hide >5)
- [ ] Related products 3 cards

---

## PHASE 3: CATEGORY PAGE (Day 5)

### Step 3.1: Add Pagination
File: `src/app/kategori/[slug]/page.tsx`

**Add state + show/hide logic:**
```typescript
"use client"

import { useState } from "react";
import { motion } from "framer-motion";

export default function CategoryPage() {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_SHOW = 6;

  const displayProducts = showAll ? products : products.slice(0, INITIAL_SHOW);

  return (
    <>
      {/* Category header + products grid */}
      <ProductGrid products={displayProducts} />

      {/* Load more button */}
      {products.length > INITIAL_SHOW && !showAll && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-3 border-2 border-accent text-accent rounded-lg font-bold hover:bg-accent/5 transition"
          >
            Lihat {products.length - INITIAL_SHOW} produk lainnya
          </button>
        </motion.div>
      )}
    </>
  );
}
```

---

## PHASE 4: COMPARISON PAGE (Day 6)

### Step 4.1: Add Tab Navigation
File: `src/app/bandingkan/[slug]/page.tsx`

```typescript
"use client"

import { useState } from "react";

export default function ComparisonPage() {
  const [activeTab, setActiveTab] = useState<'specs' | 'price' | 'forWhom'>('specs');

  return (
    <>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-3 font-bold border-b-2 transition ${
            activeTab === 'specs'
              ? 'text-accent border-accent'
              : 'text-neutral-600 border-transparent'
          }`}
        >
          📋 Spesifikasi
        </button>
        <button
          onClick={() => setActiveTab('price')}
          className={`px-4 py-3 font-bold border-b-2 transition ${
            activeTab === 'price'
              ? 'text-accent border-accent'
              : 'text-neutral-600 border-transparent'
          }`}
        >
          💰 Harga
        </button>
        <button
          onClick={() => setActiveTab('forWhom')}
          className={`px-4 py-3 font-bold border-b-2 transition ${
            activeTab === 'forWhom'
              ? 'text-accent border-accent'
              : 'text-neutral-600 border-transparent'
          }`}
        >
          👥 Cocok untuk
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'specs' && <SpecsComparison products={products} />}
      {activeTab === 'price' && <PriceComparison products={products} />}
      {activeTab === 'forWhom' && <ForWhomComparison products={products} />}
    </>
  );
}
```

---

## PHASE 5: TESTING (Day 7)

### Regression test:
```bash
# Build
npm run build

# Test checklist:
# Homepage:
#  - [ ] Bounce rate baseline captured (GA4)
#  - [ ] No 404 errors
#  - [ ] All sections render
#  - [ ] Social proof metrics show

# Product page:
#  - [ ] Affiliate buttons work (click, redirect happens)
#  - [ ] Mobile sticky CTA shows
#  - [ ] Expert sources display (if exist)

# Categories:
#  - [ ] "Load more" button works
#  - [ ] Pagination doesn't cause scroll lag

# Comparison:
#  - [ ] Tab switching works
#  - [ ] Data correct per tab

# Mobile:
#  - [ ] No horizontal scroll
#  - [ ] Touch targets ≥48px
#  - [ ] Images load <2s
```

---

## REPORT

```
✅ DESIGN BUILD COMPLETE

Metrics improvement:
- Homepage bounce rate: [baseline]% → [new]% (target: <40%)
- Product CTR: [baseline]% → [new]% (target: >2%)
- Email capture: [baseline]% → [new]% (target: >15%)
- Homepage LCP: [baseline]ms → [new]ms (target: <2000ms)

Design changes:
- Removed: Intent cards, comparison section, methodology
- Added: Social proof metrics, merchant-specific CTAs, tab navigation
- Updated: Color tokens (charcoal + moss), typography hierarchy
- Mobile: Fixed sticky CTA, validated touch targets

Regression testing: ✅ PASS
- No 404 errors
- Affiliate links working
- Email form working
- Mobile responsive

Ready for Phase 2 (content seeding + go live).
```