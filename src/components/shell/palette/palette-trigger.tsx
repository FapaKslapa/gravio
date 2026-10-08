import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "./palette-context";

export function CommandPaletteTrigger({
  variant = "bar",
  className,
}: {
  variant?: "bar" | "icon";
  className?: string;
}) {
  const { setOpen } = useCommandPalette();

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Cerca"
        className={cn(
          "flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
          className,
        )}
      >
        <Search className="size-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Cerca"
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 text-left">Cerca</span>
      <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[11px] md:inline">
        ⌘K
      </kbd>
    </button>
  );
}
