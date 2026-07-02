import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink/55" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.href} className="flex items-center gap-2">
          {index > 0 ? <span>/</span> : null}
          <Link href={item.href} className="hover:text-moss">{item.label}</Link>
        </span>
      ))}
    </nav>
  );
}
