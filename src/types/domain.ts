export const ARTICLE_TYPES = ["GUIDE", "REVIEW", "COMPARISON", "BEST_PICKS", "TIPS"] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];

export const PROS_CONS_TYPES = ["PRO", "CON"] as const;
export type ProsConsType = (typeof PROS_CONS_TYPES)[number];

export type ProductCardData = {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  bestFor: string;
  priceEstimate: number;
  compareAtPrice?: number | null;
  score?: number | null;
  reviewCount?: number;
  brand?: { name: string };
  category?: { name: string };
  images?: { imageUrl: string; altText: string }[];
  affiliateLinks?: { redirectCode: string; merchantName: string; buttonLabel: string; isPrimary: boolean; price?: number | null }[];
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  featured?: boolean;
  sortOrder?: number;
};

export type BrandSummary = {
  id: string;
  name: string;
  slug: string;
  websiteUrl?: string | null;
};

export type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  articleType: ArticleType;
  isPublished?: boolean;
  updatedAt?: Date;
};

export type AffiliateLinkSummary = {
  id: string;
  merchantName: string;
  buttonLabel: string;
  redirectCode: string;
  isActive?: boolean;
  isPrimary: boolean;
  price?: number | null;
};

export type ProsConsItem = {
  id?: string;
  type: ProsConsType;
  content: string;
  sortOrder?: number;
};

export type SpecItem = {
  id?: string;
  specGroup: string;
  label: string;
  value: string;
  sortOrder?: number;
};

export type RankedProduct = Omit<ProductCardData, "id"> & {
  id: string;
  editorialSummary: string;
  brand: { name: string };
  prosCons: ProsConsItem[];
  affiliateLinks: AffiliateLinkSummary[];
};

export type ComparisonProduct = RankedProduct & {
  specs: SpecItem[];
};
