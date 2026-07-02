"use client";

import { useRef, useState } from "react";

type ImageListInputProps = {
  name: string;
  defaultValue?: string;
};

const textareaClass = "min-h-28 min-w-0 rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-moss";

export function ImageListInput({ name, defaultValue = "" }: ImageListInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<string | null>(null);

  async function upload(files: FileList) {
    const urls: string[] = [];
    setStatus(`Mengupload ${files.length} gambar...`);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
        const result = await response.json() as { url?: string; error?: string };
        if (!response.ok || !result.url) {
          setStatus(result.error ?? "Ada gambar yang gagal diupload. Pastikan format JPG, PNG, WEBP, atau GIF dan ukuran maksimal 5MB.");
          return;
        }
        urls.push(result.url);
      }
    } catch {
      setStatus("Upload gagal karena koneksi bermasalah. Coba ulangi sebentar lagi.");
      return;
    }

    setValue((current) => [current.trim(), ...urls].filter(Boolean).join("\n"));
    setStatus("Gambar berhasil ditambahkan.");
  }

  return (
    <div className="grid min-w-0 gap-2">
      <textarea name={name} className={textareaClass} value={value} onChange={(event) => setValue(event.target.value)} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = event.target.files;
            if (files?.length) void upload(files);
            event.currentTarget.value = "";
          }}
        />
        <button type="button" className="btn-secondary py-2" onClick={() => fileInputRef.current?.click()}>
          Upload gambar produk
        </button>
        <p className="text-xs leading-5 text-ink/55">Gambar pertama akan menjadi gambar utama produk.</p>
      </div>
      {status ? <p className="text-xs font-medium text-moss">{status}</p> : null}
    </div>
  );
}
