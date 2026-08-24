"use client";

import { useCallback, useRef, useState, type MutableRefObject } from "react";
import { lessonsApi } from "../api";
import type { Lesson } from "../types";

interface Options {
  handleError: (err: unknown, defaultMessage: string) => never;
  courseIdRef: MutableRefObject<string | undefined>;
}

/** updateLesson/deleteLesson/duplicateLesson only receive a lessonId (matching
 * the existing step components' call sites), but the real backend route needs
 * the section id too. Since the wizard only ever has one chapter's lessons
 * loaded at a time, we track the last-loaded section id in a ref rather than
 * changing every step component's call signature. */
export function useLessons({ handleError, courseIdRef }: Options) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const currentSectionIdRef = useRef<string | undefined>(undefined);

  const requireCourseId = () => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    return id;
  };

  const loadLessons = useCallback(async (sectionId: string) => {
    currentSectionIdRef.current = sectionId;
    const courseId = courseIdRef.current;
    if (!courseId) return;
    try {
      const response = await lessonsApi.getLessons(courseId, sectionId);
      if (response.error) throw new Error(response.error);
      setLessons(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل الدروس");
    }
  }, [handleError, courseIdRef]);

  const createLesson = useCallback(async (sectionId: string, data: Partial<Lesson>) => {
    try {
      const courseId = requireCourseId();
      const response = await lessonsApi.createLesson(courseId, sectionId, data as any);
      if (response.error) throw new Error(response.error);
      await loadLessons(sectionId);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل إنشاء الدرس");
      return null;
    }
  }, [handleError, loadLessons]);

  const updateLesson = useCallback(async (lessonId: string, data: Partial<Lesson>) => {
    const sectionId = currentSectionIdRef.current;
    if (!sectionId) throw new Error("لم يتم تحديد الفصل");
    try {
      const courseId = requireCourseId();
      const response = await lessonsApi.updateLesson(courseId, sectionId, lessonId, data as any);
      if (response.error) throw new Error(response.error);
      await loadLessons(sectionId);
    } catch (err) {
      handleError(err, "فشل تحديث الدرس");
    }
  }, [handleError, loadLessons]);

  const deleteLesson = useCallback(async (lessonId: string) => {
    const sectionId = currentSectionIdRef.current;
    if (!sectionId) throw new Error("لم يتم تحديد الفصل");
    try {
      const courseId = requireCourseId();
      const response = await lessonsApi.deleteLesson(courseId, sectionId, lessonId);
      if (response.error) throw new Error(response.error);
      await loadLessons(sectionId);
    } catch (err) {
      handleError(err, "فشل حذف الدرس");
    }
  }, [handleError, loadLessons]);

  const duplicateLesson = useCallback(async (lessonId: string) => {
    const sectionId = currentSectionIdRef.current;
    if (!sectionId) throw new Error("لم يتم تحديد الفصل");
    try {
      const source = lessons.find((lesson) => lesson.id === lessonId);
      if (!source) throw new Error("لم يتم العثور على الدرس المطلوب تكراره");
      const courseId = requireCourseId();
      const response = await lessonsApi.createLesson(courseId, sectionId, {
        title: `${source.title} (نسخة)`,
        type: source.type,
        content: source.content,
        mediaUrl: source.mediaUrl,
        durationSeconds: source.durationSeconds,
        isFreePreview: source.isFreePreview,
        orderIndex: lessons.length,
        availabilityType: source.availabilityType,
        availableFrom: source.availableFrom,
        dripDelayDays: source.dripDelayDays,
      } as any);
      if (response.error) throw new Error(response.error);
      await loadLessons(sectionId);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل تكرار الدرس");
      return null;
    }
  }, [handleError, lessons, loadLessons]);

  /** Merges a partial update into one already-loaded lesson without a network
   * round-trip — for callers (e.g. exam linking) that already got the
   * updated lesson back from their own mutation and just need the wizard's
   * shared `lessons` list to reflect it. */
  const patchLesson = useCallback((lessonId: string, patch: Partial<Lesson>) => {
    setLessons((prev) => prev.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...patch } : lesson)));
  }, []);

  const reorderLessons = useCallback(async (sectionId: string, lessonIds: string[]) => {
    try {
      const courseId = requireCourseId();
      const response = await lessonsApi.reorderLessons(courseId, sectionId, lessonIds);
      if (response.error) throw new Error(response.error);
      if (response.data) setLessons(response.data);
    } catch (err) {
      handleError(err, "فشل إعادة ترتيب الدروس");
    }
  }, [handleError]);

  return { lessons, loadLessons, createLesson, updateLesson, deleteLesson, duplicateLesson, patchLesson, reorderLessons };
}
