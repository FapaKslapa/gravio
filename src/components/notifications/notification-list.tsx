import dayjs from "dayjs";
import { BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationsState } from "./use-notifications";

export function NotificationList({
  state,
  onNavigate,
}: {
  state: NotificationsState;
  onNavigate: (link: string) => void;
}) {
  const {
    notifications,
    unreadCount,
    markReadMutation,
    markAllReadMutation,
    deleteMutation,
    deleteAllMutation,
  } = state;

  return (
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
                  if (n.link) onNavigate(n.link);
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
}
