"use client";

import { UserListFiltersPanel } from "./user-list-filters-panel";

interface PageFiltersPanelProps {
  open: boolean;
  onToggle: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  canViewFinancial: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: Record<string, any>;
  onResetPage: () => void;
}

export function PageFiltersPanel({
  open, onToggle, hasActiveFilters, onClearAll, canViewFinancial, filters, onResetPage,
}: PageFiltersPanelProps) {
  return (
    <UserListFiltersPanel
      open={open}
      onToggle={onToggle}
      hasActiveFilters={hasActiveFilters}
      onClearAll={onClearAll}
      canViewFinancial={canViewFinancial}
      country={filters.country}
      setCountry={filters.setCountry}
      city={filters.city}
      setCity={filters.setCity}
      gender={filters.gender}
      setGender={filters.setGender}
      verified={filters.verified}
      setVerified={filters.setVerified}
      subscriptionStatus={filters.subscriptionStatus}
      setSubscriptionStatus={filters.setSubscriptionStatus}
      paymentStatus={filters.paymentStatus}
      setPaymentStatus={filters.setPaymentStatus}
      online={filters.online}
      setOnline={filters.setOnline}
      createdFrom={filters.createdFrom}
      setCreatedFrom={filters.setCreatedFrom}
      createdTo={filters.createdTo}
      setCreatedTo={filters.setCreatedTo}
      walletMin={filters.walletMin}
      setWalletMin={filters.setWalletMin}
      walletMax={filters.walletMax}
      setWalletMax={filters.setWalletMax}
      includeDeleted={filters.includeDeleted}
      setIncludeDeleted={filters.setIncludeDeleted}
      onFilterChange={onResetPage}
    />
  );
}