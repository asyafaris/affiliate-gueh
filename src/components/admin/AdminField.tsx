export function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-ink">
      {label}
      {children}
    </label>
  );
}

export const inputClass = "rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-moss";
export const textareaClass = "min-h-28 rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-moss";
