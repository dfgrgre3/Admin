"use client";

import type { Attachment, ApiResponse } from "../types";
import { unsupported } from "./mappers";

// ─── Files / Attachments ────────────────────────────────────────────────────────
// The Go backend does have an AddLessonAttachment handler, but the route it is
// registered under (`POST /courses/lessons/attachments`) never captures a
// lesson id — the handler reads `c.Param("id")` from a URL that has no `:id`
// segment, so it always resolves to an empty SubTopicID. There's also no
// list/delete/download endpoint for lesson attachments. Until that route is
// fixed and completed on the backend, this stays an honest "not supported"
// rather than silently uploading files that vanish on reload.

export const filesApi = {
  async uploadFile(): Promise<ApiResponse<Attachment>> {
    return unsupported<Attachment>("رفع الملفات المرفقة بالدروس");
  },

  async deleteFile(): Promise<ApiResponse<void>> {
    return unsupported<void>("حذف الملفات المرفقة");
  },

  async downloadFile(): Promise<Blob> {
    throw new Error("تحميل الملفات المرفقة غير مدعوم حالياً من الخادم");
  },
};
