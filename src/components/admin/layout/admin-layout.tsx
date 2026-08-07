"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AdminPageAccessGate } from "@/components/admin/admin-page-access-gate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const AdminSidebar = dynamic(
  () => import("@/components/admin/layout/admin-sidebar").then((m) => m.AdminSidebar),
  {
    ssr: false,
    loading: () => (
      <aside className="hidden h-screen w-[260px] border-l border-border bg-card/50 lg:block" aria-hidden="true">
        <div className="flex h-full flex-col gap-4 p-4">
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
      <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6 bg-muted/10" aria-hidden="true">
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

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

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

  const handleDrawerKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
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
  }, [sidebarOpen]);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]!.clientX;
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0]!.clientX;
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (diff > swipeThreshold && sidebarOpen) {
      setSidebarOpen(false);
    }

    if (diff < -swipeThreshold && !sidebarOpen && touchStartX.current > window.innerWidth - 50) {
      setSidebarOpen(true);
    }
  }, [sidebarOpen]);

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

  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <TooltipProvider>
      <div
        className="relative flex h-screen overflow-hidden bg-background"
        dir="rtl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        <div className="relative z-10 hidden lg:block">
          <AdminSidebar />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          className={cn(
            "fixed inset-y-0 right-0 z-50 lg:hidden border-l border-border bg-card",
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
          <AdminHeader onMenuClick={toggleSidebar} />

          <main className="admin-performance-scope flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1680px] p-4 lg:p-6">
              <AdminPageAccessGate>{children}</AdminPageAccessGate>
            </div>
          </main>
        </div>

        <CommandPalette />
      </div>
    </TooltipProvider>
  );
}