import { Search, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Command, CommandList } from "@/components/ui/command";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { EntryGroup, FriendsGroup, ListsGroup } from "./palette-groups";
import { readRecent, useDebounced, writeRecent } from "./palette-utils";
import { RecentGroup } from "./recent-group";
import { TransactionsGroup } from "./transactions-group";
import { usePaletteSearch } from "./use-palette-search";

export function PaletteBody({
  onClose,
  mobile,
}: {
  onClose: () => void;
  mobile: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(readRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounced(query.trim(), 150);
  const search = usePaletteSearch(debounced);
  const { hasQuery, total, loading } = search;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const go = useCallback(
    (href: string) => {
      if (debounced.length >= 2) writeRecent(debounced);
      onClose();
      router.push(href);
    },
    [debounced, onClose, router],
  );

  return (
    <Command
      shouldFilter={false}
      loop
      label="Ricerca globale"
      className={cn("rounded-none! bg-transparent p-0", mobile && "min-h-0")}
    >
      <div className="flex items-center gap-2 border-b px-3">
        <Search
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca spese, amici, liste o azioni"
          aria-label="Cerca"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="h-14 min-w-0 flex-1 bg-transparent text-base outline-hidden placeholder:text-muted-foreground md:h-12 md:text-sm [&::-webkit-search-cancel-button]:hidden"
          onKeyDown={(e) => {
            if (e.key === "Escape" && query) {
              e.stopPropagation();
              setQuery("");
            }
          }}
        />
        <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground md:inline">
          Esc
        </kbd>
      </div>
      <CommandList
        className={cn(
          "px-1 py-1 no-scrollbar",
          mobile
            ? "max-h-none flex-1 pb-[max(1rem,env(safe-area-inset-bottom))]"
            : "max-h-[min(26rem,60dvh)]",
        )}
      >
        {!hasQuery && recent.length > 0 && (
          <RecentGroup
            recent={recent}
            onPick={setQuery}
            onClear={() => setRecent([])}
          />
        )}
        <EntryGroup
          heading="Azioni rapide"
          entries={search.actions}
          go={go}
          query={debounced}
        />
        <TransactionsGroup
          transactions={search.transactions}
          categoryMap={search.categoryMap}
          go={go}
          query={debounced}
        />
        <FriendsGroup friends={search.friends} go={go} query={debounced} />
        <ListsGroup lists={search.lists} go={go} query={debounced} />
        <EntryGroup
          heading="Pagine"
          entries={search.pages}
          go={go}
          query={debounced}
        />

        {hasQuery && total === 0 && !loading && (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Nessun risultato</EmptyTitle>
              <EmptyDescription>
                Niente corrisponde a &ldquo;{debounced}&rdquo;. Prova con
                un&apos;altra parola, una categoria o un importo.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        <div className="sr-only" aria-live="polite">
          {hasQuery && !loading ? `${total} risultati` : ""}
        </div>
      </CommandList>
    </Command>
  );
}
