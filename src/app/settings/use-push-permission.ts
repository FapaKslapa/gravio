import { useCallback, useState, useSyncExternalStore } from "react";

export function usePushPermission() {
  const [_permissionVersion, setPermissionVersion] = useState(0);
  // Read Notification.permission on demand; permissionVersion bump triggers re-read
  const pushNotificationPermission = useSyncExternalStore<
    NotificationPermission | "unsupported" | "default"
  >(
    () => () => {},
    () => {
      // eslint-disable-next-line no-unused-expressions
      _permissionVersion; // tracked so a state bump re-evaluates this
      if (!("Notification" in window)) return "unsupported";
      return Notification.permission;
    },
    () => "default",
  );
  const handlePermissionChange = useCallback(() => {
    setPermissionVersion((v) => v + 1);
  }, []);

  return { pushNotificationPermission, handlePermissionChange };
}
