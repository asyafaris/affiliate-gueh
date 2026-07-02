import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Kontak",
  description: "Hubungi tim worthgoods untuk kerja sama, koreksi, atau masukan editorial.",
  path: "/kontak"
});

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="container-page max-w-3xl py-12">
        <p className="eyebrow">Kontak</p>
        <h1 className="mt-3 text-5xl font-bold">Ada masukan produk atau kerja sama?</h1>
        <form className="card mt-8 grid gap-4 p-6">
          <input className="field-input" placeholder="Nama" />
          <input className="field-input" placeholder="Email" type="email" />
          <textarea className="field-input min-h-36 py-3" placeholder="Pesan" />
          <button className="btn-primary" type="button">Kirim pesan</button>
          <p className="text-sm text-neutral-500">Form ini adalah placeholder MVP. Hubungkan ke layanan email saat siap produksi.</p>
        </form>
      </main>
      <Footer />
    </>
  );
}
