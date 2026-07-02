import Link from "next/link";
import { Search } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/kategori", label: "Kategori" },
  { href: "/best", label: "Best Pick" },
  { href: "/bandingkan", label: "Bandingkan" },
  { href: "/#panduan", label: "Artikel" },
  { href: "/tentang", label: "Tentang" },
  { href: "/affiliate-disclosure", label: "Disclosure" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-xl font-bold text-ink">
          Produk Worth It
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-ink/75 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-moss">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/#cari" className="btn-secondary h-10 px-3" aria-label="Cari rekomendasi">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Cari</span>
        </Link>
      </div>
    </header>
  );
}
