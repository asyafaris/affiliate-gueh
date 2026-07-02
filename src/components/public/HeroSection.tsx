"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";

const trustPoints = [
  "Kami mulai dari kebutuhan, bukan hype.",
  "Kami mencatat kompromi produk.",
  "Kami mengutamakan sumber pembelian yang lebih aman."
];

export function HeroSection({ quickPick }: { quickPick: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <section className="border-b border-line bg-[linear-gradient(180deg,#fbfaf5,#edf4eb)]">
        <div className="container-page grid min-h-[320px] items-center gap-8 py-10 md:min-h-[400px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-14">
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="eyebrow">Platform kurasi produk Indonesia</p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Temukan produk original yang paling worth it untuk kebutuhanmu.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink/72 lg:text-lg lg:leading-8">
              Kurasi produk setup kerja dan gadget produktivitas, dipilih berdasarkan kebutuhan, kualitas, dan reputasi sumber pembelian.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="#produk" className="btn-primary">
                Cari rekomendasi
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/best" className="btn-secondary">
                Lihat best picks
              </Link>
            </div>

            <div id="cari" className="mt-6 flex max-w-xl items-center gap-3 rounded-lg border border-line bg-white p-2 shadow-soft">
              <Search className="ml-3 h-5 w-5 text-ink/40" />
              <input className="h-11 flex-1 bg-transparent text-sm outline-none" placeholder="Cari kursi, keyboard, lampu meja, tas kerja..." />
              <Link href="/kategori" className="btn-primary h-11">Jelajahi</Link>
            </div>
          </m.div>

          <m.aside
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden lg:block"
          >
            <div className="grid gap-4">
              <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
                <p className="eyebrow">Quick pick</p>
                {quickPick}
              </div>
              <div className="grid gap-3 rounded-lg border border-line bg-ink p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-white/65">Kenapa bisa dipercaya?</p>
                {trustPoints.map((item) => (
                  <p key={item} className="flex gap-2 text-sm leading-6 text-white/80">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-white" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </m.aside>
        </div>
      </section>
    </LazyMotion>
  );
}
