-- Manual dashboard queries for affiliate click analytics
-- Column names use camelCase (Prisma default, no @@map in schema.prisma)

-- Query 1: Daily click count last 7 days
SELECT
  DATE("clickedAt") as date,
  COUNT(*) as clicks
FROM "AffiliateClick"
WHERE "clickedAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("clickedAt")
ORDER BY date DESC;

-- Query 2: Clicks by merchant
SELECT
  m."merchantName",
  COUNT(*) as clicks
FROM "AffiliateClick" c
JOIN "ProductAffiliateLink" m ON c."affiliateLinkId" = m.id
WHERE c."clickedAt" >= NOW() - INTERVAL '7 days'
GROUP BY m."merchantName"
ORDER BY clicks DESC;

-- Query 3: Top 10 products by clicks
SELECT
  p.name,
  COUNT(*) as clicks,
  (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()) as percentage
FROM "AffiliateClick" c
JOIN "Product" p ON c."productId" = p.id
WHERE c."clickedAt" >= NOW() - INTERVAL '7 days'
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
  "sourcePageType",
  "sourcePageSlug",
  COUNT(*) as clicks
FROM "AffiliateClick"
WHERE "clickedAt" >= NOW() - INTERVAL '7 days'
GROUP BY "sourcePageType", "sourcePageSlug"
ORDER BY clicks DESC;
