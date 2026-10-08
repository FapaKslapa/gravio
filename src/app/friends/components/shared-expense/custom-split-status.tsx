import { CircleAlert, CircleCheck } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  customIsExact: boolean;
  customDifference: number;
  currency: string;
};

export function CustomSplitStatus({
  customIsExact,
  customDifference,
  currency,
}: Props) {
  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
        customIsExact
          ? "bg-income-soft text-income"
          : "bg-expense-soft text-expense",
      )}
    >
      {customIsExact ? (
        <>
          <CircleCheck className="size-4" aria-hidden="true" />
          Importi assegnati correttamente
        </>
      ) : (
        <>
          <CircleAlert className="size-4" aria-hidden="true" />
          <span className="tabular">
            {customDifference > 0
              ? `Mancano ${formatCurrency(customDifference, currency)}`
              : `Eccedenza di ${formatCurrency(-customDifference, currency)}`}
          </span>
        </>
      )}
    </p>
  );
}
