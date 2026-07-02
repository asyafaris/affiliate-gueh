import Link from "next/link";
import { ExternalLink } from "lucide-react";

type LinkData = {
  redirectCode: string;
  buttonLabel: string;
  merchantName: string;
  isPrimary: boolean;
};

export function AffiliateButtonGroup({
  links,
  sourcePageType,
  sourcePageSlug
}: {
  links: LinkData[];
  sourcePageType: string;
  sourcePageSlug: string;
}) {
  const active = links;
  if (!active.length) return <p className="text-sm text-ink/60">Link pembelian belum tersedia.</p>;
  return (
    <div className="grid gap-2">
      {active.map((link) => (
        <Link
          key={link.redirectCode}
          href={`/go/${link.redirectCode}?source_page_type=${sourcePageType}&source_page_slug=${sourcePageSlug}`}
          className={link.isPrimary ? "btn-primary w-full" : "btn-secondary w-full"}
          rel="sponsored nofollow noopener"
        >
          {link.buttonLabel}
          <ExternalLink className="h-4 w-4" />
        </Link>
      ))}
    </div>
  );
}
