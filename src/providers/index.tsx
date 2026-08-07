'use client';

import React, { Suspense, useState, lazy } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { SettingsProvider } from '@/contexts/settings-context';
import ClientLayoutProvider from '@/providers/client-layout-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '@/components/error-boundary';
import { HydrationFix } from '@/components/hydration-fix';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import { PerformanceProvider } from '@/components/providers/PerformanceProvider';
import { ReactQueryPersistence } from '@/providers/react-query-persistence';
import { PERFORMANCE_DEFAULTS } from '@/lib/performance-config';

const WebSocketProvider = lazy(() =>
  import('@/contexts/websocket-context').then(mod => ({ default: mod.WebSocketProvider }))
);

const NotificationsProvider = lazy(() =>
  import('@/providers/notifications-provider').then(mod => ({ default: mod.NotificationsProvider }))
);

const TooltipProvider = lazy(() =>
  import('@/components/ui/tooltip').then(mod => ({ default: mod.TooltipProvider }))
);

const Toaster = lazy(() =>
  import('sonner').then(mod => ({ default: mod.Toaster }))
);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: PERFORMANCE_DEFAULTS.queryStaleTimeMs,
        gcTime: PERFORMANCE_DEFAULTS.queryGcTimeMs,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        placeholderData: (previousData: unknown) => previousData,
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
      },
    },
  });
}

type GlobalProvidersProps = {
  children: React.ReactNode;
  initialAuthHint?: boolean;
};

export function GlobalProviders({ children, initialAuthHint }: GlobalProvidersProps) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <ErrorBoundary variant="global">
      <Suspense fallback={null}>
        <SettingsProvider>
          <ClientLayoutProvider>
            <HydrationFix />
            <QueryClientProvider client={queryClient}>
              <ReactQueryPersistence />
              <AuthProvider initialAuthHint={initialAuthHint}>
                <WebSocketProvider>
                  <NotificationsProvider>
                    <TooltipProvider>
                      <LazyMotion features={domAnimation} strict>
                        <MotionConfig reducedMotion="always">
                          <PerformanceProvider>
                            {children}
                          </PerformanceProvider>
                        </MotionConfig>
                      </LazyMotion>
                      <Toaster richColors closeButton position="top-center" />
                    </TooltipProvider>
                  </NotificationsProvider>
                </WebSocketProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ClientLayoutProvider>
        </SettingsProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
