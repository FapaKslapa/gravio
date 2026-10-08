import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DEFAULT_LABELS } from "./card-stack-constants";
import type { CardStackItem } from "./card-stack-types";

type Props = {
  text: typeof DEFAULT_LABELS;
  isDismiss: boolean;
  showControls: boolean;
  count: number;
  current: number;
  top: CardStackItem;
  onDiscard: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function CardStackControls({
  text,
  isDismiss,
  showControls,
  count,
  current,
  top,
  onDiscard,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2",
        showControls
          ? "mt-2"
          : "sr-only focus-within:not-sr-only focus-within:absolute! focus-within:inset-x-2 focus-within:bottom-2 focus-within:z-50 focus-within:rounded-xl focus-within:bg-card focus-within:p-1 focus-within:shadow-md",
      )}
    >
      {isDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="gap-1"
          onClick={onDiscard}
        >
          <X aria-hidden />
          {text.dismiss}
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="gap-1"
          onClick={onPrevious}
        >
          <ChevronLeft aria-hidden />
          {text.previous}
        </Button>
      )}
      {count > 1 && (
        <p
          aria-live="polite"
          className={
            showControls
              ? "text-center text-sm font-medium tabular-nums text-muted-foreground"
              : "sr-only"
          }
        >
          {text.position(current + 1, count, top)}
        </p>
      )}
      {count > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="gap-1"
          onClick={onNext}
        >
          {text.next}
          <ChevronRight aria-hidden />
        </Button>
      )}
    </div>
  );
}
