"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { NotificationList } from "./notification-list";
import { useNotifications } from "./use-notifications";

type NotificationBellProps = {
  className?: string;
};

export function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const state = useNotifications();
  const { unreadCount } = state;

  const trigger = (
    <button
      type="button"
      onClick={isMobile ? () => setIsOpen(true) : undefined}
      className="relative flex size-11 items-center justify-center rounded-full border bg-card transition-colors hover:bg-accent active:scale-[0.97] md:size-10"
      aria-label={
        unreadCount > 0 ? `Notifiche, ${unreadCount} da leggere` : "Notifiche"
      }
    >
      <Bell className="size-[18px]" aria-hidden />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-expense px-1 text-[11px] font-bold leading-none text-white tabular">
          {unreadCount}
        </span>
      )}
    </button>
  );

  const list = (
    <NotificationList
      state={state}
      onNavigate={(link) => {
        setIsOpen(false);
        router.push(link);
      }}
    />
  );

  if (isMobile) {
    return (
      <div className={className}>
        {trigger}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Notifiche</DrawerTitle>
              <DrawerDescription className="sr-only">
                Le tue notifiche recenti
              </DrawerDescription>
            </DrawerHeader>
            <div className="pb-[max(1rem,env(safe-area-inset-bottom))]">
              {list}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-0">
          <div className="px-4 pt-3 text-sm font-semibold">Notifiche</div>
          {list}
        </PopoverContent>
      </Popover>
    </div>
  );
}
