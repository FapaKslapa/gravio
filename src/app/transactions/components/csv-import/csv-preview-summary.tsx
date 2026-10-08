import { formatCurrency } from "@/lib/utils";

type Props = {
  count: number;
  duplicates: number;
  totals: [string, { income: number; expense: number }][];
};

export function CsvPreviewSummary({ count, duplicates, totals }: Props) {
  return (
    <div className="rounded-lg border bg-card p-3" aria-live="polite">
      <p className="text-sm font-semibold">
        <span className="tabular">{count}</span> movimenti
        {duplicates > 0 && (
          <span className="font-normal text-muted-foreground">
            {" "}
            ({duplicates} già presenti)
          </span>
        )}
      </p>
      {totals.map(([cur, t]) => (
        <p key={cur} className="num-display mt-1 text-sm">
          <span className="text-income">
            Entrate +{formatCurrency(t.income, cur)}
          </span>
          <span className="text-muted-foreground"> · </span>
          <span className="text-expense">
            Uscite -{formatCurrency(t.expense, cur)}
          </span>
        </p>
      ))}
    </div>
  );
}
