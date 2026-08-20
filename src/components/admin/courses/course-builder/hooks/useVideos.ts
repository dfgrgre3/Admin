"use client";

import { useCallback, type MutableRefObject } from "react";
import { videosApi } from "../api";
import type { Lesson } from "../types";

interface Options {
  handleError: (err: unknown, defaultMessage: string) => never;
  courseIdRef: MutableRefObject<string | undefined>;
}

export function useVideos({ handleError, courseIdRef }: Options) {
  const requireCourseId = () => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    return id;
  };

  const uploadVideo = useCallback(async (sectionId: string, lessonId: string, file: File, onProgress?: (progress: number) => void) => {
    try {
      const courseId = requireCourseId();
      const response = await videosApi.uploadVideo(courseId, sectionId, lessonId, file, onProgress);
      if (response.error) throw new Error(response.error);
      return response.data;
    } catch (err) {
      handleError(err, "فشل رفع الفيديو");
      return null;
    }
  }, [handleError]);

  const deleteVideo = useCallback(async (sectionId: string, lessonId: string) => {
    try {
      const courseId = requireCourseId();
      const response = await videosApi.deleteVideo(courseId, sectionId, lessonId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل حذف الفيديو");
    }
  }, [handleError]);

  const updateVideo = useCallback(async (_lessonId: string, _data: any) => {
    try {
      const response = await videosApi.updateVideo();
      return response.data;
    } catch (err) {
      handleError(err, "فشل تحديث الفيديو");
      return null;
    }
  }, [handleError]);

  const getVideo = useCallback(async (lessons: Lesson[], lessonId: string) => {
    try {
      const response = await videosApi.getVideo(lessons, lessonId);
      return response.data;
    } catch (err) {
      handleError(err, "فشل تحميل الفيديو");
      return null;
    }
  }, [handleError]);

  const getProcessingStatus = useCallback(async () => {
    const response = await videosApi.getProcessingStatus();
    return response.data;
  }, []);

  return { uploadVideo, deleteVideo, updateVideo, getVideo, getProcessingStatus };
}
