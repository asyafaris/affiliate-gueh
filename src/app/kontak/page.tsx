import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Kontak",
  description: "Hubungi tim Produk Worth It untuk kerja sama, koreksi, atau masukan editorial.",
  path: "/kontak"
});

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="container-page max-w-3xl py-12">
        <p className="eyebrow">Kontak</p>
        <h1 className="mt-3 font-serif text-5xl font-bold">Ada masukan produk atau kerja sama?</h1>
        <form className="mt-8 grid gap-4 rounded-lg border border-line bg-white p-6">
          <input className="rounded-md border border-line px-4 py-3 outline-none focus:border-moss" placeholder="Nama" />
          <input className="rounded-md border border-line px-4 py-3 outline-none focus:border-moss" placeholder="Email" type="email" />
          <textarea className="min-h-36 rounded-md border border-line px-4 py-3 outline-none focus:border-moss" placeholder="Pesan" />
          <button className="btn-primary" type="button">Kirim pesan</button>
          <p className="text-sm text-ink/55">Form ini adalah placeholder MVP. Hubungkan ke layanan email saat siap produksi.</p>
        </form>
      </main>
      <Footer />
    </>
  );
}
