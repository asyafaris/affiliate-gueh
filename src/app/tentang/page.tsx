import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tentang Produk Worth It",
  description: "Misi, prinsip editorial, dan cara Produk Worth It memilih rekomendasi produk.",
  path: "/tentang"
});

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container-page max-w-4xl py-12">
        <p className="eyebrow">Tentang kami</p>
        <h1 className="mt-3 font-serif text-5xl font-bold">Kami membantu Anda membeli lebih sadar, bukan lebih impulsif.</h1>
        <div className="mt-8 grid gap-6 text-lg leading-8 text-ink/72">
          <p>Produk Worth It adalah hub editorial-commerce Indonesia untuk setup kerja, produktivitas, gadget ringan, home office, dan barang kamar yang tetap fungsional.</p>
          <p>Kami memilih produk berdasarkan use case, budget, kompromi, kemudahan dibeli, dan relevansi untuk pengguna Indonesia. Produk viral bisa masuk, tetapi tidak otomatis direkomendasikan.</p>
          <p>Konten first-hand review berarti produk benar-benar diuji langsung. Konten research-based recommendation berarti kami menilai spesifikasi, pola ulasan pengguna, reputasi brand, dan perbandingan harga. Keduanya akan dibedakan secara transparan dalam artikel.</p>
          <p>Monetisasi affiliate membantu website ini berjalan, tetapi rekomendasi tetap disusun secara editorial.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
