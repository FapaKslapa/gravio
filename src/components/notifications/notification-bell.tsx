"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Bell, BellOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  className?: string;
};

export function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const trpc = useTRPC();

  const {
    data: notificationsData,
    isSuccess: isNotificationsSuccess,
    refetch: refetchNotifications,
  } = useQuery(
    trpc.notification.list.queryOptions(undefined, {
      refetchInterval: 15 * 1000,
    }),
  );

  const refetch = () => refetchNotifications();

  const markReadMutation = useMutation(
    trpc.notification.markRead.mutationOptions({
      onSuccess: refetch,
    }),
  );
  const markAllReadMutation = useMutation(
    trpc.notification.markAllRead.mutationOptions({
      onSuccess: refetch,
    }),
  );
  const deleteMutation = useMutation(
    trpc.notification.delete.mutationOptions({
      onSuccess: refetch,
    }),
  );
  const deleteAllMutation = useMutation(
    trpc.notification.deleteAll.mutationOptions({
      onSuccess: refetch,
    }),
  );

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const prevIds = useRef<string[]>([]);

  useEffect(() => {
    if (isNotificationsSuccess && notificationsData) {
      const currentIds = notificationsData.map((n) => n.id);
      const isDifferent =
        currentIds.length !== prevIds.current.length ||
        currentIds.some((id, index) => id !== prevIds.current[index]);

      if (isDifferent) {
        if (prevIds.current.length > 0) {
          const prevIdsSet = new Set(prevIds.current);
          const newUnread = notificationsData.filter(
            (n) => !n.read && !prevIdsSet.has(n.id),
          );

          if (
            newUnread.length > 0 &&
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            for (const n of newUnread) {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready
                  .then((reg) => {
                    reg.showNotification(n.title, {
                      body: n.message,
                      icon: "/icon-192.png",
                      badge: "/favicon-32.png",
                      data: { link: n.link || "/" },
                      vibrate: [100, 50, 100],
                    } as unknown as NotificationOptions & {
                      vibrate?: number[];
                    });
                  })
                  .catch(() => {
                    new Notification(n.title, {
                      body: n.message,
                      icon: "/icon-192.png",
                    });
                  });
              } else {
                new Notification(n.title, {
                  body: n.message,
                  icon: "/icon-192.png",
                });
              }
            }
          }
        }
        prevIds.current = currentIds;
      }
    }
  }, [notificationsData, isNotificationsSuccess]);

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
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
            >
              Segna lette
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => deleteAllMutation.mutate()}
            >
              Elimina tutte
            </Button>
          )}
        </div>
      </div>
      <div className="max-h-[60dvh] overflow-y-auto md:max-h-80">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-muted-foreground">
            <BellOff className="size-6 opacity-50" aria-hidden />
            <span className="text-sm font-medium">Nessuna notifica</span>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "group flex items-start gap-2 border-t px-4 py-3 transition-colors",
                n.read ? "opacity-70 hover:opacity-100" : "bg-brand-soft/50",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  if (!n.read) markReadMutation.mutate({ id: n.id });
                  if (n.link) {
                    setIsOpen(false);
                    router.push(n.link);
                  }
                }}
                className="flex min-w-0 flex-1 flex-col gap-1 text-left"
              >
                <span className="text-sm font-semibold leading-tight">
                  {n.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {n.message}
                </span>
                <span className="text-xs text-muted-foreground tabular">
                  {dayjs(n.createdAt).format("DD MMM, HH:mm")}
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                {!n.read && (
                  <span
                    className="size-2 rounded-full bg-brand"
                    role="img"
                    aria-label="Non letta"
                  />
                )}
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate({ id: n.id })}
                  aria-label="Elimina notifica"
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
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
