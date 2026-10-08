import { CheckSquare, Users } from "lucide-react";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { Highlight } from "./highlight";
import { ItemIcon, itemClass } from "./item-icon";
import type { Entry } from "./palette-entries";
import type { PaletteSearch } from "./use-palette-search";

type GoProps = { go: (href: string) => void; query: string };

export function EntryGroup({
  heading,
  entries,
  go,
  query,
}: GoProps & { heading: string; entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <CommandGroup heading={heading}>
      {entries.map((e) => (
        <CommandItem
          key={e.id}
          value={e.id}
          onSelect={() => go(e.href)}
          className={itemClass}
        >
          <ItemIcon icon={e.icon} />
          <span className="truncate">
            <Highlight text={e.label} query={query} />
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export function FriendsGroup({
  friends,
  go,
  query,
}: GoProps & { friends: PaletteSearch["friends"] }) {
  if (friends.length === 0) return null;
  return (
    <CommandGroup heading="Amici">
      {friends.map((f) => (
        <CommandItem
          key={f.friendshipId}
          value={`friend-${f.friendshipId}`}
          onSelect={() => go(`/friends?friend=${f.user.id}`)}
          className={itemClass}
        >
          <ItemIcon icon={Users} />
          <span className="truncate">
            <Highlight text={f.user.name ?? ""} query={query} />
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export function ListsGroup({
  lists,
  go,
  query,
}: GoProps & { lists: PaletteSearch["lists"] }) {
  if (lists.length === 0) return null;
  return (
    <CommandGroup heading="Liste">
      {lists.map((l) => (
        <CommandItem
          key={l.id}
          value={`list-${l.id}`}
          onSelect={() => go(`/todos?list=${l.id}`)}
          className={itemClass}
        >
          <ItemIcon icon={CheckSquare} />
          <span className="flex-1 truncate">
            <Highlight text={l.name} query={query} />
          </span>
          <span className="tabular text-xs text-muted-foreground">
            {l.activeCount}
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
