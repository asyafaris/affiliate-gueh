import ReactMarkdown from "react-markdown";
import { ProductCard } from "@/components/public/ProductCard";

type ArticleProduct = Parameters<typeof ProductCard>[0]["product"] & { placementNote?: string | null };

export function ArticleBody({ content, products }: { content: string; products: ArticleProduct[] }) {
  return (
    <div className="grid gap-8">
      <article className="prose prose-stone max-w-none prose-headings:font-serif prose-a:text-moss prose-hr:border-line prose-img:rounded-lg prose-img:border prose-img:border-line">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
      {products.length ? (
        <section className="grid gap-4">
          <h2 className="font-serif text-2xl font-bold">Produk yang disebut</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
