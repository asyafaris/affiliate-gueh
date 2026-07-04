import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { merchantStyle } from "@/lib/merchants";
import { cn, formatRupiah } from "@/lib/utils";

type LinkData = {
  redirectCode: string;
  buttonLabel: string;
  merchantName: string;
  isPrimary: boolean;
  price?: number | null;
};

function cheapestRedirectCode(links: LinkData[]) {
  const priced = links.filter((link): link is LinkData & { price: number } => typeof link.price === "number");
  if (priced.length < 2) return undefined;
  return priced.reduce((min, link) => (link.price < min.price ? link : min)).redirectCode;
}

export function AffiliateButtonGroup({
  links,
  sourcePageType,
  sourcePageSlug
}: {
  links: LinkData[];
  sourcePageType: string;
  sourcePageSlug: string;
}) {
  if (!links.length) return <p className="text-sm text-neutral-500">Link pembelian belum tersedia.</p>;
  const sorted = [...links].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  const cheapestCode = cheapestRedirectCode(links);

  return (
    <div className="grid gap-2">
      {sorted.map((link) => (
        <MerchantCta
          key={link.redirectCode}
          link={link}
          sourcePageType={sourcePageType}
          sourcePageSlug={sourcePageSlug}
          isCheapest={link.redirectCode === cheapestCode}
        />
      ))}
      <p className="text-center text-xs text-neutral-500">worthgoods dapat komisi tanpa biaya tambahan untuk kamu</p>
    </div>
  );
}

export function MerchantCta({
  link,
  sourcePageType,
  sourcePageSlug,
  isCheapest,
  compact,
  className
}: {
  link: LinkData;
  sourcePageType: string;
  sourcePageSlug: string;
  isCheapest?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const style = merchantStyle(link.merchantName);
  return (
    <Link
      href={`/go/${link.redirectCode}?source_page_type=${sourcePageType}&source_page_slug=${sourcePageSlug}`}
      rel="sponsored nofollow noopener"
      style={{ backgroundColor: style.bg }}
      className={cn(
        "flex min-h-[48px] min-w-0 items-center gap-3 rounded-control px-4 py-2.5 font-semibold text-white transition hover:-translate-y-px hover:brightness-110",
        compact ? "w-fit max-w-full justify-start" : "justify-between",
        className
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5 text-left">
        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          {style.mark}
        </span>
        <span className="grid min-w-0">
          <span className="break-words text-sm leading-snug">{link.buttonLabel || `Cek harga di ${link.merchantName}`}</span>
          {typeof link.price === "number" ? (
            <span className="flex flex-wrap items-center gap-1.5 text-xs font-normal text-white/80">
              {formatRupiah(link.price)}
              {isCheapest ? (
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide">TERMURAH</span>
              ) : null}
            </span>
          ) : null}
        </span>
      </span>
      <ExternalLink className="h-4 w-4 flex-none" />
    </Link>
  );
}
