import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { showSystemNotification } from "./show-system-notification";

export function useNotifications() {
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
    trpc.notification.markRead.mutationOptions({ onSuccess: refetch }),
  );
  const markAllReadMutation = useMutation(
    trpc.notification.markAllRead.mutationOptions({ onSuccess: refetch }),
  );
  const deleteMutation = useMutation(
    trpc.notification.delete.mutationOptions({ onSuccess: refetch }),
  );
  const deleteAllMutation = useMutation(
    trpc.notification.deleteAll.mutationOptions({ onSuccess: refetch }),
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
            for (const n of newUnread) showSystemNotification(n);
          }
        }
        prevIds.current = currentIds;
      }
    }
  }, [notificationsData, isNotificationsSuccess]);

  return {
    notifications,
    unreadCount,
    markReadMutation,
    markAllReadMutation,
    deleteMutation,
    deleteAllMutation,
  };
}

export type NotificationsState = ReturnType<typeof useNotifications>;
