"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";

type Props = {
  clicksThisWeek: number;
  emailSubscribers: number;
  productsReviewed: number;
};

export function SocialProofMetrics({ clicksThisWeek, emailSubscribers, productsReviewed }: Props) {
  const stats = [
    { value: clicksThisWeek, label: "Klik minggu ini" },
    { value: emailSubscribers, label: "Subscriber email" },
    { value: productsReviewed, label: "Produk direview" }
  ];

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="border-y border-neutral-100 bg-neutral-50 py-8">
        <div className="container-page">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <m.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-accent-dark md:text-4xl">{stat.value.toLocaleString("id-ID")}</div>
                <p className="mt-2 text-xs text-neutral-500">{stat.label}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
