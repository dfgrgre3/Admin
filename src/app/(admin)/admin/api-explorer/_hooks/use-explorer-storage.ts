"use client";

/**
 * خطاف إدارة السجل والمجموعات المحفوظة لمستكشف API.
 * يعتمد على useSafeLocalStorage مع مزامنة تبادلية بين علامات التبويب.
 */

import * as React from "react";
import { useSafeLocalStorage } from "@/lib/safe-client-utils";
import {
  HISTORY_MAX_ITEMS,
  STORAGE_KEYS,
  type HistoryEntry,
  type SavedCollection,
} from "../_types/api-explorer";

/** توليد معرّف فريد قصير */
function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

interface UseExplorerStorageResult {
  history: HistoryEntry[];
  collections: SavedCollection[];
  /** إضافة مدخل جديد للسجل (مع اقتطاع عند تجاوز الحد) */
  pushHistory: (entry: HistoryEntry) => void;
  /** حذف مدخل من السجل */
  removeHistory: (id: string) => void;
  /** مسح كامل السجل */
  clearHistory: () => void;
  /** إنشاء مجموعة جديدة */
  createCollection: (name: string, description?: string) => SavedCollection;
  /** حذف مجموعة */
  removeCollection: (id: string) => void;
  /** إعادة تسمية مجموعة */
  renameCollection: (id: string, name: string) => void;
  /** إضافة طلب إلى مجموعة */
  addRequestToCollection: (collectionId: string, request: SavedCollection["requests"][number]) => void;
  /** إزالة طلب من مجموعة */
  removeRequestFromCollection: (collectionId: string, requestId: string) => void;
  /** تخزين جاهز (mounted) */
  ready: boolean;
}

export function useExplorerStorage(): UseExplorerStorageResult {
  const [history, setHistory, historyReady] = useSafeLocalStorage<HistoryEntry[]>(
    STORAGE_KEYS.history,
    []
  );
  const [collections, setCollections, collectionsReady] = useSafeLocalStorage<SavedCollection[]>(
    STORAGE_KEYS.collections,
    []
  );

  const pushHistory = React.useCallback(
    (entry: HistoryEntry) => {
      setHistory((prev) => {
        const next = [entry, ...prev.filter((h) => h.id !== entry.id)];
        return next.slice(0, HISTORY_MAX_ITEMS);
      });
    },
    [setHistory]
  );

  const removeHistory = React.useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((h) => h.id !== id));
    },
    [setHistory]
  );

  const clearHistory = React.useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const createCollection = React.useCallback(
    (name: string, description?: string): SavedCollection => {
      const now = new Date().toISOString();
      const newCollection: SavedCollection = {
        id: uid(),
        name,
        description,
        color: ["blue", "violet", "emerald", "amber", "rose"][Math.floor(Math.random() * 5)],
        createdAt: now,
        updatedAt: now,
        requests: [],
      };
      setCollections((prev) => [newCollection, ...prev]);
      return newCollection;
    },
    [setCollections]
  );

  const removeCollection = React.useCallback(
    (id: string) => {
      setCollections((prev) => prev.filter((c) => c.id !== id));
    },
    [setCollections]
  );

  const renameCollection = React.useCallback(
    (id: string, name: string) => {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name, updatedAt: new Date().toISOString() } : c))
      );
    },
    [setCollections]
  );

  const addRequestToCollection = React.useCallback(
    (collectionId: string, request: SavedCollection["requests"][number]) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                requests: [
                  { ...request, id: request.id || uid() },
                  ...c.requests.filter((r) => r.id !== request.id),
                ],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    },
    [setCollections]
  );

  const removeRequestFromCollection = React.useCallback(
    (collectionId: string, requestId: string) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                requests: c.requests.filter((r) => r.id !== requestId),
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    },
    [setCollections]
  );

  return {
    history,
    collections,
    pushHistory,
    removeHistory,
    clearHistory,
    createCollection,
    removeCollection,
    renameCollection,
    addRequestToCollection,
    removeRequestFromCollection,
    ready: historyReady && collectionsReady,
  };
}

/** توليد مسودة طلب جديدة فارغة */
export function createEmptyDraft(method: HistoryEntry["method"] = "GET"): import("../_types/api-explorer").RequestDraft {
  return {
    id: uid(),
    name: "طلب جديد",
    method,
    url: "",
    pathParams: [],
    queryParams: [],
    headers: [{ id: uid(), key: "Accept", value: "application/json", enabled: true }],
    bodyMode: "none",
    bodyRaw: "",
    bodyJson: "{\n  \n}",
    formData: [],
    auth: { type: "none" },
  };
}

/** تحويل RequestDraft إلى صيغة مختصرة لإعادة الاستخدام من السجل */
export function cloneDraft(draft: import("../_types/api-explorer").RequestDraft): import("../_types/api-explorer").RequestDraft {
  return {
    ...draft,
    id: uid(),
    pathParams: draft.pathParams.map((p) => ({ ...p })),
    queryParams: draft.queryParams.map((p) => ({ ...p })),
    headers: draft.headers.map((p) => ({ ...p })),
    formData: draft.formData.map((p) => ({ ...p })),
  };
}
