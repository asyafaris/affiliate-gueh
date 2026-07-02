type Spec = { specGroup: string; label: string; value: string };

export function SpecsTable({ specs }: { specs: Spec[] }) {
  if (!specs.length) return <p className="text-sm text-neutral-500">Spesifikasi belum tersedia.</p>;
  return (
    <div className="overflow-hidden rounded-card border border-neutral-200">
      <table className="w-full text-sm">
        <tbody>
          {specs.map((spec) => (
            <tr key={`${spec.label}-${spec.value}`} className="border-t border-neutral-100 first:border-t-0 hover:bg-neutral-50">
              <th className="w-[180px] bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-500">{spec.label}</th>
              <td className="px-4 py-3 text-neutral-700">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
