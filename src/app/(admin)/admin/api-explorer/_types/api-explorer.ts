/**
 * أنواع بيانات مستكشف API
 * يحدد البنية الموحدة لكافة مكونات صفحة api-explorer
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export const HTTP_METHODS: readonly HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

/** خلية في جدول المسارات (كتالوج الـ API) */
export interface ApiEndpointNode {
  /** معرّف فريد ثابت للخلية */
  id: string;
  /** اسم المجموعة/القسم (مثال: auth, users, billing) */
  group: string;
  /** اسم المسار المختصر للعرض */
  name: string;
  /** المسار الفعلي الذي سيتم استدعاؤه (قد يحتوي على placeholders مثل {id}) */
  path: string;
  /** المسار المُولَّد فعلياً بعد استبدال المتغيرات */
  resolvedPath?: string;
  /** وصف المسار (اختياري) */
  description?: string;
  /** مجموعة المسار الفرعية (مثال: mfa, social) */
  subgroup?: string;
  /** متغيرات المسار المستخرجة من placeholders */
  pathParams: string[];
  /** هل يحتوي على دالة مولّدة (أي يتطلب متغيرات) */
  isDynamic: boolean;
  /** الوسوم/الكلمات المفتاحية للبحث */
  tags: string[];
}

/** معامل في query/header/body */
export interface KeyValueEntry {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

/** نوع جسم الطلب */
export type BodyMode = "none" | "json" | "form-data" | "raw" | "binary";

/** مسودة طلب قابلة للإرسال */
export interface RequestDraft {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  pathParams: KeyValueEntry[];
  queryParams: KeyValueEntry[];
  headers: KeyValueEntry[];
  bodyMode: BodyMode;
  bodyRaw: string;
  bodyJson: string;
  formData: KeyValueEntry[];
  auth: {
    type: "none" | "bearer" | "api-key" | "basic";
    token?: string;
    apiKeyName?: string;
    apiKeyValue?: string;
    apiKeyIn?: "header" | "query";
    username?: string;
    password?: string;
  };
}

/** استجابة HTTP بعد الإرسال */
export interface ResponseRecord {
  status: number;
  statusText: string;
  ok: boolean;
  durationMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  /** في حالة فشل الشبكة أو المهلة */
  networkError?: string;
  /** الطابع الزمني ISO */
  timestamp: string;
}

/** سجل تاريخي لطلب تم إرساله */
export interface HistoryEntry {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  status: number;
  durationMs: number;
  sizeBytes: number;
  timestamp: string;
  /** نسخة من الطلب لأغراض إعادة الإرسال السريع */
  draft: RequestDraft;
  response?: ResponseRecord;
}

/** مجموعة محفوظة (Collection) من الطلبات */
export interface SavedCollection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  requests: RequestDraft[];
}

/** مفتاح تخزين محلي */
export const STORAGE_KEYS = {
  history: "api-explorer:history:v1",
  collections: "api-explorer:collections:v1",
  activeDraft: "api-explorer:active-draft:v1",
} as const;

/** حد أقصى لعدد السجلات قبل اقتطاع الأقدم */
export const HISTORY_MAX_ITEMS = 100;
