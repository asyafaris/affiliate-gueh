type Spec = { specGroup: string; label: string; value: string };

export function SpecsTable({ specs }: { specs: Spec[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-sm">
        <tbody>
          {specs.map((spec) => (
            <tr key={`${spec.label}-${spec.value}`} className="border-b border-line last:border-0">
              <th className="w-1/3 bg-white px-4 py-3 text-left font-semibold text-ink">{spec.label}</th>
              <td className="bg-paper px-4 py-3 text-ink/75">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
