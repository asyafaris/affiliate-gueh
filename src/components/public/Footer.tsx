import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-serif text-xl font-bold">Produk Worth It</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink/70">
            Platform kurasi produk original dan worth it untuk membantu kamu memilih barang yang lebih aman, relevan, dan sesuai kebutuhan.
          </p>
        </div>
        <div className="grid gap-2 text-sm">
          <Link href="/">Home</Link>
          <Link href="/kategori">Kategori</Link>
          <Link href="/best">Best Pick</Link>
          <Link href="/bandingkan">Bandingkan</Link>
          <Link href="/#panduan">Artikel</Link>
          <Link href="/tentang">Tentang</Link>
          <Link href="/kontak">Kontak</Link>
          <Link href="/affiliate-disclosure">Disclosure</Link>
        </div>
        <p className="text-sm leading-6 text-ink/60">
          Website ini menggunakan beberapa tautan affiliate. Rekomendasi tetap disusun berdasarkan kurasi editorial, kecocokan kebutuhan, dan informasi produk yang tersedia.
        </p>
      </div>
    </footer>
  );
}
