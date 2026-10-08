"use client";

import { m } from "framer-motion";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { isActivePath, NAV_LINKS } from "./nav-links";

type SidebarProps = {
  currency: string;
  userName: string;
};

export function Sidebar({ currency, userName }: SidebarProps) {
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/settings");

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[72px] xl:w-64 flex-col gap-6 border-r bg-card/80 backdrop-blur-md p-3 xl:p-4">
      <Link
        href="/"
        className="flex items-center gap-3 px-1.5 py-2 xl:px-2"
        aria-label="Gravio"
      >
        <Image
          src="/logo.png"
          alt=""
          width={36}
          height={36}
          className="rounded-xl"
        />
        <span className="hidden xl:block font-display text-xl font-bold tracking-tight">
          Gravio
        </span>
      </Link>

      <nav aria-label="Navigazione principale" className="flex-1">
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      aria-label={link.label}
                      className={cn(
                        "relative flex h-12 items-center justify-center xl:justify-start gap-3 rounded-2xl px-0 xl:px-4 text-sm font-semibold transition-colors",
                        active
                          ? "text-brand-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {active && (
                        <m.span
                          layoutId="sidebar-pill"
                          transition={springs.smooth}
                          className="absolute inset-0 rounded-2xl bg-brand"
                        />
                      )}
                      <Icon className="relative size-5 shrink-0" aria-hidden />
                      <span className="relative hidden xl:block">
                        {link.label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="xl:hidden">
                    {link.label}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col items-center xl:items-stretch gap-2">
        <div className="flex items-center justify-center xl:justify-between gap-2">
          <span className="hidden xl:block text-xs font-semibold text-muted-foreground tabular">
            Valuta · {currency}
          </span>
          <NotificationBell />
        </div>
        <Link
          href="/settings"
          aria-current={settingsActive ? "page" : undefined}
          className={cn(
            "flex h-12 items-center justify-center xl:justify-start gap-3 rounded-2xl px-0 xl:px-4 text-sm font-semibold transition-colors",
            settingsActive
              ? "bg-brand-soft text-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Settings className="size-5 shrink-0" aria-hidden />
          <span className="hidden xl:block truncate">{userName}</span>
          <span className="sr-only xl:hidden">Impostazioni</span>
        </Link>
      </div>
    </aside>
  );
}
