import 'dotenv/config';
import * as path from "path";
import { promises as fs, readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

// Fallback: simple synchronous .env loader in case dotenv isn't available in the runtime
function loadDotenvFileSync() {
  try {
    // Load .env.local first (created by Vercel CLI) then fallback to .env
    const candidates = [".env.local", ".env"];
    let content = "";
    for (const file of candidates) {
      const envPath = path.join(process.cwd(), file);
      try {
        content = readFileSync(envPath, "utf8");
        break;
      } catch {
        // continue
      }
    }
    if (!content) return;
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // ignore if no .env file
  }
}

loadDotenvFileSync();

const sourceUrl = process.env.SOURCE_DATABASE_URL ?? process.env.DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL ?? process.env.DATABASE_URL;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "affiliate-gueh/uploads";
const uploadsRoot = path.join(process.cwd(), "public", "uploads");

if (!sourceUrl) {
  throw new Error("SOURCE_DATABASE_URL or DATABASE_URL is required.");
}

if (!targetUrl) {
  throw new Error("TARGET_DATABASE_URL or DATABASE_URL is required.");
}

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary environment variables are missing. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

const sourceDb = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
const targetDb = new PrismaClient({ datasources: { db: { url: targetUrl } } });

const localImagePrefixes = ["/uploads/", "uploads/", "public/uploads/"];
const localhostPatterns = ["http://localhost", "https://localhost", "http://127.0.0.1"];
const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

function isLocalImageUrl(value: string): boolean {
  const normalized = value.trim();
  if (localImagePrefixes.some((prefix) => normalized.startsWith(prefix))) {
    return true;
  }
  return localhostPatterns.some((pattern) => normalized.startsWith(pattern));
}

function normalizeLocalPath(value: string): string | null {
  const normalized = value.trim();

  for (const prefix of localImagePrefixes) {
    if (normalized.startsWith(prefix)) {
      return path.join(process.cwd(), "public", normalized.replace(prefix, "uploads/"));
    }
  }

  for (const pattern of localhostPatterns) {
    if (normalized.startsWith(pattern)) {
      try {
        const url = new URL(normalized);
        return path.join(process.cwd(), "public", url.pathname.replace(/^\//, ""));
      } catch {
        return null;
      }
    }
  }

  return null;
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function uploadLocalFile(filePath: string) {
  if (!(await pathExists(filePath))) {
    throw new Error(`Local file not found: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!allowedImageExtensions.includes(ext)) {
    throw new Error(`Unsupported local image extension: ${ext}`);
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder: uploadFolder,
    resource_type: "image",
    unique_filename: true,
    overwrite: false
  });

  if (!result.secure_url) {
    throw new Error(`Cloudinary upload did not return a secure_url for ${filePath}`);
  }

  return result.secure_url;
}

async function uploadLocalImagesInRow<T extends Record<string, unknown> & { id?: unknown }>(row: T, keys: string[]) {
  const updated: Record<string, string> = {};

  for (const key of keys) {
    const value = row[key];
    if (typeof value !== "string" || !value) {
      continue;
    }

    if (!isLocalImageUrl(value)) {
      continue;
    }

    const localPath = normalizeLocalPath(value);
    if (!localPath) {
      console.warn(`Skipping unknown local image path: ${value}`);
      continue;
    }

    try {
      const remoteUrl = await uploadLocalFile(localPath);
      updated[key] = remoteUrl;
      console.log(`Uploaded ${key} for id=${row.id} -> ${remoteUrl}`);
    } catch (error) {
      console.warn(`Failed uploading local image for ${key} (${row.id}):`, error instanceof Error ? error.message : error);
    }
  }

  return Object.keys(updated).length ? updated : null;
}

async function recursiveListFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await recursiveListFiles(resolved)));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (allowedImageExtensions.includes(ext)) {
        results.push(resolved);
      }
    }
  }

  return results;
}

async function uploadOrphanLocalImages() {
  if (!(await pathExists(uploadsRoot))) {
    console.log("No local upload folder found at public/uploads. Skipping orphan local image upload.");
    return;
  }

  const files = await recursiveListFiles(uploadsRoot);
  if (!files.length) {
    console.log("No local upload files found under public/uploads.");
    return;
  }

  console.log(`Uploading ${files.length} local image(s) from public/uploads to Cloudinary...`);
  for (const file of files) {
    try {
      const remoteUrl = await uploadLocalFile(file);
      console.log(`  • ${path.relative(process.cwd(), file)} -> ${remoteUrl}`);
    } catch (error) {
      console.warn(`  • Failed uploading ${file}:`, error instanceof Error ? error.message : error);
    }
  }
}

async function migrateModel<T extends Record<string, unknown>>(
  modelName: string,
  rows: T[],
  createMany: (args: never) => Promise<unknown>
) {
  console.log(`Migrating ${rows.length} ${modelName} row(s)...`);
  if (!rows.length) {
    console.log(`  No ${modelName} rows found.`);
    return;
  }

  try {
    await createMany({ data: rows, skipDuplicates: true } as never);
    console.log(`  ${modelName} migrated.`);
  } catch (error) {
    console.error(`Failed migrating ${modelName}:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

async function migrateDatabase() {
  await sourceDb.$connect();
  await targetDb.$connect();

  const users = await sourceDb.user.findMany();
  await migrateModel("User", users, targetDb.user.createMany.bind(targetDb.user));

  const categories = await sourceDb.category.findMany();
  await migrateModel("Category", categories, targetDb.category.createMany.bind(targetDb.category));

  const brands = await sourceDb.brand.findMany();
  await migrateModel("Brand", brands, targetDb.brand.createMany.bind(targetDb.brand));

  const products = await sourceDb.product.findMany();
  await migrateModel("Product", products, targetDb.product.createMany.bind(targetDb.product));

  const productImages = await sourceDb.productImage.findMany();
  await migrateModel("ProductImage", productImages, targetDb.productImage.createMany.bind(targetDb.productImage));

  const affiliateLinks = await sourceDb.productAffiliateLink.findMany();
  await migrateModel("ProductAffiliateLink", affiliateLinks, targetDb.productAffiliateLink.createMany.bind(targetDb.productAffiliateLink));

  const productSpecs = await sourceDb.productSpec.findMany();
  await migrateModel("ProductSpec", productSpecs, targetDb.productSpec.createMany.bind(targetDb.productSpec));

  const productProsCons = await sourceDb.productProsCons.findMany();
  await migrateModel("ProductProsCons", productProsCons, targetDb.productProsCons.createMany.bind(targetDb.productProsCons));

  const articles = await sourceDb.article.findMany();
  await migrateModel("Article", articles, targetDb.article.createMany.bind(targetDb.article));

  const articleCategories = await sourceDb.articleCategory.findMany();
  await migrateModel("ArticleCategory", articleCategories, targetDb.articleCategory.createMany.bind(targetDb.articleCategory));

  const articleProducts = await sourceDb.articleProduct.findMany();
  await migrateModel("ArticleProduct", articleProducts, targetDb.articleProduct.createMany.bind(targetDb.articleProduct));

  const homepageSections = await sourceDb.homepageSection.findMany();
  await migrateModel("HomepageSection", homepageSections, targetDb.homepageSection.createMany.bind(targetDb.homepageSection));

  const seoMetadata = await sourceDb.seoMetadata.findMany();
  await migrateModel("SeoMetadata", seoMetadata, targetDb.seoMetadata.createMany.bind(targetDb.seoMetadata));

  const affiliateClicks = await sourceDb.affiliateClick.findMany();
  await migrateModel("AffiliateClick", affiliateClicks, targetDb.affiliateClick.createMany.bind(targetDb.affiliateClick));

  console.log("Database copy complete.");
}

async function updateLocalImageFields() {
  const updateField = async <T extends { id: string }>(rows: T[], fields: string[], updater: (id: string, data: Record<string, string>) => Promise<unknown>) => {
    for (const row of rows) {
      const changed = await uploadLocalImagesInRow(row, fields);
      if (changed) {
        await updater(row.id, changed as Record<string, string>);
      }
    }
  };

  const categories = await targetDb.category.findMany();
  await updateField(categories, ["imageUrl"], (id, data) => targetDb.category.update({ where: { id }, data }));

  const brands = await targetDb.brand.findMany();
  await updateField(brands, ["logoUrl"], (id, data) => targetDb.brand.update({ where: { id }, data }));

  const articles = await targetDb.article.findMany();
  await updateField(articles, ["coverImageUrl"], (id, data) => targetDb.article.update({ where: { id }, data }));

  const productImages = await targetDb.productImage.findMany();
  await updateField(productImages, ["imageUrl"], (id, data) => targetDb.productImage.update({ where: { id }, data }));

  const seoRows = await targetDb.seoMetadata.findMany();
  await updateField(seoRows, ["ogImageUrl"], (id, data) => targetDb.seoMetadata.update({ where: { id }, data }));

  console.log("Local image fields updated to Cloudinary URLs.");
}

async function main() {
  console.log("Starting local-to-cloud migration...");
  await migrateDatabase();
  await uploadOrphanLocalImages();
  await updateLocalImageFields();
  console.log("Migration complete. Verify the target database and Cloudinary assets.");
}

main()
  .catch((error) => {
    console.error("Migration failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await sourceDb.$disconnect();
    await targetDb.$disconnect();
  });
