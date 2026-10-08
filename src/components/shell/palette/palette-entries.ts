import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CheckSquare,
  CreditCard,
  FileUp,
  Home,
  ListPlus,
  type LucideIcon,
  ScanLine,
  Settings,
  Users,
} from "lucide-react";
import { matches } from "./palette-utils";

export type Entry = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  keywords?: string;
};

export const ACTIONS: Entry[] = [
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

export const PAGES: Entry[] = [
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

export function filterEntries(entries: Entry[], q: string) {
  if (!q) return entries;
  return entries.filter((e) => matches(`${e.label} ${e.keywords ?? ""}`, q));
}
