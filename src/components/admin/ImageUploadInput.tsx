"use client";

import { useRef, useState } from "react";

type ImageUploadInputProps = {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
};

const inputClass = "min-w-0 rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-moss";

export function ImageUploadInput({ name, defaultValue, required, placeholder }: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<string | null>(null);

  async function upload(file: File) {
    setStatus("Mengupload gambar...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setStatus(result.error ?? "Upload gagal. Pastikan format JPG, PNG, WEBP, atau GIF dan ukuran maksimal 5MB.");
        return;
      }
      setValue(result.url);
      setStatus("Gambar berhasil diupload.");
    } catch {
      setStatus("Upload gagal karena koneksi bermasalah. Coba ulangi sebentar lagi.");
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <input
          name={name}
          className={`${inputClass} flex-1`}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.currentTarget.value = "";
          }}
        />
        <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => fileInputRef.current?.click()}>
          Upload gambar
        </button>
      </div>
      <p className="text-xs leading-5 text-ink/55">
        Isi URL manual atau upload gambar dari komputer. Gambar akan disimpan di Cloudinary.
      </p>
      {status ? <p className="text-xs font-medium text-moss">{status}</p> : null}
    </div>
  );
}
