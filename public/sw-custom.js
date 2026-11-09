// ===========================================================================
// DoneRight PWA — Custom Service Worker Extensions
// Handles notificationclick to bring the PWA to foreground or open window
// ===========================================================================

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        // 1. If an existing app window is open, focus it and navigate if needed
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if ("focus" in client) {
            if ("navigate" in client && targetUrl) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        // 2. If no window is currently open, open a new window to targetUrl
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

