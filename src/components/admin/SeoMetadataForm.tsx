"use client";

import { useState } from "react";
import { updateSeoMetadata } from "@/app/admin/actions";
import { AdminField, inputClass, textareaClass } from "@/components/admin/AdminField";

type Props = {
  productId: string;
  productName: string;
  currentData?: {
    seoTitle: string;
    metaDescription: string;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImageUrl?: string | null;
  };
};

export function SeoMetadataForm({ productId, productName, currentData }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    seoTitle: currentData?.seoTitle || `${productName}: review, pros cons, dan link pembelian`,
    metaDescription:
      currentData?.metaDescription ||
      `Kurasi produk ${productName} dengan pros/cons, spesifikasi, harga, dan rekomendasi pembeli terpercaya.`,
    ogTitle: currentData?.ogTitle || productName,
    ogDescription: currentData?.ogDescription || `Baca review dan rekomendasi ${productName}`,
    ogImageUrl: currentData?.ogImageUrl || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await updateSeoMetadata(productId, formData);
      if (result.success) {
        setMessage("SEO metadata saved");
      } else {
        setMessage("Error: " + result.error);
      }
    } catch (error) {
      setMessage("Error: " + String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-line bg-white p-6">
      <AdminField label={`SEO Title (60 chars max) - ${formData.seoTitle.length}/60`}>
        <input
          type="text"
          maxLength={60}
          value={formData.seoTitle}
          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
          className={inputClass}
          placeholder="Product name with key keyword"
        />
      </AdminField>

      <AdminField label={`Meta Description (160 chars max) - ${formData.metaDescription.length}/160`}>
        <textarea
          maxLength={160}
          rows={3}
          value={formData.metaDescription}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          className={textareaClass}
          placeholder="Summary for search results snippet"
        />
      </AdminField>

      <AdminField label="OG Title (for social share)">
        <input
          type="text"
          value={formData.ogTitle}
          onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
          className={inputClass}
          placeholder="How it appears when shared on Twitter/Facebook"
        />
      </AdminField>

      <AdminField label="OG Description (for social share)">
        <textarea
          rows={2}
          value={formData.ogDescription}
          onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
          className={textareaClass}
          placeholder="Teaser text for social preview"
        />
      </AdminField>

      <AdminField label="OG Image URL (for social preview)">
        <input
          type="url"
          value={formData.ogImageUrl}
          onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
          className={inputClass}
          placeholder="https://example.com/image.jpg"
        />
      </AdminField>

      <button type="submit" disabled={loading} className="btn-primary w-fit disabled:opacity-50">
        {loading ? "Menyimpan..." : "Simpan SEO Metadata"}
      </button>

      {message && (
        <p className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{message}</p>
      )}
    </form>
  );
}
