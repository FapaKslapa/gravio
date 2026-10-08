import type { LucideIcon } from "lucide-react";

export const itemClass = "min-h-12 gap-3 px-2 py-2 md:min-h-11";

export function ItemIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}
