type NotificationItem = {
  title: string;
  message: string;
  link?: string | null;
};

export function showSystemNotification(n: NotificationItem) {
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
