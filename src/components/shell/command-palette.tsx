"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CheckSquare,
  Clock,
  CreditCard,
  FileUp,
  Home,
  ListPlus,
  type LucideIcon,
  ScanLine,
  Search,
  SearchX,
  Settings,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTRPC } from "@/lib/trpc/client";
import { cn, formatCurrency } from "@/lib/utils";

type CommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

const RECENT_KEY = "gravio:recent-searches";
const MAX_RECENT = 5;
const MAX_TX = 8;
const MAX_PEOPLE = 4;

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function writeRecent(term: string) {
  try {
    const next = [term, ...readRecent().filter((t) => t !== term)].slice(
      0,
      MAX_RECENT,
    );
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function clearRecent() {
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {}
}

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function matches(text: string, q: string) {
  return norm(text).includes(norm(q));
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = norm(text).indexOf(norm(q));
  if (idx < 0 || norm(text).length !== text.length) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-xs bg-brand-soft text-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

type Entry = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  keywords?: string;
};

const ACTIONS: Entry[] = [
  {
    id: "new-expense",
    label: "Nuova spesa",
    href: "/transactions?new=expense",
    icon: ArrowUpRight,
    keywords: "aggiungi registra uscita",
  },
  {
    id: "new-income",
    label: "Nuova entrata",
    href: "/transactions?new=income",
    icon: ArrowDownLeft,
    keywords: "aggiungi registra guadagno stipendio",
  },
  {
    id: "scan-receipt",
    label: "Scansiona scontrino",
    href: "/transactions?scan=1",
    icon: ScanLine,
    keywords: "foto ricevuta fotocamera ocr",
  },
  {
    id: "import",
    label: "Importa estratto conto",
    href: "/transactions?import=1",
    icon: FileUp,
    keywords: "csv xlsx pdf banca carica",
  },
  {
    id: "new-list",
    label: "Nuova lista",
    href: "/todos?newList=1",
    icon: ListPlus,
    keywords: "spesa lista crea",
  },
];

const PAGES: Entry[] = [
  { id: "p-home", label: "Panoramica", href: "/", icon: Home },
  {
    id: "p-tx",
    label: "Transazioni",
    href: "/transactions",
    icon: CreditCard,
    keywords: "spese entrate",
  },
  { id: "p-todos", label: "Liste", href: "/todos", icon: CheckSquare },
  {
    id: "p-stats",
    label: "Statistiche",
    href: "/analytics",
    icon: BarChart3,
    keywords: "analytics grafici",
  },
  { id: "p-friends", label: "Amici", href: "/friends", icon: Users },
  {
    id: "p-settings",
    label: "Impostazioni",
    href: "/settings",
    icon: Settings,
    keywords: "tema valuta account",
  },
];

function filterEntries(entries: Entry[], q: string) {
  if (!q) return entries;
  return entries.filter((e) => matches(`${e.label} ${e.keywords ?? ""}`, q));
}

function ItemIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}

const itemClass = "min-h-12 gap-3 px-2 py-2 md:min-h-11";

function PaletteBody({
  onClose,
  mobile,
}: {
  onClose: () => void;
  mobile: boolean;
}) {
  const router = useRouter();
  const trpc = useTRPC();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const debounced = useDebounced(query.trim(), 150);
  const hasQuery = debounced.length > 0;

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  const numeric = /^[\d.,\s]+$/.test(debounced);
  const numericValue = Number(debounced.replace(/\s/g, "").replace(",", "."));

  const categoriesQuery = useQuery({
    ...trpc.category.list.queryOptions(),
    staleTime: 60_000,
  });
  const friendsQuery = useQuery({
    ...trpc.friend.listFriends.queryOptions(),
    staleTime: 60_000,
  });
  const listsQuery = useQuery({
    ...trpc.todo.listLists.queryOptions(),
    staleTime: 60_000,
  });

  const matchedCategories = useMemo(
    () =>
      hasQuery && !numeric
        ? (categoriesQuery.data ?? []).filter((c) => matches(c.name, debounced))
        : [],
    [categoriesQuery.data, debounced, hasQuery, numeric],
  );
  const categoryMap = useMemo(
    () => new Map((categoriesQuery.data ?? []).map((c) => [c.id, c])),
    [categoriesQuery.data],
  );

  const byText = useQuery({
    ...trpc.transaction.listPaginated.queryOptions({
      search: debounced,
      limit: MAX_TX,
    }),
    enabled: hasQuery && !numeric,
    placeholderData: (prev) => prev,
  });
  const byCategory = useQuery({
    ...trpc.transaction.listPaginated.queryOptions({
      categoryId: matchedCategories[0]?.id,
      limit: MAX_TX,
    }),
    enabled: matchedCategories.length > 0,
    placeholderData: (prev) => prev,
  });
  const byAmount = useQuery({
    ...trpc.transaction.listPaginated.queryOptions({ limit: 100 }),
    enabled: hasQuery && numeric && Number.isFinite(numericValue),
    staleTime: 30_000,
  });

  const transactions = useMemo(() => {
    if (!hasQuery) return [];
    const pool = numeric
      ? (byAmount.data?.items ?? []).filter((t) =>
          String(Number(t.amount)).includes(String(numericValue)),
        )
      : [...(byText.data?.items ?? []), ...(byCategory.data?.items ?? [])];
    const seen = new Set<string>();
    return pool
      .filter((t) => (seen.has(t.id) ? false : seen.add(t.id)))
      .slice(0, MAX_TX);
  }, [
    hasQuery,
    numeric,
    numericValue,
    byAmount.data,
    byText.data,
    byCategory.data,
  ]);

  const actions = filterEntries(ACTIONS, debounced);
  const pages = filterEntries(PAGES, debounced);
  const friends = hasQuery
    ? (friendsQuery.data ?? [])
        .filter((f) => matches(f.user.name ?? "", debounced))
        .slice(0, MAX_PEOPLE)
    : [];
  const lists = hasQuery
    ? (listsQuery.data ?? [])
        .filter((l) => matches(l.name, debounced))
        .slice(0, MAX_PEOPLE)
    : [];

  const loading =
    hasQuery &&
    (byText.isFetching || byCategory.isFetching || byAmount.isFetching);
  const total =
    actions.length +
    pages.length +
    transactions.length +
    friends.length +
    lists.length;

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
          // biome-ignore lint/a11y/noAutofocus: la palette si apre per scrivere subito
          autoFocus
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
          <CommandGroup heading="Ricerche recenti">
            {recent.map((term) => (
              <CommandItem
                key={term}
                value={`recent-${term}`}
                onSelect={() => setQuery(term)}
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
                setRecent([]);
              }}
              className={cn(itemClass, "text-muted-foreground")}
            >
              <span className="pl-11 text-xs">Cancella cronologia</span>
            </CommandItem>
          </CommandGroup>
        )}

        {actions.length > 0 && (
          <CommandGroup heading="Azioni rapide">
            {actions.map((a) => (
              <CommandItem
                key={a.id}
                value={a.id}
                onSelect={() => go(a.href)}
                className={itemClass}
              >
                <ItemIcon icon={a.icon} />
                <span className="truncate">
                  <Highlight text={a.label} query={debounced} />
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {transactions.length > 0 && (
          <CommandGroup heading="Transazioni">
            {transactions.map((t) => {
              const cat = t.categoryId ? categoryMap.get(t.categoryId) : null;
              const isIncome = t.type === "income";
              return (
                <CommandItem
                  key={t.id}
                  value={`tx-${t.id}`}
                  onSelect={() =>
                    go(
                      `/transactions?q=${encodeURIComponent(t.description ?? "")}`,
                    )
                  }
                  className={itemClass}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: cat?.color ?? "currentColor" }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">
                      <Highlight text={t.description ?? ""} query={debounced} />
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {cat ? (
                        <Highlight text={cat.name} query={debounced} />
                      ) : (
                        "Senza categoria"
                      )}
                      {" · "}
                      {new Date(t.date).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "tabular shrink-0 text-sm font-medium",
                      isIncome ? "text-income" : "text-expense",
                    )}
                  >
                    <span className="sr-only">
                      {isIncome ? "Entrata " : "Spesa "}
                    </span>
                    {isIncome ? "+" : "-"}
                    {formatCurrency(Number(t.amount), t.currency)}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {friends.length > 0 && (
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
                  <Highlight text={f.user.name ?? ""} query={debounced} />
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {lists.length > 0 && (
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
                  <Highlight text={l.name} query={debounced} />
                </span>
                <span className="tabular text-xs text-muted-foreground">
                  {l.activeCount}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {pages.length > 0 && (
          <CommandGroup heading="Pagine">
            {pages.map((p) => (
              <CommandItem
                key={p.id}
                value={p.id}
                onSelect={() => go(p.href)}
                className={itemClass}
              >
                <ItemIcon icon={p.icon} />
                <span className="truncate">
                  <Highlight text={p.label} query={debounced} />
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

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

function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[96dvh] max-h-[96dvh]">
          <DrawerTitle className="sr-only">Cerca</DrawerTitle>
          {open && <PaletteBody onClose={close} mobile />}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="top-[18%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">Cerca</DialogTitle>
        {open && <PaletteBody onClose={close} mobile={false} />}
      </DialogContent>
    </Dialog>
  );
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  );
}

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
