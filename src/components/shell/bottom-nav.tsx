"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { isActivePath, NAV_LINKS } from "./nav-links";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigazione principale"
      className="md:hidden fixed inset-x-4 z-40 bottom-[max(1rem,env(safe-area-inset-bottom))] rounded-full bg-card/95 backdrop-blur-md elevation-2"
    >
      <ul className="flex items-center justify-between gap-1 p-1.5">
        {NAV_LINKS.map((link) => {
          const active = isActivePath(pathname, link.href);
          const Icon = link.icon;
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors active:scale-[0.97]",
                  active
                    ? "text-brand-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <m.span
                    layoutId="bottom-nav-pill"
                    transition={springs.smooth}
                    className="absolute inset-0 rounded-full bg-brand"
                  />
                )}
                <m.span
                  key={active ? "on" : "off"}
                  animate={active ? { scale: [1, 1.15, 1] } : undefined}
                  transition={{ duration: 0.32 }}
                  className="relative"
                >
                  <Icon className="size-[18px]" aria-hidden />
                </m.span>
                <span className="relative">{link.short}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
