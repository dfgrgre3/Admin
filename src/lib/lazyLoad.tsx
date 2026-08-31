import dynamic from "next/dynamic";
import React from "react";

// Utility function for lazy loading components with loading skeletons
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  _loadingComponent?: React.ComponentType<{}>,
  options?: {
    ssr?: boolean;
  }
) {
  const { ssr = true } = options || {};
  
  return dynamic(importFn, {
    ssr,
  });
}

// Pre-configured lazy load wrappers for common components
export const lazy = {
  // Layout components - no SSR needed as they're client-side only
  AdminSidebar: () => import("@/components/admin/layout/admin-sidebar").then(m => ({ default: m.AdminSidebar })),
  AdminHeader: () => import("@/components/admin/layout/admin-header").then(m => ({ default: m.AdminHeader })),
  CommandPalette: () => import("@/components/admin/ui/command-palette").then(m => ({ default: m.CommandPalette })),
  
  // Heavy chart libraries - load only when needed
  Recharts: () => import("recharts"),
  
  // UI Components
  Dialog: () => import("@/components/ui/dialog").then(m => ({ default: m.Dialog })),
  Select: () => import("@/components/ui/select").then(m => ({ default: m.Select })),
  
  // Admin pages - lazy load on demand
  UsersPage: () => import("@/app/(admin)/admin/users/page"),
  CoursesPage: () => import("@/app/(admin)/admin/courses/page"),
  RevenuePage: () => import("@/app/(admin)/admin/revenue/page"),
  ReportsPage: () => import("@/app/(admin)/admin/reports/page"),
  AnalyticsPage: () => import("@/app/(admin)/admin/learning-analytics/page"),
  AIPage: () => import("@/app/(admin)/admin/ai/page"),
  AIAssistantsPage: () => import("@/app/(admin)/admin/ai/assistants/page"),
  AIContentReviewPage: () => import("@/app/(admin)/admin/ai/content-review/page"),
  AILogsPage: () => import("@/app/(admin)/admin/ai/logs/page"),
  AIModerationPage: () => import("@/app/(admin)/admin/ai/moderation/page"),
  LiveSessionsPage: () => import("@/app/(admin)/admin/live-sessions/page"),
  AnnouncementsPage: () => import("@/app/(admin)/admin/announcements/page"),
  PlansPage: () => import("@/app/(admin)/admin/plans/page"),
  RewardsPage: () => import("@/app/(admin)/admin/rewards/page"),
  AffiliatesPage: () => import("@/app/(admin)/admin/affiliates/page"),
  CertificatesPage: () => import("@/app/(admin)/admin/certificates/page"),
  DunningPage: () => import("@/app/(admin)/admin/dunning/page"),
};

// Preload critical components
export function preloadCriticalComponents() {
  if (typeof window !== "undefined") {
    // Preload components that are likely to be needed
    setTimeout(() => {
      lazy.AdminSidebar();
      lazy.AdminHeader();
    }, 100);
  }
}

// Intersection Observer hook for lazy loading on scroll
export function useLazyLoad(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, {
      rootMargin: "100px",
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}