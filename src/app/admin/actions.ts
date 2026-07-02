"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import type { ArticleType } from "@/types/domain";

const bool = (value: FormDataEntryValue | null) => value === "on" || value === "true";
const str = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const num = (formData: FormData, key: string) => Number(formData.get(key) || 0);
const numOrNull = (formData: FormData, key: string) => {
  const raw = str(formData, key);
  return raw ? Number(raw) : null;
};
const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);
const optionalText = (value: string) => value || null;

const articleTypes = ["REVIEW", "COMPARISON", "BEST_PICKS", "TIPS"] as const;

const requiredString = (label: string, min = 1) =>
  z.string().trim().min(min, `${label} wajib diisi${min > 1 ? ` minimal ${min} karakter` : ""}.`);

const optionalUrl = (label: string) =>
  z.string().trim().optional().transform((value) => value || null).pipe(z.string().url(`${label} harus berupa URL lengkap, contoh https://example.com.`).nullable());

function zodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Data belum valid. Cek kembali field yang wajib diisi.";
}

async function currentAdminPath() {
  const referer = (await headers()).get("referer");
  if (!referer) return "/admin";
  try {
    const url = new URL(referer);
    url.searchParams.delete("error");
    url.searchParams.delete("success");
    return `${url.pathname}${url.search}`;
  } catch {
    return "/admin";
  }
}

function appendFlash(path: string, type: "error" | "success", message: string) {
  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.delete("error");
  params.delete("success");
  params.set(type, message);
  return `${pathname}?${params.toString()}`;
}

async function failAction(message: string): Promise<never> {
  redirect(appendFlash(await currentAdminPath(), "error", message));
}

async function successAction(message: string, path?: string): Promise<never> {
  redirect(appendFlash(path ?? await currentAdminPath(), "success", message));
}

function databaseMessage(error: unknown, fallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "field unik";
      if (target.includes("redirectCode")) return "Redirect code sudah dipakai. Gunakan kode lain yang unik.";
      if (target.includes("slug")) return "Slug sudah dipakai. Gunakan slug lain yang unik.";
      if (target.includes("email")) return "Email sudah terdaftar.";
      return `Data duplikat pada ${target}. Gunakan nilai lain.`;
    }
    if (error.code === "P2003") return "Data tidak bisa disimpan karena masih terhubung dengan data lain.";
    if (error.code === "P2025") return "Data yang ingin diubah atau dihapus tidak ditemukan.";
  }
  return fallback;
}

function parsePairs(value: string, label: string) {
  return lines(value).map((line) => {
    const [key, ...rest] = line.split("|");
    const pairValue = rest.join("|");
    if (!key?.trim() || !pairValue?.trim()) {
      throw new Error(`${label} harus memakai format label|value per baris. Contoh: Daya|395W.`);
    }
    return { label: key.trim(), value: pairValue.trim() };
  });
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const schema = z.object({
    id: z.string().trim().optional(),
    name: requiredString("Nama kategori", 2),
    slug: requiredString("Slug kategori", 2),
    description: requiredString("Deskripsi kategori", 10),
    imageUrl: z.string().trim().optional(),
    sortOrder: z.coerce.number({ invalid_type_error: "Sort order harus angka." }).int("Sort order harus angka bulat.")
  });
  const parsed = schema.safeParse({
    id: str(formData, "id"),
    name: str(formData, "name"),
    slug: slugify(str(formData, "slug") || str(formData, "name")),
    description: str(formData, "description"),
    imageUrl: str(formData, "imageUrl"),
    sortOrder: num(formData, "sortOrder")
  });
  if (!parsed.success) await failAction(zodMessage(parsed.error));
  const categoryData = parsed.data!;
  const { id, ...categoryFields } = categoryData;
  try {
    const data = { ...categoryFields, imageUrl: optionalText(categoryFields.imageUrl ?? ""), featured: bool(formData.get("featured")) };
    if (id) await getDb().category.update({ where: { id }, data });
    else await getDb().category.create({ data });
  } catch (error) {
    await failAction(databaseMessage(error, "Kategori gagal disimpan. Cek kembali nama, slug, dan deskripsinya."));
  }
  revalidatePath("/admin/categories");
  await successAction("Kategori berhasil disimpan.");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  try {
    await getDb().category.delete({ where: { id: str(formData, "id") } });
  } catch (error) {
    await failAction(databaseMessage(error, "Kategori gagal dihapus. Pastikan tidak ada produk yang masih memakai kategori ini."));
  }
  revalidatePath("/admin/categories");
  await successAction("Kategori berhasil dihapus.");
}

export async function saveBrand(formData: FormData) {
  await requireAdmin();
  const schema = z.object({
    id: z.string().trim().optional(),
    name: requiredString("Nama brand", 2),
    slug: requiredString("Slug brand", 2),
    websiteUrl: optionalUrl("Website URL"),
    logoUrl: z.string().trim().optional().transform((value) => value || null),
    description: z.string().trim().optional().transform((value) => value || null)
  });
  const parsed = schema.safeParse({
    id: str(formData, "id"),
    name: str(formData, "name"),
    slug: slugify(str(formData, "slug") || str(formData, "name")),
    websiteUrl: str(formData, "websiteUrl"),
    logoUrl: str(formData, "logoUrl"),
    description: str(formData, "description")
  });
  if (!parsed.success) await failAction(zodMessage(parsed.error));
  const brandData = parsed.data!;
  const { id, ...brandFields } = brandData;
  try {
    if (id) await getDb().brand.update({ where: { id }, data: brandFields });
    else await getDb().brand.create({ data: brandFields });
  } catch (error) {
    await failAction(databaseMessage(error, "Brand gagal disimpan. Cek nama, slug, dan URL yang diisi."));
  }
  revalidatePath("/admin/brands");
  await successAction("Brand berhasil disimpan.");
}

export async function deleteBrand(formData: FormData) {
  await requireAdmin();
  try {
    await getDb().brand.delete({ where: { id: str(formData, "id") } });
  } catch (error) {
    await failAction(databaseMessage(error, "Brand gagal dihapus. Pastikan tidak ada produk yang masih memakai brand ini."));
  }
  revalidatePath("/admin/brands");
  await successAction("Brand berhasil dihapus.");
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const schema = z.object({
    id: z.string().trim().optional(),
    name: requiredString("Nama produk", 2),
    slug: requiredString("Slug produk", 2),
    categoryId: requiredString("Kategori"),
    brandId: requiredString("Brand"),
    shortDescription: requiredString("Deskripsi singkat", 10),
    editorialSummary: requiredString("Ringkasan editor", 10),
    bestFor: requiredString("Cocok untuk siapa", 2),
    priceEstimate: z.coerce.number({ invalid_type_error: "Estimasi harga harus angka." }).min(0, "Estimasi harga tidak boleh negatif."),
    compareAtPrice: z.coerce.number().min(0, "Harga coret tidak boleh negatif.").nullable(),
    currency: z.string().trim().min(3, "Currency wajib diisi, contoh IDR.").max(3, "Currency gunakan 3 huruf, contoh IDR."),
    score: z.coerce.number().min(0, "Skor minimal 0.").max(10, "Skor maksimal 10.").nullable(),
    hoursTested: z.coerce.number().min(0, "Jam pengujian tidak boleh negatif.").nullable()
  });
  const parsed = schema.safeParse({
    id: str(formData, "id"),
    name: str(formData, "name"),
    slug: slugify(str(formData, "slug") || str(formData, "name")),
    categoryId: str(formData, "categoryId"),
    brandId: str(formData, "brandId"),
    shortDescription: str(formData, "shortDescription"),
    editorialSummary: str(formData, "editorialSummary"),
    bestFor: str(formData, "bestFor"),
    priceEstimate: str(formData, "priceEstimate"),
    compareAtPrice: numOrNull(formData, "compareAtPrice"),
    currency: str(formData, "currency") || "IDR",
    score: numOrNull(formData, "score"),
    hoursTested: numOrNull(formData, "hoursTested")
  });
  if (!parsed.success) await failAction(zodMessage(parsed.error));
  const productData = parsed.data!;

  let evidenceStats: { label: string; value: string }[] = [];
  let specs: { label: string; value: string }[] = [];
  try {
    evidenceStats = parsePairs(str(formData, "evidenceStats"), "Bukti uji");
    specs = parsePairs(str(formData, "specs"), "Specs");
  } catch (error) {
    await failAction(error instanceof Error ? error.message : "Format data list belum valid.");
  }

  const id = productData.id;
  const base = {
    name: productData.name,
    slug: productData.slug,
    categoryId: productData.categoryId,
    brandId: productData.brandId,
    shortDescription: productData.shortDescription,
    editorialSummary: productData.editorialSummary,
    bestFor: productData.bestFor,
    priceEstimate: productData.priceEstimate,
    compareAtPrice: productData.compareAtPrice,
    currency: productData.currency,
    score: productData.score,
    hoursTested: productData.hoursTested,
    evidenceStats,
    isFeatured: bool(formData.get("isFeatured")),
    isPublished: bool(formData.get("isPublished")),
    publishedAt: bool(formData.get("isPublished")) ? new Date() : null
  };
  const db = getDb();
  try {
    const product = id
      ? await db.product.update({ where: { id }, data: base })
      : await db.product.create({ data: base });

    await db.productImage.deleteMany({ where: { productId: product.id } });
    const imageUrls = lines(str(formData, "images"));
    if (imageUrls.length) {
      await db.productImage.createMany({ data: imageUrls.map((imageUrl, sortOrder) => ({ productId: product.id, imageUrl, altText: product.name, sortOrder, isPrimary: sortOrder === 0 })) });
    }

    await db.productSpec.deleteMany({ where: { productId: product.id } });
    if (specs.length) {
      await db.productSpec.createMany({ data: specs.map((spec, sortOrder) => ({ productId: product.id, specGroup: "Umum", label: spec.label, value: spec.value, sortOrder })) });
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
  } catch (error) {
    await failAction(databaseMessage(error, "Produk gagal disimpan. Cek field wajib, slug, kategori, dan brand."));
  }

  revalidatePath("/admin/products");
  await successAction("Produk berhasil disimpan.", "/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  try {
    await getDb().product.delete({ where: { id: str(formData, "id") } });
  } catch (error) {
    await failAction(databaseMessage(error, "Produk gagal dihapus."));
  }
  revalidatePath("/admin/products");
  await successAction("Produk berhasil dihapus.");
}

export async function saveAffiliateLink(formData: FormData) {
  await requireAdmin();
  const schema = z.object({
    id: z.string().trim().optional(),
    productId: requiredString("Produk"),
    merchantName: requiredString("Merchant", 2),
    buttonLabel: requiredString("Label tombol", 2),
    price: z.coerce.number().min(0, "Harga tidak boleh negatif.").nullable(),
    affiliateUrl: z.string().trim().url("Affiliate URL harus berupa URL lengkap, contoh https://tokopedia.com/..."),
    redirectCode: requiredString("Redirect code", 2),
    sortOrder: z.coerce.number({ invalid_type_error: "Urutan tampil harus angka." }).int("Urutan tampil harus angka bulat.")
  });
  const parsed = schema.safeParse({
    id: str(formData, "id"),
    productId: str(formData, "productId"),
    merchantName: str(formData, "merchantName"),
    buttonLabel: str(formData, "buttonLabel"),
    price: numOrNull(formData, "price"),
    affiliateUrl: str(formData, "affiliateUrl"),
    redirectCode: slugify(str(formData, "redirectCode")),
    sortOrder: str(formData, "sortOrder") || "0"
  });
  if (!parsed.success) await failAction(zodMessage(parsed.error));
  const affiliateData = parsed.data!;
  const { id, ...affiliateFields } = affiliateData;
  const data = {
    ...affiliateFields,
    isPrimary: bool(formData.get("isPrimary")),
    isActive: bool(formData.get("isActive"))
  };
  let duplicate: { id: string } | null = null;
  try {
    duplicate = await getDb().productAffiliateLink.findUnique({ where: { redirectCode: affiliateData.redirectCode }, select: { id: true } });
  } catch (error) {
    await failAction(databaseMessage(error, "Redirect code belum bisa dicek. Coba ulangi sebentar lagi."));
  }
  if (duplicate && duplicate.id !== id) await failAction("Redirect code sudah dipakai. Gunakan kode lain, misalnya nama-produk-tokopedia-2.");
  try {
    if (id) await getDb().productAffiliateLink.update({ where: { id }, data });
    else await getDb().productAffiliateLink.create({ data });
  } catch (error) {
    await failAction(databaseMessage(error, "Link affiliate gagal disimpan. Cek URL affiliate dan redirect code."));
  }
  revalidatePath("/admin/affiliate-links");
  await successAction("Link affiliate berhasil disimpan.");
}

export async function deleteAffiliateLink(formData: FormData) {
  await requireAdmin();
  try {
    await getDb().productAffiliateLink.delete({ where: { id: str(formData, "id") } });
  } catch (error) {
    await failAction(databaseMessage(error, "Link affiliate gagal dihapus."));
  }
  revalidatePath("/admin/affiliate-links");
  await successAction("Link affiliate berhasil dihapus.");
}

export async function saveArticle(formData: FormData) {
  const session = await requireAdmin();
  const schema = z.object({
    id: z.string().trim().optional(),
    title: requiredString("Judul artikel", 3),
    slug: requiredString("Slug artikel", 2),
    excerpt: requiredString("Ringkasan artikel", 10),
    coverImageUrl: z.string().trim().optional().transform((value) => value || null),
    contentMd: requiredString("Konten artikel", 20),
    articleType: z.enum(articleTypes, { errorMap: () => ({ message: "Tipe konten tidak valid." }) })
  });
  const parsed = schema.safeParse({
    id: str(formData, "id"),
    title: str(formData, "title"),
    slug: slugify(str(formData, "slug") || str(formData, "title")),
    excerpt: str(formData, "excerpt"),
    coverImageUrl: str(formData, "coverImageUrl"),
    contentMd: str(formData, "contentMd"),
    articleType: str(formData, "articleType") || "REVIEW"
  });
  if (!parsed.success) await failAction(zodMessage(parsed.error));
  const articleData = parsed.data!;
  const data = {
    authorId: session.user.id,
    title: articleData.title,
    slug: articleData.slug,
    excerpt: articleData.excerpt,
    coverImageUrl: articleData.coverImageUrl,
    contentMd: articleData.contentMd,
    articleType: articleData.articleType as ArticleType,
    isPublished: bool(formData.get("isPublished")),
    publishedAt: bool(formData.get("isPublished")) ? new Date() : null
  };
  try {
    const article = articleData.id ? await getDb().article.update({ where: { id: articleData.id }, data }) : await getDb().article.create({ data });
    await getDb().articleProduct.deleteMany({ where: { articleId: article.id } });
    const productIds = formData.getAll("productIds").map(String).filter(Boolean);
    if (productIds.length) await getDb().articleProduct.createMany({ data: productIds.map((productId, sortOrder) => ({ articleId: article.id, productId, sortOrder })) });
  } catch (error) {
    await failAction(databaseMessage(error, "Artikel gagal disimpan. Cek judul, slug, tipe konten, dan kontennya."));
  }
  revalidatePath("/admin/articles");
  const returnTo = str(formData, "returnTo");
  await successAction("Artikel berhasil disimpan.", returnTo.startsWith("/admin/") ? returnTo : "/admin/articles");
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  try {
    await getDb().article.delete({ where: { id: str(formData, "id") } });
  } catch (error) {
    await failAction(databaseMessage(error, "Artikel gagal dihapus."));
  }
  revalidatePath("/admin/articles");
  await successAction("Artikel berhasil dihapus.");
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
  const schema = z.object({
    seoTitle: requiredString("SEO title", 10).max(60, "SEO title maksimal 60 karakter."),
    metaDescription: requiredString("Meta description", 30).max(160, "Meta description maksimal 160 karakter."),
    ogTitle: z.string().trim().optional(),
    ogDescription: z.string().trim().optional(),
    ogImageUrl: z.string().trim().optional().refine((value) => !value || value.startsWith("/") || /^https?:\/\//.test(value), "OG image harus URL lengkap atau path upload lokal.")
  });
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodMessage(parsed.error) };
  try {
    const db = getDb();
    await db.seoMetadata.upsert({
      where: { subjectType_subjectId: { subjectType: "product", subjectId: productId } },
      update: {
        seoTitle: parsed.data.seoTitle,
        metaDescription: parsed.data.metaDescription,
        ogTitle: parsed.data.ogTitle,
        ogDescription: parsed.data.ogDescription,
        ogImageUrl: parsed.data.ogImageUrl
      },
      create: {
        subjectType: "product",
        subjectId: productId,
        seoTitle: parsed.data.seoTitle,
        metaDescription: parsed.data.metaDescription,
        ogTitle: parsed.data.ogTitle,
        ogDescription: parsed.data.ogDescription,
        ogImageUrl: parsed.data.ogImageUrl
      }
    });
    const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
    if (product) revalidatePath(`/produk/${product.slug}`);
    return { success: true };
  } catch (error) {
    console.error("SEO metadata update error:", error);
    return { success: false, error: databaseMessage(error, "SEO metadata gagal disimpan. Cek title, description, dan URL gambar.") };
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
  const schema = z.object({
    sourceType: requiredString("Tipe sumber", 2),
    sourceName: requiredString("Nama expert atau channel", 2),
    sourceUrl: z.string().trim().url("URL sumber harus berupa URL lengkap, contoh https://youtube.com/watch?v=..."),
    sourceAuthorFollowers: z.number().int().min(0, "Jumlah followers tidak boleh negatif.").nullable(),
    quote: z.string().trim().nullable()
  });
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { success: false, error: zodMessage(parsed.error) };
  try {
    const db = getDb();
    const expertSource = await db.expertSource.create({ data: { productId, ...parsed.data } });
    const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
    if (product) revalidatePath(`/produk/${product.slug}`);
    return { success: true, data: expertSource };
  } catch (error) {
    console.error("Add expert source error:", error);
    return { success: false, error: databaseMessage(error, "Expert source gagal ditambahkan. Cek nama, URL, dan jumlah followers.") };
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
    return { success: false, error: databaseMessage(error, "Expert source gagal dihapus.") };
  }
}

export async function saveHomepageSection(formData: FormData) {
  await requireAdmin();
  const schema = z.object({
    id: z.string().trim().optional(),
    sectionKey: requiredString("Section key", 2),
    title: requiredString("Judul section", 2),
    subtitle: z.string().trim().optional(),
    sortOrder: z.coerce.number({ invalid_type_error: "Sort order harus angka." }).int("Sort order harus angka bulat.")
  });
  const parsed = schema.safeParse({
    id: str(formData, "id"),
    sectionKey: slugify(str(formData, "sectionKey")),
    title: str(formData, "title"),
    subtitle: str(formData, "subtitle"),
    sortOrder: str(formData, "sortOrder") || "0"
  });
  if (!parsed.success) await failAction(zodMessage(parsed.error));
  const homepageData = parsed.data!;
  const { id, ...homepageFields } = homepageData;
  try {
    const data = { ...homepageFields, isActive: bool(formData.get("isActive")) };
    if (id) await getDb().homepageSection.update({ where: { id }, data });
    else await getDb().homepageSection.create({ data: { ...data, payload: {} } });
  } catch (error) {
    await failAction(databaseMessage(error, "Section homepage gagal disimpan."));
  }
  revalidatePath("/admin/homepage");
  await successAction("Section homepage berhasil disimpan.");
}
