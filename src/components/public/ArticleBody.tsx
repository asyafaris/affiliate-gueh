"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ProductCard } from "@/components/public/ProductCard";
import { EmailSignupForm } from "@/components/public/EmailSignupForm";
import { cn, slugify } from "@/lib/utils";

type ArticleProduct = Parameters<typeof ProductCard>[0]["product"] & { placementNote?: string | null };

type Section = { id: string; heading: string; body: string };

const proseClass =
  "prose prose-stone max-w-none prose-headings:text-primary prose-a:text-accent-dark prose-hr:border-neutral-200 prose-img:rounded-card prose-img:border prose-img:border-neutral-200";

function splitSections(content: string) {
  const lines = content.split("\n");
  const introLines: string[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    const match = /^##\s+(.+)$/.exec(line.trim());
    if (match) {
      if (current) sections.push(current);
      current = { id: slugify(match[1]), heading: match[1], body: "" };
    } else if (current) {
      current.body += `${line}\n`;
    } else {
      introLines.push(line);
    }
  }
  if (current) sections.push(current);
  return { intro: introLines.join("\n"), sections };
}

export function ArticleBody({ content, products }: { content: string; products: ArticleProduct[] }) {
  const { intro, sections } = splitSections(content);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const headings = rootRef.current?.querySelectorAll("h2[id]");
    if (!headings?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-96px 0px -70% 0px" }
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [sections.length]);

  const inlinePlacements = new Map(
    sections
      .map((section) => [section.heading.trim().toLowerCase(), products.find((product) => product.placementNote?.trim().toLowerCase() === section.heading.trim().toLowerCase())] as const)
      .filter((entry): entry is [string, ArticleProduct] => Boolean(entry[1]))
  );
  const placedSlugs = new Set([...inlinePlacements.values()].map((product) => product.slug));
  const trailingProducts = products.filter((product) => !placedSlugs.has(product.slug));

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      {sections.length > 1 ? (
        <nav className="hidden lg:sticky lg:top-[76px] lg:block lg:h-fit lg:self-start">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">Isi artikel</p>
          <ul className="mt-3 grid gap-1 border-l-2 border-neutral-100">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={cn(
                    "-ml-0.5 block border-l-2 py-1 pl-3 text-sm",
                    activeId === section.id ? "border-accent font-semibold text-accent-dark" : "border-transparent text-neutral-500 hover:text-primary"
                  )}
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div ref={rootRef} className="grid gap-8">
        {intro.trim() ? (
          <article className={proseClass}>
            <ReactMarkdown>{intro}</ReactMarkdown>
          </article>
        ) : null}

        {sections.map((section, index) => {
          const inlineProduct = inlinePlacements.get(section.heading.trim().toLowerCase());
          return (
            <div key={section.id} className="grid gap-6">
              <article className={proseClass}>
                <h2 id={section.id}>{section.heading}</h2>
                <ReactMarkdown>{section.body}</ReactMarkdown>
              </article>
              {inlineProduct ? (
                <div className="max-w-md">
                  <ProductCard product={inlineProduct} />
                </div>
              ) : null}
              {index === 1 ? (
                <EmailSignupForm
                  location="article"
                  variant="dark"
                  title="Suka konten kayak gini?"
                  subtitle="Kami kirim rekomendasi baru tiap minggu, tanpa spam."
                />
              ) : null}
            </div>
          );
        })}

        {trailingProducts.length ? (
          <section className="grid gap-4">
            <h2 className="text-2xl">Produk yang disebut</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {trailingProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
