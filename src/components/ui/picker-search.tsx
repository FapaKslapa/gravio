import { Search, X } from "lucide-react";
import type * as React from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";

type Props = {
  query: string;
  label: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onQueryChange: (value: string) => void;
};

export function PickerSearch({
  query,
  label,
  onKeyDown,
  onQueryChange,
}: Props) {
  const isMobile = useIsMobile();
  return (
    <div className="flex items-center gap-2 border-b px-3">
      <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      <input
        // biome-ignore lint/a11y/noAutofocus: la ricerca deve avere il focus solo su desktop
        autoFocus={!isMobile}
        type="text"
        role="combobox"
        aria-expanded
        aria-controls="picker-listbox"
        aria-label={label}
        placeholder={`${label}…`}
        value={query}
        onKeyDown={onKeyDown}
        onChange={(e) => onQueryChange(e.target.value)}
        className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
      />
      {query && (
        <button
          type="button"
          aria-label="Cancella ricerca"
          onClick={() => onQueryChange("")}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
