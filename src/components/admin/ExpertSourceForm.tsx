"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { addExpertSource, removeExpertSource } from "@/app/admin/actions";
import { AdminField, inputClass, textareaClass } from "@/components/admin/AdminField";

type ExpertSource = {
  id: string;
  sourceType: string;
  sourceName: string;
  sourceUrl: string;
  sourceAuthorFollowers: number | null;
  quote: string | null;
};

type Props = {
  productId: string;
  expertSources: ExpertSource[];
};

export function ExpertSourceForm({ productId, expertSources }: Props) {
  const [sources, setSources] = useState<ExpertSource[]>(expertSources);
  const [newSource, setNewSource] = useState({
    sourceType: "YOUTUBE",
    sourceName: "",
    sourceUrl: "",
    sourceAuthorFollowers: "",
    quote: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAdd = async () => {
    if (!newSource.sourceName.trim()) {
      setMessage("Nama expert atau channel wajib diisi.");
      return;
    }
    if (!newSource.sourceUrl.trim()) {
      setMessage("URL sumber wajib diisi.");
      return;
    }
    if (!/^https?:\/\//.test(newSource.sourceUrl.trim())) {
      setMessage("URL sumber harus lengkap, contoh https://youtube.com/watch?v=...");
      return;
    }
    if (newSource.sourceAuthorFollowers && Number(newSource.sourceAuthorFollowers) < 0) {
      setMessage("Jumlah followers tidak boleh negatif.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await addExpertSource(productId, {
        sourceType: newSource.sourceType,
        sourceName: newSource.sourceName,
        sourceUrl: newSource.sourceUrl,
        sourceAuthorFollowers: newSource.sourceAuthorFollowers ? parseInt(newSource.sourceAuthorFollowers) : null,
        quote: newSource.quote || null
      });

      if (result.success && result.data) {
        setSources([...sources, result.data]);
        setNewSource({ sourceType: "YOUTUBE", sourceName: "", sourceUrl: "", sourceAuthorFollowers: "", quote: "" });
        setMessage("Expert source berhasil ditambahkan.");
      } else {
        setMessage(result.error ?? "Expert source gagal ditambahkan. Cek kembali datanya.");
      }
    } catch (error) {
      setMessage("Expert source gagal ditambahkan karena koneksi atau server bermasalah. Coba ulangi sebentar lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sourceId: string) => {
    setLoading(true);

    try {
      const result = await removeExpertSource(sourceId);
      if (result.success) {
        setSources(sources.filter((s) => s.id !== sourceId));
        setMessage("Expert source berhasil dihapus.");
      } else {
        setMessage(result.error ?? "Expert source gagal dihapus.");
      }
    } catch {
      setMessage("Expert source gagal dihapus karena koneksi atau server bermasalah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 rounded-lg border border-line bg-white p-6">
      <h3 className="font-bold">Expert Sources (Influencer, Blog, Forum yang mention produk ini)</h3>

      <div className="grid gap-2">
        {sources.map((source) => (
          <div key={source.id} className="flex items-start justify-between gap-3 rounded-lg border border-line/50 bg-paper p-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded bg-moss/10 px-2 py-0.5 text-moss">{source.sourceType}</span>
                <span>{source.sourceName}</span>
                {source.sourceAuthorFollowers && (
                  <span className="text-ink/60">({source.sourceAuthorFollowers.toLocaleString()} followers)</span>
                )}
              </div>
              <p className="mt-1 break-all text-xs text-ink/70">{source.sourceUrl}</p>
              {source.quote && <p className="mt-1 text-xs italic text-ink/75">&quot;{source.quote}&quot;</p>}
            </div>
            <button onClick={() => handleDelete(source.id)} disabled={loading} className="ml-2 shrink-0 rounded p-1 hover:bg-red-100" type="button">
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        ))}
        {!sources.length && <p className="text-sm text-ink/55">Belum ada expert source.</p>}
      </div>

      <div className="grid gap-3 border-t border-line pt-4">
        <h4 className="text-sm font-semibold">Tambah Expert Source</h4>

        <div className="grid gap-3 md:grid-cols-2">
          <AdminField label="Tipe Sumber">
            <select value={newSource.sourceType} onChange={(e) => setNewSource({ ...newSource, sourceType: e.target.value })} className={inputClass}>
              <option>YOUTUBE</option>
              <option>BLOG</option>
              <option>FORUM</option>
              <option>REVIEW</option>
            </select>
          </AdminField>
          <AdminField label="Nama Expert / Channel">
            <input
              type="text"
              value={newSource.sourceName}
              onChange={(e) => setNewSource({ ...newSource, sourceName: e.target.value })}
              placeholder="@YouTuberName atau Blog Name"
              className={inputClass}
            />
          </AdminField>
        </div>

        <AdminField label="URL">
          <input
            type="url"
            value={newSource.sourceUrl}
            onChange={(e) => setNewSource({ ...newSource, sourceUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className={inputClass}
          />
        </AdminField>

        <AdminField label="Followers (optional)">
          <input
            type="number"
            value={newSource.sourceAuthorFollowers}
            onChange={(e) => setNewSource({ ...newSource, sourceAuthorFollowers: e.target.value })}
            placeholder="250000"
            className={inputClass}
          />
        </AdminField>

        <AdminField label="Quote (apa yang mereka bilang, optional)">
          <textarea
            value={newSource.quote}
            onChange={(e) => setNewSource({ ...newSource, quote: e.target.value })}
            placeholder="Keyboard ini best budget option 2024"
            rows={2}
            className={textareaClass}
          />
        </AdminField>

        <button onClick={handleAdd} disabled={loading} className="btn-primary inline-flex w-fit items-center gap-2 disabled:opacity-50" type="button">
          <Plus className="h-4 w-4" /> Add Source
        </button>

        {message && <p className={`text-sm ${message.includes("gagal") || message.includes("wajib") || message.includes("harus") || message.includes("negatif") ? "text-red-600" : "text-green-600"}`}>{message}</p>}
      </div>
    </div>
  );
}
