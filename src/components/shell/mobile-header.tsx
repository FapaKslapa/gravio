"use client";

import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CommandPaletteTrigger } from "./command-palette";

export function MobileHeader({ currency }: { currency: string }) {
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/settings");

  return (
    <header className="md:hidden fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-background/85 backdrop-blur-md px-4 pt-[env(safe-area-inset-top)] box-content">
      <Link href="/" className="flex items-center gap-2" aria-label="Gravio">
        <Image
          src="/logo.png"
          alt=""
          width={28}
          height={28}
          className="rounded-lg"
        />
        <span className="font-display text-lg font-bold tracking-tight">
          Gravio
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="tabular">
          {currency}
        </Badge>
        <CommandPaletteTrigger variant="icon" />
        <NotificationBell />
        <Link
          href="/settings"
          aria-label="Impostazioni"
          aria-current={settingsActive ? "page" : undefined}
          className={cn(
            "flex size-11 items-center justify-center rounded-full transition-colors active:scale-[0.97]",
            settingsActive
              ? "bg-brand text-brand-foreground"
              : "hover:bg-accent",
          )}
        >
          <Settings className="size-5" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
