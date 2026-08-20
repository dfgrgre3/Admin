"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { draftApi } from "../api";
import type { CourseDraft } from "../types";

interface Options {
  onAutoSave?: (data: Partial<CourseDraft>) => void;
  autoSaveDelay: number;
  handleError: (err: unknown, defaultMessage: string) => never;
  courseIdRef: MutableRefObject<string | undefined>;
}

export function useDraftState({ onAutoSave, autoSaveDelay, handleError, courseIdRef }: Options) {
  const [draft, setDraft] = useState<CourseDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadDraft = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await draftApi.getDraft(id);
      if (response.error) throw new Error(response.error);
      setDraft(response.data || null);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      handleError(err, "فشل تحميل مسودة الكورس");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const createDraft = useCallback(async (data: Partial<CourseDraft>) => {
    setIsSaving(true);
    try {
      const response = await draftApi.createDraft(data);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setDraft(response.data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل إنشاء مسودة الكورس");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);

  const updateDraft = useCallback(async (data: Partial<CourseDraft>) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    setIsSaving(true);
    try {
      const response = await draftApi.updateDraft(id, data);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setDraft(response.data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      handleError(err, "فشل تحديث مسودة الكورس");
    } finally {
      setIsSaving(false);
    }
  }, [handleError, courseIdRef]);

  const autoSave = useCallback(async (data: Partial<CourseDraft>) => {
    const id = courseIdRef.current;
    if (!id) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const response = await draftApi.autoSaveDraft(id, data);
        if (!response.error && response.data) {
          setDraft(response.data);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          onAutoSave?.(data);
        }
      } catch {
        // Silently fail auto-save — the manual "حفظ" button surfaces errors.
      }
    }, autoSaveDelay);
  }, [autoSaveDelay, onAutoSave, courseIdRef]);

  const deleteDraft = useCallback(async () => {
    const id = courseIdRef.current;
    if (!id) return;

    setIsSaving(true);
    try {
      const response = await draftApi.deleteDraft(id);
      if (response.error) throw new Error(response.error);
      setDraft(null);
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (err) {
      handleError(err, "فشل حذف مسودة الكورس");
    } finally {
      setIsSaving(false);
    }
  }, [handleError, courseIdRef]);

  const runLifecycleAction = useCallback(async (
    action: (id: string) => Promise<{ data?: CourseDraft; error?: string }>,
    errorMessage: string
  ) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    setIsSaving(true);
    try {
      const response = await action(id);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setDraft(response.data);
        setLastSaved(new Date());
      }
    } catch (err) {
      handleError(err, errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [handleError, courseIdRef]);

  const publishCourse = useCallback(() => runLifecycleAction(draftApi.publishCourse.bind(draftApi), "فشل نشر الكورس"), [runLifecycleAction]);
  const unpublishCourse = useCallback(() => runLifecycleAction(draftApi.unpublishCourse.bind(draftApi), "فشل إلغاء نشر الكورس"), [runLifecycleAction]);
  const archiveCourse = useCallback(() => runLifecycleAction(draftApi.archiveCourse.bind(draftApi), "فشل أرشفة الكورس"), [runLifecycleAction]);
  const unarchiveCourse = useCallback(() => runLifecycleAction(draftApi.unarchiveCourse.bind(draftApi), "فشل استعادة الكورس من الأرشيف"), [runLifecycleAction]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  return {
    draft, isLoading, isSaving, lastSaved, hasUnsavedChanges,
    loadDraft, createDraft, updateDraft, autoSave, deleteDraft,
    publishCourse, unpublishCourse, archiveCourse, unarchiveCourse,
  };
}
