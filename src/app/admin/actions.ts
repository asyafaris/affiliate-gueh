"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import type { ArticleType } from "@/types/domain";

const bool = (value: FormDataEntryValue | null) => value === "on" || value === "true";
const str = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const num = (formData: FormData, key: string) => Number(formData.get(key) || 0);
const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const schema = z.object({ name: z.string().min(2), slug: z.string().min(2), description: z.string().min(10) });
  const data = schema.parse({ name: str(formData, "name"), slug: slugify(str(formData, "slug") || str(formData, "name")), description: str(formData, "description") });
  const imageUrl = str(formData, "imageUrl") || null;
  await getDb().category.upsert({
    where: { slug: data.slug },
    create: { ...data, imageUrl, featured: bool(formData.get("featured")), sortOrder: num(formData, "sortOrder") },
    update: { ...data, imageUrl, featured: bool(formData.get("featured")), sortOrder: num(formData, "sortOrder") }
  });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await getDb().category.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/categories");
}

export async function saveBrand(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  const slug = slugify(str(formData, "slug") || name);
  await getDb().brand.upsert({
    where: { slug },
    create: { name, slug, websiteUrl: str(formData, "websiteUrl") || null, description: str(formData, "description") || null, logoUrl: str(formData, "logoUrl") || null },
    update: { name, websiteUrl: str(formData, "websiteUrl") || null, description: str(formData, "description") || null, logoUrl: str(formData, "logoUrl") || null }
  });
  revalidatePath("/admin/brands");
}

export async function deleteBrand(formData: FormData) {
  await requireAdmin();
  await getDb().brand.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/brands");
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const slug = slugify(str(formData, "slug") || name);
  const base = {
    name,
    slug,
    categoryId: str(formData, "categoryId"),
    brandId: str(formData, "brandId"),
    shortDescription: str(formData, "shortDescription"),
    editorialSummary: str(formData, "editorialSummary"),
    bestFor: str(formData, "bestFor"),
    priceEstimate: num(formData, "priceEstimate"),
    currency: str(formData, "currency") || "IDR",
    isFeatured: bool(formData.get("isFeatured")),
    isPublished: bool(formData.get("isPublished")),
    publishedAt: bool(formData.get("isPublished")) ? new Date() : null
  };
  const db = getDb();
  const product = id
    ? await db.product.update({ where: { id }, data: base })
    : await db.product.create({ data: base });

  await db.productImage.deleteMany({ where: { productId: product.id } });
  const imageUrls = lines(str(formData, "images"));
  if (imageUrls.length) {
    await db.productImage.createMany({ data: imageUrls.map((imageUrl, sortOrder) => ({ productId: product.id, imageUrl, altText: product.name, sortOrder, isPrimary: sortOrder === 0 })) });
  }

  await db.productSpec.deleteMany({ where: { productId: product.id } });
  const specs = lines(str(formData, "specs")).map((line) => line.split("|"));
  if (specs.length) {
    await db.productSpec.createMany({ data: specs.map(([label, value], sortOrder) => ({ productId: product.id, specGroup: "Umum", label: label ?? "Info", value: value ?? "", sortOrder })) });
  }

  await db.productProsCons.deleteMany({ where: { productId: product.id } });
  const pros = lines(str(formData, "pros"));
  const cons = lines(str(formData, "cons"));
  await db.productProsCons.createMany({
    data: [
      ...pros.map((content, sortOrder) => ({ productId: product.id, type: "PRO" as const, content, sortOrder })),
      ...cons.map((content, sortOrder) => ({ productId: product.id, type: "CON" as const, content, sortOrder: sortOrder + pros.length }))
    ]
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await getDb().product.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/products");
}

export async function saveAffiliateLink(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const data = {
    productId: str(formData, "productId"),
    merchantName: str(formData, "merchantName"),
    buttonLabel: str(formData, "buttonLabel"),
    affiliateUrl: str(formData, "affiliateUrl"),
    redirectCode: slugify(str(formData, "redirectCode")),
    isPrimary: bool(formData.get("isPrimary")),
    isActive: bool(formData.get("isActive")),
    sortOrder: num(formData, "sortOrder")
  };
  if (id) await getDb().productAffiliateLink.update({ where: { id }, data });
  else await getDb().productAffiliateLink.create({ data });
  revalidatePath("/admin/affiliate-links");
}

export async function deleteAffiliateLink(formData: FormData) {
  await requireAdmin();
  await getDb().productAffiliateLink.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/affiliate-links");
}

export async function saveArticle(formData: FormData) {
  await requireAdmin();
  const session = await requireAdmin();
  const id = str(formData, "id");
  const name = str(formData, "title");
  const data = {
    authorId: session.user.id,
    title: name,
    slug: slugify(str(formData, "slug") || name),
    excerpt: str(formData, "excerpt"),
    coverImageUrl: str(formData, "coverImageUrl") || null,
    contentMd: str(formData, "contentMd"),
    articleType: (str(formData, "articleType") || "GUIDE") as ArticleType,
    isPublished: bool(formData.get("isPublished")),
    publishedAt: bool(formData.get("isPublished")) ? new Date() : null
  };
  const article = id ? await getDb().article.update({ where: { id }, data }) : await getDb().article.create({ data });
  await getDb().articleProduct.deleteMany({ where: { articleId: article.id } });
  const productIds = formData.getAll("productIds").map(String).filter(Boolean);
  if (productIds.length) await getDb().articleProduct.createMany({ data: productIds.map((productId, sortOrder) => ({ articleId: article.id, productId, sortOrder })) });
  revalidatePath("/admin/articles");
  const returnTo = str(formData, "returnTo");
  if (returnTo.startsWith("/admin/")) redirect(returnTo);
  redirect("/admin/articles");
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  await getDb().article.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/articles");
}

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
  await requireAdmin();
  try {
    const db = getDb();
    await db.seoMetadata.upsert({
      where: { subjectType_subjectId: { subjectType: "product", subjectId: productId } },
      update: {
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImageUrl: data.ogImageUrl
      },
      create: {
        subjectType: "product",
        subjectId: productId,
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImageUrl: data.ogImageUrl
      }
    });
    const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
    if (product) revalidatePath(`/produk/${product.slug}`);
    return { success: true };
  } catch (error) {
    console.error("SEO metadata update error:", error);
    return { success: false, error: String(error) };
  }
}

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
  await requireAdmin();
  try {
    const db = getDb();
    const expertSource = await db.expertSource.create({ data: { productId, ...data } });
    const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
    if (product) revalidatePath(`/produk/${product.slug}`);
    return { success: true, data: expertSource };
  } catch (error) {
    console.error("Add expert source error:", error);
    return { success: false, error: String(error) };
  }
}

export async function removeExpertSource(sourceId: string) {
  await requireAdmin();
  try {
    const db = getDb();
    const source = await db.expertSource.findUnique({ where: { id: sourceId }, include: { product: true } });
    await db.expertSource.delete({ where: { id: sourceId } });
    if (source) revalidatePath(`/produk/${source.product.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Remove expert source error:", error);
    return { success: false, error: String(error) };
  }
}

export async function saveHomepageSection(formData: FormData) {
  await requireAdmin();
  const sectionKey = slugify(str(formData, "sectionKey"));
  await getDb().homepageSection.upsert({
    where: { sectionKey },
    create: { sectionKey, title: str(formData, "title"), subtitle: str(formData, "subtitle"), payload: {}, isActive: bool(formData.get("isActive")), sortOrder: num(formData, "sortOrder") },
    update: { title: str(formData, "title"), subtitle: str(formData, "subtitle"), isActive: bool(formData.get("isActive")), sortOrder: num(formData, "sortOrder") }
  });
  revalidatePath("/admin/homepage");
}
