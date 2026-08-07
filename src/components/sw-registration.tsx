"use client";

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/service-worker';
import { usePushSubscription } from '@/hooks/use-push-subscription';
import { logger } from '@/lib/logger';

export function SWRegistration() {
  const { supported, permission, subscribe } = usePushSubscription();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    registerServiceWorker().catch(() => {
      // Silently fail in production
    });
  }, []);

  useEffect(() => {
    if (!supported || permission !== 'granted') return;
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        subscribe().catch((err) => logger.debug("Auto push subscribe skipped:", err));
      }
    }, 1500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [supported, permission, subscribe]);

  return null;
}
