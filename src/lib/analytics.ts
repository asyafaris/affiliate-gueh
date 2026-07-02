import { getDb } from "./db";

export async function getAffiliateStats(startDate: Date, endDate: Date) {
  const db = getDb();

  const clicks = await db.affiliateClick.findMany({
    where: {
      clickedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      product: true,
      affiliateLink: true
    }
  });

  const byMerchant: Record<string, number> = {};
  clicks.forEach((click) => {
    const merchant = click.affiliateLink.merchantName;
    byMerchant[merchant] = (byMerchant[merchant] || 0) + 1;
  });

  const byProduct: Record<string, { count: number; name: string }> = {};
  clicks.forEach((click) => {
    const productId = click.productId;
    byProduct[productId] = {
      count: (byProduct[productId]?.count || 0) + 1,
      name: click.product.name
    };
  });

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
    rawData: clicks
  };
}

export async function getDailyCTR(productId: string, days: number = 7) {
  const db = getDb();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const clicks = await db.affiliateClick.findMany({
    where: {
      productId,
      clickedAt: {
        gte: startDate
      }
    }
  });

  return {
    productId,
    period: days,
    totalClicks: clicks.length,
    avgPerDay: (clicks.length / days).toFixed(2)
  };
}
