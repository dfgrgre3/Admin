"use client";

import { useCallback } from "react";
import { filesApi } from "../api";

export function useFiles(handleError: (err: unknown, defaultMessage: string) => never) {
  const uploadFile = useCallback(async (_lessonId: string, _file: File) => {
    try {
      const response = await filesApi.uploadFile();
      if (response.error) throw new Error(response.error);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل رفع الملف");
      return null;
    }
  }, [handleError]);

  const deleteFile = useCallback(async (_attachmentId: string) => {
    try {
      const response = await filesApi.deleteFile();
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل حذف الملف");
    }
  }, [handleError]);

  const downloadFile = useCallback(async (attachmentId: string) => {
    try {
      const blob = await filesApi.downloadFile();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      handleError(err, "فشل تحميل الملف");
    }
  }, [handleError]);

  return { uploadFile, deleteFile, downloadFile };
}
