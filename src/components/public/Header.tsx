"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";

const navItems = [
  { href: "/kategori", label: "Kategori" },
  { href: "/bandingkan", label: "Perbandingan" },
  { href: "/best", label: "Best Pick" },
  { href: "/tentang", label: "Tentang" }
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-[60px] border-b border-neutral-200 bg-white/92 backdrop-blur">
      <div className="container-page flex h-full items-center gap-4">
        <Link href="/" className="flex flex-none items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">w</span>
          <span className="text-[17px] font-bold tracking-[-0.02em] text-primary">worthgoods</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-5 text-sm font-medium text-neutral-700 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/kategori"
          className="ml-auto hidden h-[38px] w-[220px] items-center gap-2 rounded-control border-2 border-neutral-300 px-3 text-sm text-neutral-400 transition hover:border-accent lg:flex"
        >
          <Search className="h-4 w-4" />
          Cari produk…
        </Link>

        <Link
          href="/kategori"
          aria-label="Cari produk"
          className="ml-auto flex h-9 w-9 items-center justify-center text-neutral-700 lg:hidden"
        >
          <Search className="h-5 w-5" />
        </Link>
        <button
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center text-neutral-700 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-neutral-200 bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-control px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
