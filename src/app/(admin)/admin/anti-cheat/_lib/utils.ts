import {
  EVENT_TYPE_CONFIG,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
  type AntiCheatEvent,
  type AntiCheatFlag,
  type AntiCheatSeverity,
  type AntiCheatStatus,
  riskLevel,
} from "../_components/types";

// ─────────────────────────────────────────────
//  حساب درجة المخاطر من قائمة أحداث
// ─────────────────────────────────────────────

export function calculateRiskScore(events: AntiCheatEvent[]): number {
  if (!events || events.length === 0) return 0;
  const totalWeight = events.reduce((acc, ev) => {
    const w = SEVERITY_CONFIG[ev.severity]?.weight ?? 1;
    return acc + w * 10;
  }, 0);
  return Math.min(100, totalWeight);
}

export function getHighestSeverity(events: AntiCheatEvent[]): AntiCheatSeverity {
  if (!events || events.length === 0) return "LOW";
  const order: AntiCheatSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  return events.reduce((max, ev) => {
    const a = order.indexOf(max);
    const b = order.indexOf(ev.severity);
    return b > a ? ev.severity : max;
  }, "LOW" as AntiCheatSeverity);
}

export function summarizeFlagsByStatus(flags: AntiCheatFlag[]) {
  const map = new Map<AntiCheatStatus, number>();
  STATUS_ORDER.forEach((s) => map.set(s, 0));
  flags.forEach((f) => map.set(f.status, (map.get(f.status) ?? 0) + 1));
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

export const STATUS_ORDER: AntiCheatStatus[] = [
  "OPEN",
  "UNDER_REVIEW",
  "CLEARED",
  "DISMISSED",
  "BLOCKED",
];

export function summarizeEventsByType(events: AntiCheatEvent[]) {
  const map = new Map<string, number>();
  events.forEach((e) => map.set(e.eventType, (map.get(e.eventType) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([eventType, count]) => ({ eventType, count }))
    .sort((a, b) => b.count - a.count);
}

export function summarizeEventsBySeverity(events: AntiCheatEvent[]) {
  const order: AntiCheatSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const map = new Map<AntiCheatSeverity, number>();
  order.forEach((s) => map.set(s, 0));
  events.forEach((e) => map.set(e.severity, (map.get(e.severity) ?? 0) + 1));
  return order.map((s) => ({ severity: s, count: map.get(s) ?? 0 }));
}

export function summarizeEventsByHour(events: AntiCheatEvent[]) {
  const map = new Map<number, number>();
  for (let i = 0; i < 24; i++) map.set(i, 0);
  events.forEach((e) => {
    const hour = new Date(e.createdAt).getHours();
    map.set(hour, (map.get(hour) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);
}

export function summarizeFlagsByDay(flags: AntiCheatFlag[], days = 7) {
  const map = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  flags.forEach((f) => {
    const key = new Date(f.createdAt).toISOString().slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

// ─────────────────────────────────────────────
//  Heatmap
// ─────────────────────────────────────────────

export function buildHeatmapMatrix(events: AntiCheatEvent[]): {
  day: number;
  hour: number;
  count: number;
}[] {
  const matrix: Record<string, number> = {};
  events.forEach((e) => {
    const d = new Date(e.createdAt);
    const day = d.getDay();
    const hour = d.getHours();
    const key = `${day}-${hour}`;
    matrix[key] = (matrix[key] ?? 0) + 1;
  });
  const out: { day: number; hour: number; count: number }[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      out.push({ day, hour, count: matrix[`${day}-${hour}`] ?? 0 });
    }
  }
  return out;
}

export function getHeatmapIntensity(
  value: number,
  max: number
): { bg: string; opacity: number } {
  if (value === 0 || max === 0) return { bg: "bg-muted/30", opacity: 0.2 };
  const ratio = value / max;
  if (ratio < 0.2) return { bg: "bg-emerald-500/30", opacity: 0.3 };
  if (ratio < 0.4) return { bg: "bg-amber-500/40", opacity: 0.5 };
  if (ratio < 0.7) return { bg: "bg-orange-500/60", opacity: 0.7 };
  return { bg: "bg-red-500/80", opacity: 1 };
}

// ─────────────────────────────────────────────
//  تصدير
// ─────────────────────────────────────────────

export function flagsToCSV(flags: AntiCheatFlag[]): string {
  const headers = [
    "ID",
    "اسم الطالب",
    "البريد الإلكتروني",
    "الامتحان",
    "درجة المخاطر",
    "الحالة",
    "الأحداث",
    "عنوان IP",
    "تاريخ الاكتشاف",
    "آخر نشاط",
    "السبب",
    "ملاحظة المراجعة",
  ];
  const rows = flags.map((f) => [
    f.id,
    f.userName || "",
    f.userEmail || "",
    f.examTitle || "",
    String(f.riskScore),
    STATUS_CONFIG[f.status]?.label || f.status,
    String(f.eventCount),
    f.ipAddress || "",
    f.createdAt,
    f.lastEventAt || "",
    f.reason || "",
    f.reviewNote || "",
  ]);
  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const v = String(cell ?? "").replace(/"/g, '""');
          return /[",\n]/.test(v) ? `"${v}"` : v;
        })
        .join(",")
    )
    .join("\n");
}

export function eventsToCSV(events: AntiCheatEvent[]): string {
  const headers = [
    "ID",
    "اسم الطالب",
    "البريد الإلكتروني",
    "الامتحان",
    "نوع الحدث",
    "الخطورة",
    "التفاصيل",
    "عنوان IP",
    "وكيل المتصفح",
    "التاريخ",
  ];
  const rows = events.map((e) => [
    e.id,
    e.userName || "",
    e.userEmail || "",
    e.examTitle || "",
    EVENT_TYPE_CONFIG[e.eventType]?.label || e.eventType,
    SEVERITY_CONFIG[e.severity]?.label || e.severity,
    e.detail || "",
    e.ipAddress || "",
    e.userAgent || "",
    e.createdAt,
  ]);
  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const v = String(cell ?? "").replace(/"/g, '""');
          return /[",\n]/.test(v) ? `"${v}"` : v;
        })
        .join(",")
    )
    .join("\n");
}

export function downloadFile(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob(["\uFEFF" + content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────
//  تصنيف الخطورة
// ─────────────────────────────────────────────

export function getRiskBadge(score: number) {
  const level = riskLevel(score);
  return {
    label: level.label,
    className: `${level.bg} ${level.text} border border-current/20`,
  };
}

// ─────────────────────────────────────────────
//  فلاتر URL
// ─────────────────────────────────────────────

export function buildQueryParams(
  base: Record<string, string | number | undefined>
): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(base).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "all") {
      params.set(k, String(v));
    }
  });
  return params;
}