"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";

type Props = {
  location?: "homepage" | "sidebar" | "footer";
};

export function EmailSignupForm({ location = "homepage" }: Props) {
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
    } catch (error) {
      setStatus("error");
      setMessage("Error: " + String(error));
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-leaf/10 p-4 text-sm text-moss">
        <Check className="h-5 w-5" />
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm font-semibold">Kurasi produk minggu ini langsung ke email</p>
      <p className="text-xs text-ink/60">Setiap minggu kami kirim produk baru + tips setup kerja</p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm outline-none focus:border-moss"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary h-11 disabled:opacity-50">
          {loading ? "..." : "Subscribe"}
        </button>
      </div>

      {status === "error" && <p className="text-xs text-red-600">{message}</p>}

      <p className="text-xs text-ink/50">
        Kami nggak spam. Unsubscribe kapan saja. Cek{" "}
        <a href="/affiliate-disclosure" className="underline hover:text-ink/70">
          affiliate disclosure
        </a>
      </p>
    </form>
  );
}
