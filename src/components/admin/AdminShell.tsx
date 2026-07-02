import Link from "next/link";
import { BarChart3, Boxes, FileCheck2, FileText, GitCompare, Home, Link2, LogOut, Sparkles, Tags } from "lucide-react";

const nav = [
  ["Dashboard", "/admin", Home],
  ["Products", "/admin/products", Boxes],
  ["Categories", "/admin/categories", Tags],
  ["Brands", "/admin/brands", Tags],
  ["Articles", "/admin/articles", FileText],
  ["Best Pick", "/admin/best-picks", Sparkles],
  ["Guide", "/admin/guides", FileCheck2],
  ["Review", "/admin/reviews", FileText],
  ["Tips", "/admin/tips", FileText],
  ["Comparison", "/admin/comparisons", GitCompare],
  ["Affiliate links", "/admin/affiliate-links", Link2],
  ["Analytics", "/admin/analytics", BarChart3]
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f2ec]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-ink p-5 text-white lg:block">
        <Link href="/admin" className="font-serif text-xl font-bold">Produk Worth It CMS</Link>
        <nav className="mt-8 grid gap-1">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:px-8">
          <span className="font-semibold">Admin CMS</span>
          <Link href="/api/auth/signout" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70"><LogOut className="h-4 w-4" /> Logout</Link>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
