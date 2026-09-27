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

The image uses Next.js standalone output and runs as a non-root user. `.env` is read at runtime (never baked into the image).

Run the app together with a local PostgreSQL database:

```bash
docker compose up --build -d
docker compose run --rm migrate                # apply Prisma migrations
```

Compose overrides `DATABASE_URL`/`DIRECT_URL` to point at the `db` service and `NEXTAUTH_URL` to `http://localhost:3000`; other values come from `.env`. The app is available at `http://localhost:3000`.

To run only the app container against an external database (e.g. Supabase/Neon):

```bash
docker build -t affiliate-gueh .
docker run --env-file .env -p 3000:3000 affiliate-gueh
```

## Cloudflare Workers Deployment

Uses `@opennextjs/cloudflare` with Prisma's `pg` driver adapter. Deploy via the Cloudflare dashboard (no CLI login needed):

1. Cloudflare dashboard > Workers & Pages > Create > Import a repository (GitHub), pick this repo.
2. Build command: `npx opennextjs-cloudflare build`
3. Deploy command: `npx wrangler deploy`
4. Add variables/secrets (Settings > Variables and Secrets): `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your `*.workers.dev` URL), `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_*`. `NEXT_PUBLIC_SITE_URL` must also be set under Build variables.

Optional: add a Hyperdrive binding named `HYPERDRIVE` in `wrangler.jsonc`; `getDb()` uses it automatically. Local preview: `npm run cloudflare:dev`. Migrations are applied with `prisma migrate deploy`, not from the Worker.

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
