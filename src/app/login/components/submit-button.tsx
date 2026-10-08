import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  pending,
  pendingLabel,
  label,
}: {
  pending: boolean;
  pendingLabel: string;
  label: string;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-full text-base font-semibold"
    >
      {pending ? (
        <>
          <Loader2 data-icon="inline-start" className="animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight data-icon="inline-end" />
        </>
      )}
    </Button>
  );
}
