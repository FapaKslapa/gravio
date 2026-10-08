import { ArrowRight } from "lucide-react";
import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";

export function ConversionBadge({
  parsedAmount,
  convertedAmount,
  sourceCurrency,
  targetCurrency,
}: {
  parsedAmount: number;
  convertedAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
}) {
  return (
    <m.p
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="tabular flex items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <span>
        {parsedAmount.toFixed(2)} {sourceCurrency}
      </span>
      <ArrowRight className="size-3.5" aria-hidden />
      <span className="font-semibold text-foreground">
        {convertedAmount.toFixed(2)} {targetCurrency}
      </span>
      <span className="sr-only">conversione stimata</span>
    </m.p>
  );
}

export function SubmitButton({
  isSubmitting,
  type,
}: {
  isSubmitting: boolean;
  type: "expense" | "income";
}) {
  return (
    <Button
      type="submit"
      form="transaction-form"
      disabled={isSubmitting}
      className={
        type === "expense"
          ? "h-12 w-full bg-expense text-white hover:bg-expense/90"
          : "h-12 w-full bg-income text-white hover:bg-income/90"
      }
    >
      {isSubmitting ? "Salvataggio..." : "Salva transazione"}
    </Button>
  );
}
