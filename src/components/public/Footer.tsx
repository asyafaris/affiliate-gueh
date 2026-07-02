import Link from "next/link";

const links = [
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" }
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="container-page flex flex-col gap-4 py-5 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <span className="text-sm font-bold text-primary">worthgoods</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
