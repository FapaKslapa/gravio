export function BulkConvertedTotal({
  converted,
  currency,
}: {
  converted: number;
  currency: string;
}) {
  return (
    <div className="flex justify-between rounded-lg bg-brand-soft px-3.5 py-2.5 text-sm font-semibold text-brand">
      <span>Totale convertito</span>
      <span className="tabular">
        {converted.toFixed(2)} {currency}
      </span>
    </div>
  );
}
