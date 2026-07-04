# worthgoods

Production-minded MVP for an Indonesian affiliate editorial-commerce content hub.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Prisma ORM with PostgreSQL
- NextAuth Credentials Provider
- Server Actions for admin CMS mutations
- Affiliate redirect and click tracking through `/go/[code]`
- Dynamic metadata, sitemap, robots, JSON-LD helpers

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and `NEXT_PUBLIC_SITE_URL`.

4. Run migration and seed:

```bash
npx prisma migrate dev --name init
npm run seed
```

5. To migrate local database data and uploaded assets to a Neon cloud database and Cloudinary:

```bash
npm run migrate:cloud
```

Set environment variables in `.env` or shell before running:
- `SOURCE_DATABASE_URL` (local source database)
- `TARGET_DATABASE_URL` (Neon cloud database)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER` (optional)

6. Start local development:

```bash
npm run dev
```

Admin login defaults from `.env.example`:

- Email: `admin@affiliategueh.local`
- Password: `admin12345`

## Docker

Build and run the app in a container:

```bash
docker build -t affiliate-gueh .
docker run --env-file .env -p 3000:3000 affiliate-gueh
```

Use Docker Compose for a local PostgreSQL database:

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

## Vercel Deployment

1. Connect the repository to Vercel from GitHub.
2. Set the required environment variables in the Vercel project settings:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
3. Deploy from the `master` branch.

## Important Routes

- Public: `/`, `/kategori/[slug]`, `/produk/[slug]`, `/artikel/[slug]`, `/best/[slug]`, `/bandingkan/[slug]`
- Admin: `/admin`, `/admin/products`, `/admin/categories`, `/admin/brands`, `/admin/articles`, `/admin/affiliate-links`, `/admin/analytics`
- Tracking redirect: `/go/[code]`
- SEO: `/sitemap.xml`, `/robots.txt`

## Deployment Notes

Use a Neon-compatible PostgreSQL database and set the same env vars in Vercel. Use the Neon connection string in `DATABASE_URL` and `DIRECT_URL`. The site does not checkout users locally; affiliate CTAs go through `/go/[code]`, log the click, then redirect to the merchant URL.
