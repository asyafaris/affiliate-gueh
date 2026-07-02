export function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1 text-sm font-medium text-primary">
      {label}
      {children}
    </label>
  );
}

export const inputClass = "field-input min-w-0";
export const textareaClass = "field-input min-h-28 min-w-0 py-2";
