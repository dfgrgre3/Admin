"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { getEventConfig } from "../_lib/event-config";

export interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  detail?: string;
  timestamp: string;
  ip?: string;
  status?: string;
}

export function useActivityFeed(userId: string) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const limit = 30;

  const query = useQuery({
    queryKey: ["user-activity", userId, page, limit],
    queryFn: () => adminUsersApi.getActivity(userId, { limit: limit * page }),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const userQuery = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => adminUsersApi.get(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const allEvents: ActivityEvent[] = (query.data?.feed ?? []) as ActivityEvent[];

  const filtered = allEvents.filter(event => {
    const cfg = getEventConfig(event.type);
    const matchesCategory = category === "all" || cfg.category === category;
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.type.toLowerCase().includes(search.toLowerCase()) ||
      event.detail?.toLowerCase().includes(search.toLowerCase()) ||
      event.ip?.includes(search);
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: query.data?.total ?? 0,
    filtered: filtered.length,
    logins: allEvents.filter(e => e.type === "login").length,
    failed: allEvents.filter(e => e.type === "failed_login").length,
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
  };

  return {
    search,
    setSearch,
    category,
    setCategory,
    page,
    setPage,
    limit,
    query,
    userQuery,
    events: allEvents,
    filtered,
    stats,
    resetFilters,
  };
}