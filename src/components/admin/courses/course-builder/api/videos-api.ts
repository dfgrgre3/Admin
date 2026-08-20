"use client";

import { lessonsApi } from "./lessons-api";
import type { ApiResponse, Lesson } from "../types";

interface UploadResult {
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.split("=").slice(1).join("="));
  } catch {
    return match.split("=").slice(1).join("=");
  }
}

async function ensureCsrfCookie(): Promise<void> {
  if (readCookie("_csrf")) return;
  await fetch("/api/auth/csrf", { method: "GET", credentials: "include", cache: "no-store" });
}

/** Raw multipart upload with real progress reporting via XMLHttpRequest —
 * apiClient's fetch wrapper has no upload-progress hook, and the video/file
 * upload zones need one for the progress bar to mean anything. */
async function uploadWithProgress(file: File, context: string, category: string, onProgress?: (pct: number) => void): Promise<UploadResult> {
  await ensureCsrfCookie();

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("context", context);
    form.append("category", category);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.withCredentials = true;
    const csrfToken = readCookie("_csrf");
    if (csrfToken) xhr.setRequestHeader("X-CSRF-Token", csrfToken);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const payload = JSON.parse(xhr.responseText);
          const data = payload?.data || payload;
          resolve(data as UploadResult);
        } catch {
          reject(new Error("استجابة غير صالحة من خادم الرفع"));
        }
      } else {
        let message = `فشل الرفع (HTTP ${xhr.status})`;
        try {
          const payload = JSON.parse(xhr.responseText);
          message = payload?.error || payload?.message || message;
        } catch {
          // keep default message
        }
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("فشل الاتصال بخادم الرفع"));
    xhr.send(form);
  });
}

// ─── Videos ─────────────────────────────────────────────────────────────────────
// Upload is real (goes through the Go backend's generic /upload storage
// endpoint), then the returned URL is saved on the lesson's mediaUrl via the
// real lessons endpoint. There is no video transcoding/processing pipeline in
// this backend, so "processing status" is reported honestly as not applicable
// rather than faking progress.

export const videosApi = {
  async uploadVideo(
    courseId: string,
    sectionId: string,
    lessonId: string,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<ApiResponse<{ videoUrl: string; metadata: UploadResult }>> {
    const result = await uploadWithProgress(file, "course-video", "video", onProgress);
    await lessonsApi.updateLesson(courseId, sectionId, lessonId, { mediaUrl: result.fileUrl });
    return { data: { videoUrl: result.fileUrl, metadata: result }, error: undefined };
  },

  async deleteVideo(courseId: string, sectionId: string, lessonId: string): Promise<ApiResponse<void>> {
    await lessonsApi.updateLesson(courseId, sectionId, lessonId, { mediaUrl: null });
    return { data: undefined, error: undefined };
  },

  /** Video "visibility" (public/private/unlisted) has no corresponding field
   * on the Lesson model in this backend — there is nothing to persist here.
   * Kept as a documented no-op instead of silently pretending to save it. */
  async updateVideo(): Promise<ApiResponse<null>> {
    return { data: null, error: undefined };
  },

  async getVideo(lessons: Lesson[], lessonId: string): Promise<ApiResponse<Lesson | null>> {
    return { data: lessons.find((lesson) => lesson.id === lessonId) || null, error: undefined };
  },

  /** No transcoding pipeline exists in this backend, so there is no status to poll. */
  async getProcessingStatus(): Promise<ApiResponse<null>> {
    return { data: null, error: undefined };
  },
};
