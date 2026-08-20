"use client";

import { useCallback, useState, type MutableRefObject } from "react";
import { chaptersApi } from "../api";
import type { Chapter } from "../types";

interface Options {
  handleError: (err: unknown, defaultMessage: string) => never;
  courseIdRef: MutableRefObject<string | undefined>;
}

export function useChapters({ handleError, courseIdRef }: Options) {
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const loadChapters = useCallback(async (id: string) => {
    try {
      const response = await chaptersApi.getChapters(id);
      if (response.error) throw new Error(response.error);
      setChapters(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل الفصول");
    }
  }, [handleError]);

  const createChapter = useCallback(async (data: any) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await chaptersApi.createChapter(id, data);
      if (response.error) throw new Error(response.error);
      await loadChapters(id);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل إنشاء الفصل");
      return null;
    }
  }, [handleError, loadChapters, courseIdRef]);

  const updateChapter = useCallback(async (chapterId: string, data: Partial<Chapter>) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await chaptersApi.updateChapter(id, chapterId, data);
      if (response.error) throw new Error(response.error);
      await loadChapters(id);
    } catch (err) {
      handleError(err, "فشل تحديث الفصل");
    }
  }, [handleError, loadChapters, courseIdRef]);

  const deleteChapter = useCallback(async (chapterId: string) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await chaptersApi.deleteChapter(id, chapterId);
      if (response.error) throw new Error(response.error);
      await loadChapters(id);
    } catch (err) {
      handleError(err, "فشل حذف الفصل");
    }
  }, [handleError, loadChapters, courseIdRef]);

  const reorderChapters = useCallback(async (chapterIds: string[]) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await chaptersApi.reorderChapters(id, chapterIds);
      if (response.error) throw new Error(response.error);
      if (response.data) setChapters(response.data);
    } catch (err) {
      handleError(err, "فشل إعادة ترتيب الفصول");
    }
  }, [handleError, courseIdRef]);

  return { chapters, loadChapters, createChapter, updateChapter, deleteChapter, reorderChapters };
}
