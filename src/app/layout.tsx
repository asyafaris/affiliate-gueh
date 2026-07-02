import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Produk Worth It - Rekomendasi Setup Kerja dan WFH",
    template: "%s | Produk Worth It"
  },
  description: "Media rekomendasi produk Indonesia untuk setup kerja, WFH, gadget ringan, dan aksesori meja yang fungsional."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
