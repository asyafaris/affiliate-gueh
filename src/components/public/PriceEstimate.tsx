import { formatRupiah } from "@/lib/utils";

export function PriceEstimate({ value }: { value: number }) {
  return <span className="font-semibold text-ink">{formatRupiah(value)}</span>;
}
