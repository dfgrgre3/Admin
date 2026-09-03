import { ArchivedCourseRow } from "./types";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدم",
  ALL_LEVELS: "جميع المستويات",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  ar: "العربية",
  en: "الإنجليزية",
  fr: "الفرنسية",
};

export function toArchivedRow(raw: Record<string, unknown>): ArchivedCourseRow {
  const stringOf = (...keys: string[]) => {
    for (const key of keys) {
      const v = raw[key];
      if (typeof v === "string" && v.trim()) return v;
    }
    return null;
  };

  return {
    id: String(raw.id ?? ""),
    title: stringOf("title", "name", "nameAr") ?? "بدون عنوان",
    slug: stringOf("slug"),
    thumbnailUrl: stringOf("coverImageUrl", "thumbnailUrl", "cover_image_url", "thumbnail_url"),
    description: stringOf("longDescription", "shortDescription", "description", "short_description"),
    status: stringOf("status") ?? "",
    level: stringOf("level"),
    language: stringOf("language"),
    version: typeof raw.version === "number" ? raw.version : undefined,
    createdAt: stringOf("createdAt", "created_at"),
    updatedAt: stringOf("updatedAt", "updated_at"),
  };
}

export function toCourseLevel(raw: string | undefined | null): string {
  return raw ? (LEVEL_LABELS[raw] ?? raw) : "—";
}

export function toCourseLanguage(raw: string | undefined | null): string {
  return raw ? (LANGUAGE_LABELS[raw] ?? raw) : "—";
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
