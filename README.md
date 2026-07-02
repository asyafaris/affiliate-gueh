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

3. Update `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXT_PUBLIC_SITE_URL`.

4. Run migration and seed:

```bash
npx prisma migrate dev --name init
npm run seed
```

5. Start local development:

```bash
npm run dev
```

Admin login defaults from `.env.example`:

- Email: `admin@affiliategueh.local`
- Password: `admin12345`

## Important Routes

- Public: `/`, `/kategori/[slug]`, `/produk/[slug]`, `/artikel/[slug]`, `/best/[slug]`, `/bandingkan/[slug]`
- Admin: `/admin`, `/admin/products`, `/admin/categories`, `/admin/brands`, `/admin/articles`, `/admin/affiliate-links`, `/admin/analytics`
- Tracking redirect: `/go/[code]`
- SEO: `/sitemap.xml`, `/robots.txt`

## Deployment Notes

Use a Supabase-compatible PostgreSQL database and set the same env vars in Vercel. The site does not checkout users locally; affiliate CTAs go through `/go/[code]`, log the click, then redirect to the merchant URL.
