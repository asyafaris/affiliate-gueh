import Link from "next/link";

export function DisclosureBox() {
  return (
    <div className="rounded-lg border border-dashed border-clay/50 bg-clay/10 p-4 text-sm leading-6 text-ink/80">
      Sebagian tautan pembelian di website ini dapat memberikan komisi kepada kami tanpa biaya tambahan untuk kamu. Rekomendasi tetap disusun secara editorial.{" "}
      <Link href="/affiliate-disclosure" className="font-semibold text-moss underline">
        Pelajari transparansi kami.
      </Link>
    </div>
  );
}
