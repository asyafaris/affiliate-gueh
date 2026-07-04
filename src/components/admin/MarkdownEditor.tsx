"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type MarkdownEditorProps = {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  imageHint?: boolean;
};

export function MarkdownEditor({ name, defaultValue, required, rows = 8, placeholder, imageHint }: MarkdownEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const height = Math.max(rows * 36, 180);

  async function uploadImage(file: File) {
    setUploadStatus("Mengupload gambar...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setUploadStatus(result.error ?? "Upload gambar gagal. Pastikan format JPG, PNG, WEBP, atau GIF dan ukuran maksimal 5MB.");
        return;
      }

      const alt = file.name.replace(/\.[^.]+$/, "").replaceAll("-", " ");
      const imageMarkdown = `\n\n![${alt}](${result.url})\n\n`;
      setValue((current) => `${current}${imageMarkdown}`);
      setMode("write");
      setUploadStatus("Gambar berhasil diupload dan ditambahkan ke konten.");
    } catch {
      setUploadStatus("Upload gambar gagal karena koneksi bermasalah. Coba ulangi sebentar lagi.");
    }
  }

  return (
    <div className="grid min-w-0 gap-2" data-color-mode="light">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-ink/55">Gunakan toolbar atau Markdown untuk mengatur format tulisan.</p>
        <div className="inline-flex w-fit rounded-md border border-line bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${mode === "write" ? "bg-ink text-white" : "text-ink/65 hover:text-moss"}`}
          >
            Tulis
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${mode === "preview" ? "bg-ink text-white" : "text-ink/65 hover:text-moss"}`}
          >
            Preview
          </button>
        </div>
      </div>
      {imageHint ? (
        <div className="rounded-md border border-line bg-paper px-3 py-2 text-xs leading-5 text-ink/60">
          <p>Untuk menambahkan gambar di bagian konten atau per poin, gunakan format Markdown: <code>![deskripsi gambar](https://url-gambar)</code>. Upload di sini akan tersimpan ke Cloudinary.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadImage(file);
                event.currentTarget.value = "";
              }}
            />
            <button type="button" className="btn-secondary py-1.5 text-xs" onClick={() => fileInputRef.current?.click()}>
              Upload gambar ke konten
            </button>
            {uploadStatus ? <span className="font-medium text-moss">{uploadStatus}</span> : null}
          </div>
        </div>
      ) : null}
      <div className="min-w-0 overflow-x-auto overflow-y-hidden rounded-md border border-line bg-white focus-within:border-moss">
        <MDEditor
          value={value}
          onChange={(nextValue) => setValue(nextValue ?? "")}
          height={height}
          preview={mode === "write" ? "edit" : "preview"}
          visibleDragbar={false}
          textareaProps={{ placeholder }}
        />
      </div>
      <input type="hidden" name={name} value={value} required={required} />
    </div>
  );
}
