"use client";

import { Filter, X } from "lucide-react";
import type { ReactNode } from "react";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  hasActiveFilters: boolean;
  children?: ReactNode;
}

export function FilterDrawer({ open, onClose, hasActiveFilters, children }: FilterDrawerProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-full max-w-sm bg-background border-r border-border shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-black">الفلاتر المتقدمة</h2>
            {hasActiveFilters && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}