import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDb } from "@/lib/db";
import { detectDevice } from "@/lib/utils";

export default async function GoPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { code } = await params;
  const query = await searchParams;
  const db = getDb();
  const link = await db.productAffiliateLink.findUnique({ where: { redirectCode: code }, include: { product: true } });
  if (!link || !link.isActive) {
    return (
      <main className="container-page grid min-h-screen place-items-center py-12">
        <div className="card max-w-md p-8 text-center">
          <h1 className="font-serif text-3xl font-bold">Link tidak tersedia</h1>
          <p className="mt-3 text-sm leading-6 text-ink/65">Link affiliate ini sudah tidak aktif atau tidak ditemukan. Silakan kembali ke halaman utama.</p>
          <Link href="/" className="btn-primary mt-5">Kembali ke beranda</Link>
        </div>
      </main>
    );
  }

  try {
    const h = await headers();
    await db.affiliateClick.create({
      data: {
        productId: link.productId,
        affiliateLinkId: link.id,
        sourcePageType: query.source_page_type,
        sourcePageSlug: query.source_page_slug,
        referrer: h.get("referer"),
        utmSource: query.utm_source,
        utmMedium: query.utm_medium,
        utmCampaign: query.utm_campaign,
        deviceType: detectDevice(h.get("user-agent") ?? "")
      }
    });
  } catch (error) {
    console.error("Failed to log affiliate click", error);
  }

  redirect(link.affiliateUrl);
}
