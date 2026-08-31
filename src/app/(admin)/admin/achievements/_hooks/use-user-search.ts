"use client";

import { useState, useCallback, useMemo } from "react";
import { adminFetch } from "@/lib/api/admin-api";
import { toast } from "sonner";

export interface UserSearchResult {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  role?: string;
}

export function useUserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);

  const search = useCallback(async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await adminFetch(`/api/admin/users/search?q=${encodeURIComponent(term)}&limit=20`);
      if (!response.ok) throw new Error("فشل البحث عن المستخدمين");
      const data = await response.json();
      setResults(data.data || data.users || []);
    } catch (error) {
      toast.error("فشل البحث عن المستخدمين");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = useCallback((user: UserSearchResult) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u.id === user.id)) return prev;
      return [...prev, user];
    });
  }, []);

  const removeUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const selectedIds = useMemo(() => selectedUsers.map((u) => u.id), [selectedUsers]);

  return {
    searchTerm,
    results,
    loading,
    selectedUsers,
    selectedIds,
    search,
    addUser,
    removeUser,
    clearSelected,
    setSearchTerm,
  };
}