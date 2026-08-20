"use client";

import { useCallback, useRef } from "react";
import { draftApi } from "../api";
import type { CourseDraft } from "../types";
import { useErrorState } from "./shared";
import { useDraftState } from "./useDraftState";
import { useReferenceData } from "./useReferenceData";
import { useTeachers } from "./useTeachers";
import { useChapters } from "./useChapters";
import { useLessons } from "./useLessons";
import { useVideos } from "./useVideos";
import { useFiles } from "./useFiles";
import { useExams } from "./useExams";
import { useAssignments } from "./useAssignments";
import { useCertificates } from "./useCertificates";
import { usePricing } from "./usePricing";
import { useSeo } from "./useSeo";

interface UseCourseBuilderOptions {
  courseId?: string;
  onAutoSave?: (data: Partial<CourseDraft>) => void;
  autoSaveDelay?: number;
}

/** Composes every domain slice (draft, chapters, lessons, videos, …) into the
 * single hook every step component calls. Split out of one 925-line hooks.ts
 * so each concern lives in its own file — see the sibling `use*.ts` modules. */
export function useCourseBuilder(options: UseCourseBuilderOptions = {}) {
  const { courseId, onAutoSave, autoSaveDelay = 2000 } = options;

  const courseIdRef = useRef(courseId);
  courseIdRef.current = courseId;

  const { error, clearError, handleError } = useErrorState();

  const draftState = useDraftState({ onAutoSave, autoSaveDelay, handleError, courseIdRef });
  const referenceData = useReferenceData(handleError);
  const teachersState = useTeachers({ handleError, courseIdRef });
  const chaptersState = useChapters({ handleError, courseIdRef });
  const lessonsState = useLessons({ handleError, courseIdRef });
  const videosState = useVideos({ handleError, courseIdRef });
  const filesState = useFiles(handleError);
  const examsState = useExams(handleError);
  const assignmentsState = useAssignments(handleError);
  const certificatesState = useCertificates(handleError);
  const pricingState = usePricing({ handleError, courseIdRef });
  const seoState = useSeo({ handleError, courseIdRef });

  const loadPreview = useCallback(async (id: string) => {
    try {
      const response = await draftApi.getCoursePreview(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    } catch (err) {
      handleError(err, "فشل تحميل المعاينة");
      return null;
    }
  }, [handleError]);

  return {
    ...draftState,
    ...referenceData,
    ...teachersState,
    ...chaptersState,
    ...lessonsState,
    ...videosState,
    ...filesState,
    ...examsState,
    ...assignmentsState,
    ...certificatesState,
    ...pricingState,
    ...seoState,
    loadPreview,
    error,
    clearError,
  };
}
