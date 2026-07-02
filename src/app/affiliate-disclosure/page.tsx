import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Affiliate Disclosure",
  description: "Penjelasan tentang affiliate link, komisi, independensi editorial, dan perubahan harga atau stok.",
  path: "/affiliate-disclosure"
});

export default function AffiliateDisclosurePage() {
  return (
    <>
      <Header />
      <main className="container-page max-w-4xl py-12">
        <p className="eyebrow">Transparansi</p>
        <h1 className="mt-3 font-serif text-5xl font-bold">Affiliate disclosure</h1>
        <div className="mt-8 grid gap-5 text-lg leading-8 text-ink/72">
          <p>Sebagian link di website ini adalah affiliate link. Jika Anda membeli produk melalui link tersebut, kami bisa menerima komisi dari merchant atau platform affiliate.</p>
          <p>Harga yang Anda bayar tidak bertambah karena komisi tersebut. Transaksi tetap terjadi di website merchant seperti Shopee, Tokopedia, TikTok Shop, Lazada, atau merchant lain.</p>
          <p>Rekomendasi tetap disusun secara editorial. Kami berusaha menjelaskan kelebihan, kekurangan, dan kecocokan produk secara jujur agar keputusan pembelian lebih jelas.</p>
          <p>Harga, promo, varian, ongkir, dan stok dapat berubah sewaktu-waktu di website merchant. Selalu cek ulang detail akhir sebelum membeli.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
