"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api/api-client";
import { logger } from "@/lib/logger";

const VAPID_PUBLIC_KEY_ENDPOINT = "/api/push/vapid-public-key";
const SUBSCRIBE_ENDPOINT = "/api/push/subscribe";
const UNSUBSCRIBE_ENDPOINT = "/api/push/unsubscribe";

export interface UsePushSubscriptionResult {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  loading: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

/**
 * usePushSubscription registers the current browser for Web Push notifications
 * and persists the subscription on the backend so the server can deliver real
 * push messages via VAPID.
 */
export function usePushSubscription(): UsePushSubscriptionResult {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const getRegistration = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (registrationRef.current) return registrationRef.current;
    if (!("serviceWorker" in navigator)) return null;

    let reg = await navigator.serviceWorker.getRegistration("/");
    if (!reg) {
      // The service worker may still be installing/activating (it's often
      // registered on a delayed timer). Wait for it to become ready instead
      // of giving up immediately, with a timeout so we don't hang forever
      // when no service worker is registered at all.
      try {
        reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<ServiceWorkerRegistration | null>((resolve) =>
            setTimeout(() => resolve(null), 5000)
          ),
        ]);
      } catch {
        reg = null;
      }
    }

    registrationRef.current = reg ?? null;
    return reg ?? null;
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    setLoading(true);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== "granted") {
        return false;
      }

      const reg = await getRegistration();
      if (!reg) {
        logger.warn("No active service worker registration for push subscription");
        return false;
      }

      // Reuse an existing subscription if present.
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        const res = await apiClient.fetch(VAPID_PUBLIC_KEY_ENDPOINT);
        if (!res.ok) {
          logger.error("Failed to fetch VAPID public key");
          return false;
        }
        const { publicKey } = (await res.json()) as { publicKey: string };
        if (!publicKey) {
          logger.error("VAPID public key is empty");
          return false;
        }

        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
        });
      }

      const p256dh = subscription.getKey("p256dh")
        ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!)))
        : "";
      const auth = subscription.getKey("auth")
        ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!)))
        : "";

      const saveRes = await apiClient.fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh,
          auth,
          platform: "web",
          provider: "webpush",
          userAgent: navigator.userAgent,
        }),
      });

      if (!saveRes.ok) {
        logger.error("Failed to save push subscription on server");
        return false;
      }

      setSubscribed(true);
      return true;
    } catch (error) {
      logger.error("Push subscription failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getRegistration]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const reg = await getRegistration();
      if (reg) {
        const subscription = await reg.pushManager.getSubscription();
        if (subscription) {
          await apiClient.fetch(UNSUBSCRIBE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
          await subscription.unsubscribe();
        }
      }
      setSubscribed(false);
    } catch (error) {
      logger.error("Push unsubscribe failed:", error);
    } finally {
      setLoading(false);
    }
  }, [getRegistration]);

  // Keep `subscribed` state in sync with the actual push subscription.
  useEffect(() => {
    if (!supported) return;
    let active = true;
    (async () => {
      const reg = await getRegistration();
      if (!reg || !active) return;
      const sub = await reg.pushManager.getSubscription();
      if (active) setSubscribed(!!sub && Notification.permission === "granted");
    })();
    return () => {
      active = false;
    };
  }, [supported, getRegistration]);

  return { supported, permission, subscribed, loading, subscribe, unsubscribe };
}
