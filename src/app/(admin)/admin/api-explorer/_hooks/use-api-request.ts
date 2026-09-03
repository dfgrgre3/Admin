"use client";

/**
 * hook لتنفيذ طلب HTTP من مسودة RequestDraft.
 * يتولى:
 *  - استبدال متغيرات المسار {id} / {slug}
 *  - تركيب query string من queryParams
 *  - دمج headers (مع دعم Authorization/ApiKey)
 *  - إرسال الجسم وفق bodyMode
 *  - قياس الزمن والحجم وبناء ResponseRecord
 */

import * as React from "react";
import { adminApi } from "@/lib/api/admin-api";
import type {
  HttpMethod,
  KeyValueEntry,
  RequestDraft,
  ResponseRecord,
} from "../_types/api-explorer";

interface ExecuteOptions {
  signal?: AbortSignal;
}

function isEntryActive(entry: KeyValueEntry): boolean {
  return entry.enabled && entry.key.trim().length > 0;
}

function buildUrl(draft: RequestDraft): string {
  // 1) استبدال متغيرات المسار
  let url = draft.url.trim();
  for (const param of draft.pathParams) {
    if (!param.key) continue;
    const placeholder = `{${param.key}}`;
    const encoded = encodeURIComponent(param.value || "");
    url = url.split(placeholder).join(encoded);
  }

  // 2) تركيب query string
  const queryParts: string[] = [];
  for (const param of draft.queryParams) {
    if (!isEntryActive(param)) continue;
    queryParts.push(
      `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`
    );
  }
  if (queryParts.length > 0) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}${queryParts.join("&")}`;
  }
  return url;
}

function buildHeaders(draft: RequestDraft): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const h of draft.headers) {
    if (!isEntryActive(h)) continue;
    headers[h.key] = h.value;
  }

  // auth
  const auth = draft.auth;
  if (auth.type === "bearer" && auth.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  } else if (auth.type === "api-key" && auth.apiKeyValue) {
    const name = auth.apiKeyName || "X-API-Key";
    if (auth.apiKeyIn === "query") {
      // يضاف على query بدلاً من header — سيُعالَج خارجياً
    } else {
      headers[name] = auth.apiKeyValue;
    }
  } else if (auth.type === "basic" && auth.username) {
    const token = btoa(`${auth.username}:${auth.password ?? ""}`);
    headers["Authorization"] = `Basic ${token}`;
  }

  return headers;
}

function buildBody(draft: RequestDraft): {
  body: BodyInit | null;
  headers: Record<string, string>;
} {
  const headers: Record<string, string> = {};
  if (draft.method === "GET" || draft.method === "HEAD") {
    return { body: null, headers };
  }
  if (draft.bodyMode === "none") {
    return { body: null, headers };
  }
  if (draft.bodyMode === "json") {
    headers["Content-Type"] = "application/json";
    return { body: draft.bodyJson || "{}", headers };
  }
  if (draft.bodyMode === "raw") {
    headers["Content-Type"] = "text/plain";
    return { body: draft.bodyRaw, headers };
  }
  if (draft.bodyMode === "form-data") {
    const form = new FormData();
    for (const field of draft.formData) {
      if (!isEntryActive(field)) continue;
      form.append(field.key, field.value);
    }
    return { body: form, headers };
  }
  return { body: null, headers };
}

/** قياس تقريبي لحجم نص بالبايت */
function byteSize(text: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(text).length;
  }
  return text.length;
}

export interface UseApiRequestResult {
  send: (draft: RequestDraft, options?: ExecuteOptions) => Promise<ResponseRecord>;
  isLoading: boolean;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
}

export function useApiRequest(): UseApiRequestResult {
  const [isLoading, setIsLoading] = React.useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const send = React.useCallback(
    async (draft: RequestDraft, options: ExecuteOptions = {}): Promise<ResponseRecord> => {
      // إلغاء أي طلب سابق
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      if (options.signal) {
        options.signal.addEventListener("abort", () => controller.abort());
      }

      const url = buildUrl(draft);
      const headers = buildHeaders(draft);
      const { body, headers: bodyHeaders } = buildBody(draft);
      const finalHeaders = { ...headers, ...bodyHeaders };
      const method: HttpMethod = draft.method;

      setIsLoading(true);
      const start = performance.now();
      try {
        // ندفع عبر adminApi.fetch ليتم احترام CSRF/refresh.
        // لا نمرّر headers الـ Host/Content-Length الخاصة بـ Next.
        const cleanHeaders: Record<string, string> = {};
        for (const [k, v] of Object.entries(finalHeaders)) {
          if (k.toLowerCase() === "host" || k.toLowerCase() === "content-length") continue;
          cleanHeaders[k] = v;
        }

        const response = await adminApi.fetch(url, {
          method,
          headers: cleanHeaders,
          body: body as BodyInit | null,
          signal: controller.signal,
        });

        const text = await response.text();
        const elapsed = performance.now() - start;
        const respHeaders: Record<string, string> = {};
        response.headers.forEach((v, k) => {
          respHeaders[k] = v;
        });

        const record: ResponseRecord = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          durationMs: Math.round(elapsed),
          sizeBytes: byteSize(text),
          headers: respHeaders,
          body: text,
          contentType: respHeaders["content-type"] ?? "",
          timestamp: new Date().toISOString(),
        };
        return record;
      } catch (error) {
        const elapsed = performance.now() - start;
        const aborted = controller.signal.aborted;
        const record: ResponseRecord = {
          status: 0,
          statusText: aborted ? "Aborted" : "Network Error",
          ok: false,
          durationMs: Math.round(elapsed),
          sizeBytes: 0,
          headers: {},
          body: "",
          contentType: "",
          networkError: aborted
            ? "تم إلغاء الطلب بواسطة المستخدم"
            : error instanceof Error
              ? error.message
              : "خطأ غير معروف",
          timestamp: new Date().toISOString(),
        };
        return record;
      } finally {
        setIsLoading(false);
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    []
  );

  return { send, isLoading, abortControllerRef };
}
