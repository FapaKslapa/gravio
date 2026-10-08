import { BarChart3, CheckSquare, CreditCard, Home, Users } from "lucide-react";

export const NAV_LINKS = [
  { label: "Panoramica", short: "Home", href: "/", icon: Home },
  {
    label: "Transazioni",
    short: "Spese",
    href: "/transactions",
    icon: CreditCard,
  },
  { label: "Liste Spesa", short: "Liste", href: "/todos", icon: CheckSquare },
  { label: "Statistiche", short: "Stats", href: "/analytics", icon: BarChart3 },
  { label: "Amici", short: "Amici", href: "/friends", icon: Users },
] as const;

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
