"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

type GalleryImage = { imageUrl: string; altText: string; caption?: string | null };

export function ProductImageGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];
  const thumbs = images.slice(0, 4);

  return (
    <div className="grid gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-neutral-200 bg-white">
        {active ? (
          <Image src={active.imageUrl} alt={active.altText || title} fill priority className="object-cover" />
        ) : (
          <ImagePlaceholder label="product shot 4:3" />
        )}
      </div>
      {active?.caption ? <p className="text-xs text-neutral-500">{active.caption}</p> : null}
      {thumbs.length > 1 ? (
        <div className="grid grid-cols-4 gap-2">
          {thumbs.map((image, index) => (
            <button
              key={image.imageUrl + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-control border-2 transition",
                index === activeIndex ? "border-accent ring-2 ring-accent/20" : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <Image src={image.imageUrl} alt={image.altText || title} fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
