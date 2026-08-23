"use client";

import { useCallback } from "react";
import { filesApi } from "../api";

export function useFiles(handleError: (err: unknown, defaultMessage: string) => never) {
  const uploadFile = useCallback(async (
    courseId: string,
    sectionId: string,
    lessonId: string,
    file: File,
    onProgress?: (pct: number) => void
  ) => {
    try {
      const response = await filesApi.uploadFile(courseId, sectionId, lessonId, file, onProgress);
      if (response.error) throw new Error(response.error);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل رفع الملف");
      return null;
    }
  }, [handleError]);

  const deleteFile = useCallback(async (courseId: string, sectionId: string, lessonId: string, attachmentId: string) => {
    try {
      const response = await filesApi.deleteFile(courseId, sectionId, lessonId, attachmentId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل حذف الملف");
    }
  }, [handleError]);

  // Attachment files live at a directly reachable URL (same pattern as
  // video/thumbnail media) — no backend download-proxy endpoint exists or is
  // needed, so this just opens the stored fileUrl in a new tab.
  const downloadFile = useCallback((fileUrl: string) => {
    if (typeof window === "undefined" || !fileUrl) return;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }, []);

  return { uploadFile, deleteFile, downloadFile };
}
