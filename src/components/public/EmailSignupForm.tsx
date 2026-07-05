"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";

type Props = {
  location?: "homepage" | "sidebar" | "footer" | "article";
  variant?: "light" | "dark";
  title?: string;
  subtitle?: string;
};

export function EmailSignupForm({
  location = "homepage",
  variant = "light",
  title = "Kurasi produk minggu ini langsung ke email",
  subtitle = "Setiap minggu kami kirim produk baru + tips setup kerja"
}: Props) {
  const dark = variant === "dark";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: location })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Berhasil! Terima kasih sudah subscribe.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Gagal subscribe. Coba lagi nanti.");
      }
    } catch {
      setStatus("error");
      setMessage("Gagal subscribe karena koneksi bermasalah. Coba ulangi sebentar lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className={dark ? "flex items-center gap-2 rounded-control bg-white/10 p-4 text-sm text-white" : "flex items-center gap-2 rounded-control bg-accent-tint p-4 text-sm text-accent-dark"}>
        <Check className="h-5 w-5" />
        {message}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={dark ? "rounded-panel bg-primary p-6 sm:flex sm:items-center sm:justify-between sm:gap-6" : "space-y-2"}
    >
      <div className={dark ? "sm:max-w-sm" : undefined}>
        <p className={dark ? "text-lg font-bold text-white" : "text-sm font-semibold"}>{title}</p>
        <p className={dark ? "mt-1 text-sm text-white/60" : "text-xs text-neutral-500"}>{subtitle}</p>
      </div>

      <div className={dark ? "mt-4 flex gap-2 sm:mt-0 sm:w-[380px]" : "mt-2 flex gap-2"}>
        <div className="relative flex-1">
          <Mail className={dark ? "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" : "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            className={
              dark
                ? "h-12 w-full rounded-control border-2 border-neutral-700 bg-neutral-900 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent"
                : "field-input pl-10"
            }
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary h-12 whitespace-nowrap disabled:opacity-50">
          {loading ? "..." : "Subscribe"}
        </button>
      </div>

      {status === "error" && <p className={dark ? "mt-2 text-xs text-red-300" : "mt-2 text-xs text-red-600"}>{message}</p>}

      <p className={dark ? "mt-3 text-xs text-white/40 sm:hidden" : "mt-2 text-xs text-neutral-400"}>
        Kami nggak spam. Unsubscribe kapan saja. Cek{" "}
        <a href="/affiliate-disclosure" className="underline hover:text-neutral-600">
          affiliate disclosure
        </a>
      </p>
    </form>
  );
}
