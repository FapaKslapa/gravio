import { Clock } from "lucide-react";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { ItemIcon, itemClass } from "./item-icon";
import { clearRecent } from "./palette-utils";

export function RecentGroup({
  recent,
  onPick,
  onClear,
}: {
  recent: string[];
  onPick: (term: string) => void;
  onClear: () => void;
}) {
  return (
    <CommandGroup heading="Ricerche recenti">
      {recent.map((term) => (
        <CommandItem
          key={term}
          value={`recent-${term}`}
          onSelect={() => onPick(term)}
          className={itemClass}
        >
          <ItemIcon icon={Clock} />
          <span className="truncate">{term}</span>
        </CommandItem>
      ))}
      <CommandItem
        value="recent-clear"
        onSelect={() => {
          clearRecent();
          onClear();
        }}
        className={cn(itemClass, "text-muted-foreground")}
      >
        <span className="pl-11 text-xs">Cancella cronologia</span>
      </CommandItem>
    </CommandGroup>
  );
}
