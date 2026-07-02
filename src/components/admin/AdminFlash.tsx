"use client";

import { useSearchParams } from "next/navigation";

export function AdminFlash() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");
  const message = error || success;

  if (!message) return null;

  return (
    <div
      role="alert"
      className={[
        "mb-5 rounded-lg border px-4 py-3 text-sm leading-6",
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      ].join(" ")}
    >
      <p className="font-semibold">{error ? "Data belum bisa disimpan" : "Berhasil"}</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
