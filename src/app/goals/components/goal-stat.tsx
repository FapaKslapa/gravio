export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="tabular mt-0.5 font-display text-base font-bold">
        {value}
        {hint && (
          <span className="ml-1.5 text-xs font-medium text-muted-foreground">
            {hint}
          </span>
        )}
      </dd>
    </div>
  );
}
