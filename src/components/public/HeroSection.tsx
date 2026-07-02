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
      <section className="border-b border-neutral-100 bg-gradient-wash">
        <div className="container-page grid min-h-[320px] items-center gap-8 py-10 md:min-h-[400px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-14">
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge bg-accent-tint text-accent-dark">
              <ShieldCheck className="h-3.5 w-3.5" /> Diuji &amp; dibandingkan tim kami
            </span>
            <h1 className="mt-4 max-w-4xl text-4xl leading-[1.1] sm:text-5xl lg:text-[48px]">
              Rekomendasi yang benar-benar worth it.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 lg:text-lg lg:leading-8">
              Kami uji dan bandingkan produk setup kerja dan gadget produktivitas dari Shopee, Tokopedia, Lazada, dan Blibli — biar kamu tidak buang waktu dan uang.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="#produk" className="btn-primary">
                Lihat pilihan teratas
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/best" className="btn-secondary">
                Lihat best picks
              </Link>
            </div>

            <div id="cari" className="mt-6 flex max-w-xl items-center gap-3 rounded-control border-2 border-neutral-200 bg-white p-2 shadow-soft">
              <Search className="ml-3 h-5 w-5 text-neutral-400" />
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
              <div className="card p-5">
                <span className="badge bg-accent-tint text-accent-dark">⭐ Editor&apos;s Pick</span>
                {quickPick}
              </div>
              <div className="grid gap-3 rounded-panel bg-primary p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-white/65">Kenapa bisa dipercaya?</p>
                {trustPoints.map((item) => (
                  <p key={item} className="flex gap-2 text-sm leading-6 text-white/80">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-accent" />
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
