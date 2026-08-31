"use client";

import type { UserListFiltersPanelProps } from "../_filters/filter-types";
import { FilterDrawer } from "../_filters/filter-drawer";
import { FiltersContent } from "../_filters/filter-fields";
import { FilterFooter } from "../_filters/filter-footer";

export function UserListFiltersPanel(props: UserListFiltersPanelProps) {
  const {
    open, onToggle, hasActiveFilters, onClearAll, onFilterChange,
  } = props;

  return (
    <FilterDrawer open={open} onClose={onToggle} hasActiveFilters={hasActiveFilters}>
      <FiltersContent {...props} />
      <FilterFooter
        hasActiveFilters={hasActiveFilters}
        onApply={onToggle}
        onReset={() => { onClearAll(); onToggle(); }}
      />
    </FilterDrawer>
  );
}