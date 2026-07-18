"use client";

import * as React from "react";
import { AdminPageAccessGate } from "@/components/admin/admin-page-access-gate";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { CommandPalette } from "@/components/admin/ui/command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PageSkeleton } from "@/components/lazy/LazyComponents";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarLoaded, setSidebarLoaded] = React.useState(false);
  const [headerLoaded, setHeaderLoaded] = React.useState(false);
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);
  const mobileSidebarRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  // Lazy load sidebar and header
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSidebarLoaded(true);
      setHeaderLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

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
        
        {/* Lazy load CommandPalette */}
        {headerLoaded && <CommandPalette />}
        
        <div className="relative z-10 hidden lg:block">
          {sidebarLoaded ? (
            <AdminSidebar />
          ) : (
            <div className="w-[260px] animate-pulse bg-muted/20" />
          )}
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

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
          {sidebarLoaded ? <AdminSidebar /> : <div className="w-[260px] animate-pulse bg-muted/20" />}
        </div>

        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          {headerLoaded ? (
            <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          ) : (
            <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6 animate-pulse bg-muted/10">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-muted/30 rounded-lg" />
                <div className="h-8 w-8 bg-muted/30 rounded-lg lg:hidden" />
              </div>
            </div>
          )}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1680px] p-4 lg:p-6">
              <AdminPageAccessGate>{children}</AdminPageAccessGate>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}