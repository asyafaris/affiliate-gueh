import Image from "next/image";

export function ProductImageGallery({ images, title }: { images: { imageUrl: string; altText: string; caption?: string | null }[]; title: string }) {
  const primary = images[0];
  return (
    <div className="grid gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-line">
        {primary ? <Image src={primary.imageUrl} alt={primary.altText || title} fill priority className="object-cover" /> : null}
      </div>
      {primary?.caption ? <p className="text-xs text-ink/55">{primary.caption}</p> : null}
    </div>
  );
}
