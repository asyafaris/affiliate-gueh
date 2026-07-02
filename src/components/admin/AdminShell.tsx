"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, FileText, GitCompare, Home, Link2, LogOut, Sparkles, Tags } from "lucide-react";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { cn } from "@/lib/utils";

const nav = [
  ["Dashboard", "/admin", Home],
  ["Products", "/admin/products", Boxes],
  ["Categories", "/admin/categories", Tags],
  ["Brands", "/admin/brands", Tags],
  ["Articles", "/admin/articles", FileText],
  ["Best Pick", "/admin/best-picks", Sparkles],
  ["Review", "/admin/reviews", FileText],
  ["Tips", "/admin/tips", FileText],
  ["Comparison", "/admin/comparisons", GitCompare],
  ["Affiliate links", "/admin/affiliate-links", Link2],
  ["Analytics", "/admin/analytics", BarChart3]
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside className="fixed inset-y-0 left-0 hidden w-[236px] flex-col border-r border-neutral-800 bg-primary p-4 text-white lg:flex">
        <Link href="/admin" className="flex items-center gap-2 px-2 py-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">w</span>
          <span>
            <span className="block text-sm font-bold leading-tight">worthgoods</span>
            <span className="block text-[11px] leading-tight text-white/50">Admin</span>
          </span>
        </Link>
        <nav className="mt-6 grid flex-1 gap-1 overflow-y-auto">
          {nav.map(([label, href, Icon]) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition",
                  active ? "bg-accent text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex items-center gap-3 rounded-control border border-white/10 p-3">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent-tint text-xs font-bold text-accent-dark">A</span>
          <div className="min-w-0 flex-1 text-xs">
            <p className="truncate font-semibold text-white">Admin</p>
            <p className="truncate text-white/50">Editor</p>
          </div>
          <Link href="/api/auth/signout" aria-label="Logout" className="text-white/60 hover:text-white">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </aside>
      <div className="lg:pl-[236px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-8">
          <span className="font-semibold text-primary">worthgoods Admin</span>
          <Link href="/api/auth/signout" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 lg:hidden">
            <LogOut className="h-4 w-4" /> Logout
          </Link>
        </header>
        <main className="p-4 lg:p-8">
          <AdminFlash />
          {children}
        </main>
      </div>
    </div>
  );
}
