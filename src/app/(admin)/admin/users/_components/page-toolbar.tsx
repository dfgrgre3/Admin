"use client";

import { Filter, FilterX, Search } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";

interface PageToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onUpdateQuerySearch: (value: string) => void;
  advancedFiltersOpen: boolean;
  onToggleAdvancedFilters: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function PageToolbar({
  search,
  onSearchChange,
  onUpdateQuerySearch,
  advancedFiltersOpen,
  onToggleAdvancedFilters,
  hasActiveFilters,
  onClearFilters,
}: PageToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative group w-full sm:w-auto">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          type="text"
          placeholder="البحث بالاسم، البريد، الهاتف، اسم المستخدم..."
          aria-label="بحث في المستخدمين"
          className="bg-accent/10 border border-border rounded-xl h-10 px-10 text-sm focus:ring-1 ring-primary outline-none w-full sm:w-80 font-bold"
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            onSearchChange(value);
            onUpdateQuerySearch(value.trim());
          }}
        />
      </div>
      <AdminButton
        variant="outline"
        size="icon-sm"
        onClick={onToggleAdvancedFilters}
        className={advancedFiltersOpen ? "bg-primary text-primary-foreground" : ""}
      >
        <Filter className="h-4 w-4" />
      </AdminButton>
      {hasActiveFilters ? (
        <AdminButton variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
          <FilterX className="h-3.5 w-3.5 ml-1" /> مسح الفلاتر
        </AdminButton>
      ) : null}
    </div>
  );
}