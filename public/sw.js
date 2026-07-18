/* Tolo Platform Service Worker
 * Handles Web Push notifications (VAPID) and basic offline caching.
 */

const CACHE_PREFIX = "tolo-app";
const CACHE_VERSION = "v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== `${CACHE_PREFIX}-${CACHE_VERSION}`)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Receive a push message from the server and display a notification.
self.addEventListener("push", (event) => {
  let payload = { title: "Tolo Platform", body: "لديك إشعار جديد", data: {} };

  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = {
        title: parsed.title || payload.title,
        body: parsed.body || parsed.message || payload.body,
        data: parsed.data || {},
      };
    }
  } catch (e) {
    payload.body = event.data ? event.data.text() : payload.body;
  }

  const actions = [];
  if (payload.data && payload.data.link) {
    actions.push({ action: "open", title: "فتح" });
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/logo-tolo.jpg",
      badge: "/logo-tolo.jpg",
      tag: payload.data && payload.data.id ? String(payload.data.id) : undefined,
      data: payload.data || {},
      actions,
      requireInteraction: false,
    })
  );
});

// Handle notification click: focus or open the relevant page.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl =
    (data.link && String(data.link).startsWith("http")) ||
    (data.link && String(data.link).startsWith("/"))
      ? data.link
      : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Cache-first strategy for same-origin GET navigation requests (offline support).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/") || Response.error())
    );
    return;
  }
  event.respondWith(
    caches.open(`${CACHE_PREFIX}-${CACHE_VERSION}`).then((cache) =>
      cache.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
      )
    )
  );
});

// Allow the page to trigger cache cleanup.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  }
});
