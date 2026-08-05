"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AdminPageAccessGate } from "@/components/admin/admin-page-access-gate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ── Dynamic (code-split) layout components ──────────────────────────────────
// All three are loaded in separate chunks and only fetched after the main
// page content has been painted. Each has its own lightweight skeleton so the
// shell has zero waiting cost.

const AdminSidebar = dynamic(
  () => import("@/components/admin/layout/admin-sidebar").then((m) => m.AdminSidebar),
  {
    ssr: false,
    loading: () => (
      <aside className="hidden h-screen w-[260px] border-l border-border bg-card/50 lg:block">
        <div className="flex h-full animate-pulse flex-col gap-4 p-4">
          <div className="h-10 w-10 rounded-xl bg-muted/30" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-full rounded-lg bg-muted/20" />
            ))}
          </div>
        </div>
      </aside>
    ),
  },
);

const AdminHeader = dynamic(
  () => import("@/components/admin/layout/admin-header").then((m) => m.AdminHeader),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6 animate-pulse bg-muted/10">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-muted/30" />
          <div className="h-8 w-8 rounded-lg bg-muted/30 lg:hidden" />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <div className="h-9 w-64 rounded-lg bg-muted/20" />
          <div className="h-9 w-9 rounded-lg bg-muted/20" />
          <div className="h-9 w-9 rounded-lg bg-muted/20" />
        </div>
      </div>
    ),
  },
);

// CommandPalette includes the full command dialog + keyboard shortcuts, so it
// loads only after the rest of the shell has settled.
const CommandPalette = dynamic(
  () => import("@/components/admin/ui/command-palette").then((m) => m.CommandPalette),
  { ssr: false, loading: () => null },
);

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);
  const mobileSidebarRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Focus management: move focus into drawer on open, restore on close
  React.useEffect(() => {
    if (sidebarOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      const t = window.setTimeout(() => {
        const drawer = mobileSidebarRef.current;
        if (!drawer) return;
        const focusable = drawer.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable ?? drawer).focus();
      }, 50);
      return () => window.clearTimeout(t);
    } else {
      previouslyFocused.current?.focus?.();
      previouslyFocused.current = null;
    }
  }, [sidebarOpen]);

  // Focus trap: keep Tab within the drawer while it's open
  const handleDrawerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !sidebarOpen) return;
    const drawer = mobileSidebarRef.current;
    if (!drawer) return;
    const focusable = Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Touch gestures for mobile sidebar
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]!.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0]!.clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    // Swipe left to close (when sidebar is open on mobile)
    if (diff > swipeThreshold && sidebarOpen) {
      setSidebarOpen(false);
    }

    // Swipe right to open (when near right edge)
    if (diff < -swipeThreshold && !sidebarOpen && touchStartX.current > window.innerWidth - 50) {
      setSidebarOpen(true);
    }
  };

  // Lock body scroll when sidebar is open on mobile
  React.useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <TooltipProvider>
      <div
        className="relative flex h-screen overflow-hidden dark:ambient-bg bg-[radial-gradient(circle_at_top,#0f172a08,transparent_32%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background))_40%,hsl(var(--muted)/0.25))]"
        dir="rtl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30 dark:opacity-20" />

        {/* Desktop sidebar — code-split with its own skeleton */}
        <div className="relative z-10 hidden lg:block">
          <AdminSidebar />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <div
          className={cn(
            "fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden glass-panel-strong",
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          )}
          ref={mobileSidebarRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
          inert={!sidebarOpen || undefined}
          onKeyDown={handleDrawerKeyDown}
        >
          <AdminSidebar />
        </div>

        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          {/* Header — code-split with its own skeleton */}
          <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="admin-performance-scope flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1680px] p-4 lg:p-6">
              <AdminPageAccessGate>{children}</AdminPageAccessGate>
            </div>
          </main>
        </div>

        {/* Command palette — loaded lazily after initial paint */}
        <CommandPalette />
      </div>
    </TooltipProvider>
  );
}