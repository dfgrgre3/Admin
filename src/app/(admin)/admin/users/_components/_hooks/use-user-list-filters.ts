"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { UserRole, UserStatus } from "@/types/enums";

export function useUserListFilters() {
  const searchParams = useSearchParams();

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [role, setRole] = React.useState<"all" | UserRole>(() => (searchParams.get("role") as UserRole) || "all");
  const [status, setStatus] = React.useState<"all" | "NEW" | UserStatus>(() => (searchParams.get("status") as never) || "all");
  const [sortBy, setSortBy] = React.useState(() => searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = React.useState(() => searchParams.get("sortOrder") || "desc");

  const [country, setCountry] = React.useState(() => searchParams.get("country") || "");
  const [city, setCity] = React.useState(() => searchParams.get("city") || "");
  const [gender, setGender] = React.useState(() => searchParams.get("gender") || "all");
  const [verified, setVerified] = React.useState(() => searchParams.get("verified") || "all");
  const [subscriptionStatus, setSubscriptionStatus] = React.useState(() => searchParams.get("subscription") || "all");
  const [paymentStatus, setPaymentStatus] = React.useState(() => searchParams.get("payment") || "all");
  const [online, setOnline] = React.useState(() => searchParams.get("online") || "all");
  const [createdFrom, setCreatedFrom] = React.useState(() => searchParams.get("createdFrom") || "");
  const [createdTo, setCreatedTo] = React.useState(() => searchParams.get("createdTo") || "");
  const [walletMin, setWalletMin] = React.useState(() => searchParams.get("walletMin") || "");
  const [walletMax, setWalletMax] = React.useState(() => searchParams.get("walletMax") || "");
  const [includeDeleted, setIncludeDeleted] = React.useState(() => searchParams.get("includeDeleted") === "true");
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = React.useState(false);

  const updateQuerySearch = React.useCallback((next: string) => {
    setQuerySearch(next);
  }, []);

  const clearAllFilters = () => {
    setSearch("");
    setQuerySearch("");
    setRole("all");
    setStatus("all");
    setCountry("");
    setCity("");
    setGender("all");
    setVerified("all");
    setSubscriptionStatus("all");
    setPaymentStatus("all");
    setOnline("all");
    setCreatedFrom("");
    setCreatedTo("");
    setWalletMin("");
    setWalletMax("");
    setIncludeDeleted(false);
  };

  const hasActiveFilters =
    !!search ||
    role !== "all" ||
    status !== "all" ||
    !!country ||
    !!city ||
    gender !== "all" ||
    verified !== "all" ||
    subscriptionStatus !== "all" ||
    paymentStatus !== "all" ||
    online !== "all" ||
    !!createdFrom ||
    !!createdTo ||
    !!walletMin ||
    !!walletMax ||
    includeDeleted;

  return {
    page, setPage,
    limit, setLimit,
    search, setSearch,
    querySearch, setQuerySearch, updateQuerySearch,
    role, setRole,
    status, setStatus,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    country, setCountry,
    city, setCity,
    gender, setGender,
    verified, setVerified,
    subscriptionStatus, setSubscriptionStatus,
    paymentStatus, setPaymentStatus,
    online, setOnline,
    createdFrom, setCreatedFrom,
    createdTo, setCreatedTo,
    walletMin, setWalletMin,
    walletMax, setWalletMax,
    includeDeleted, setIncludeDeleted,
    advancedFiltersOpen, setAdvancedFiltersOpen,
    clearAllFilters,
    hasActiveFilters,
  };
}