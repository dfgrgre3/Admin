"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Loader2,
  Calendar,
  Filter,
  Printer,
  BarChart3,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Announcement } from "./types";

interface PdfReportExportProps {
  className?: string;
  /** معرّف إعلان محدد (اختياري - لإنشاء تقرير إعلان واحد) */
  announcementId?: string;
}

type ReportType = "single" | "summary" | "analytics" | "audit";
type ReportPeriod = "7d" | "30d" | "90d" | "1y" | "all";

const REPORT_TYPE_META: Record<ReportType, { label: string; description: string; icon: React.ElementType }> = {
  single: { label: "تقرير إعلان مفرد", description: "تفاصيل إعلان واحد + إحصائياته", icon: FileText },
  summary: { label: "ملخص الإعلانات", description: "قائمة بكل الإعلانات في الفترة", icon: FileText },
  analytics: { label: "تقرير تحليلي", description: "تحليلات تفصيلية + رسوم بيانية", icon: BarChart3 },
  audit: { label: "سجل المراجعة", description: "كل التغييرات في الفترة", icon: Clock },
};

const PERIOD_META: Record<ReportPeriod, string> = {
  "7d": "آخر 7 أيام",
  "30d": "آخر 30 يوم",
  "90d": "آخر 90 يوم",
  "1y": "آخر سنة",
  all: "كل الفترات",
};

/**
 * مكوّن تصدير PDF - ينشئ تقارير قابلة للطباعة بصيغ متعددة
 * يستخدم طباعة HTML مع @media print لإنشاء PDF احترافي
 */
export function PdfReportExport({ className, announcementId }: PdfReportExportProps) {
  const [open, setOpen] = React.useState(false);
  const [reportType, setReportType] = React.useState<ReportType>(announcementId ? "single" : "summary");
  const [period, setPeriod] = React.useState<ReportPeriod>("30d");
  const [generating, setGenerating] = React.useState(false);

  const { data: announcements } = useQuery({
    queryKey: ["admin", "announcements", "for-pdf", announcementId, period],
    queryFn: async () => {
      const url = announcementId
        ? `/api/admin/announcements/${announcementId}`
        : `/api/admin/announcements?limit=100&period=${period}`;
      const res = await adminFetch(url);
      if (!res.ok) return { items: [] as Announcement[], single: null as Announcement | null };
      const json = await res.json();
      if (announcementId) {
        const item =
          (json?.data?.announcement as Announcement) ||
          (json?.data as Announcement) ||
          (json?.announcement as Announcement) ||
          (json as Announcement) ||
          null;
        return { items: item ? [item] : [], single: item };
      }
      return {
        items:
          (json?.data?.items as Announcement[]) ||
          (json?.data?.announcements as Announcement[]) ||
          (json?.items as Announcement[]) ||
          [],
        single: null,
      };
    },
    enabled: open,
    staleTime: 30000,
  });

  const generatePdf = async () => {
    setGenerating(true);
    try {
      const html = buildReportHtml({
        type: reportType,
        period,
        announcements: announcements?.items || [],
        generatedAt: new Date().toISOString(),
      });

      // إنشاء نافذة جديدة للطباعة/الحفظ كـ PDF
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) {
        toast.error("لم نتمكن من فتح نافذة الطباعة. تأكد من تفعيل popups.");
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      // انتظار تحميل الصور ثم الطباعة
      await new Promise((r) => setTimeout(r, 500));
      printWindow.focus();
      printWindow.print();
      toast.success("تم إنشاء التقرير - احفظه كـ PDF من نافذة الطباعة");
    } catch (err) {
      console.error(err);
      toast.error("فشل إنشاء التقرير");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)} dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-500">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black">تصدير PDF</h3>
            <p className="text-[10px] font-bold text-muted-foreground">
              ولّد تقارير احترافية قابلة للطباعة
            </p>
          </div>
        </div>
        <AdminButton
          type="button"
          variant="outline"
          size="sm"
          icon={FileText}
          onClick={() => setOpen(true)}
        >
          إنشاء تقرير
        </AdminButton>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-rose-500" />
              إنشاء تقرير PDF
            </DialogTitle>
            <DialogDescription>
              اختر نوع التقرير والفترة الزمنية. سيتم فتح نافذة الطباعة.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {!announcementId && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  نوع التقرير
                </label>
                <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(REPORT_TYPE_META) as ReportType[]).map((t) => {
                      const meta = REPORT_TYPE_META[t];
                      return (
                        <SelectItem key={t} value={t}>
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="font-black">{meta.label}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{meta.description}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                الفترة الزمنية
              </label>
              <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PERIOD_META) as ReportPeriod[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PERIOD_META[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading(announcements) && (
              <Skeleton className="h-20 w-full rounded-lg" />
            )}

            {!isLoading(announcements) && (announcements?.items.length ?? 0) === 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold text-amber-700">
                لا توجد بيانات في الفترة المختارة
              </div>
            )}

            {!isLoading(announcements) && (announcements?.items.length ?? 0) > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/2.5 p-3 text-xs">
                <p className="font-black">
                  سيتم تضمين <span className="text-rose-500">{announcements?.items.length}</span> إعلان
                  في التقرير
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted-foreground">
                  التقرير يحتوي على: بيانات وصفية + إحصائيات + توقيع زمني
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
            <AdminButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              إلغاء
            </AdminButton>
            <AdminButton
              type="button"
              variant="gradient"
              icon={generating ? Loader2 : Download}
              disabled={generating || (announcements?.items.length ?? 0) === 0}
              onClick={generatePdf}
              className={generating ? "animate-spin" : ""}
            >
              {generating ? "جاري الإنشاء..." : "إنشاء وطباعة"}
            </AdminButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────── بناء HTML للتقرير ───────── */

function isLoading<T>(data: T | undefined): boolean {
  return data === undefined;
}

function buildReportHtml(opts: {
  type: ReportType;
  period: ReportPeriod;
  announcements: Announcement[];
  generatedAt: string;
}): string {
  const { type, period, announcements, generatedAt } = opts;
  const totals = announcements.reduce(
    (acc, a) => {
      const m = a.metrics;
      acc.views += m?.views || 0;
      acc.clicks += m?.clicks || 0;
      acc.delivered += m?.delivered || 0;
      acc.read += m?.read || 0;
      if (a.isActive) acc.active++;
      else acc.inactive++;
      if (a.priority === "HIGH") acc.high++;
      if (a.requiresApproval) acc.approval++;
      return acc;
    },
    { views: 0, clicks: 0, delivered: 0, read: 0, active: 0, inactive: 0, high: 0, approval: 0 }
  );

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>تقرير الإعلانات - ${formatDate(generatedAt)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Tahoma, sans-serif;
    background: #fff;
    color: #111;
    padding: 32px;
    font-size: 13px;
    line-height: 1.6;
  }
  .header { border-bottom: 3px solid #dc2626; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 28px; color: #dc2626; font-weight: 900; }
  .header .meta { color: #666; font-size: 11px; margin-top: 4px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .stat {
    border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px;
    background: linear-gradient(135deg, #fafafa, #fff);
  }
  .stat .label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
  .stat .value { font-size: 22px; font-weight: 900; color: #111; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px; }
  th, td { padding: 8px 10px; text-align: right; border-bottom: 1px solid #e5e7eb; }
  th { background: #fafafa; font-weight: 900; color: #444; text-transform: uppercase; font-size: 10px; }
  tr:hover { background: #fafafa; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 900; }
  .b-info { background: #dbeafe; color: #1e40af; }
  .b-success { background: #dcfce7; color: #15803d; }
  .b-warning { background: #fef3c7; color: #a16207; }
  .b-error { background: #fee2e2; color: #b91c1c; }
  .b-gray { background: #f3f4f6; color: #374151; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 10px; }
  @media print {
    body { padding: 16px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="header">
  <h1>📢 تقرير الإعلانات</h1>
  <div class="meta">
    <strong>نوع التقرير:</strong> ${REPORT_TYPE_META[type].label} |
    <strong>الفترة:</strong> ${PERIOD_META[period]} |
    <strong>تاريخ الإنشاء:</strong> ${formatDateTime(generatedAt)}
  </div>
</div>

<div class="stats">
  <div class="stat">
    <div class="label">إجمالي الإعلانات</div>
    <div class="value">${announcements.length}</div>
  </div>
  <div class="stat">
    <div class="label">نشط</div>
    <div class="value">${totals.active}</div>
  </div>
  <div class="stat">
    <div class="label">إجمالي المشاهدات</div>
    <div class="value">${totals.views.toLocaleString("ar-EG")}</div>
  </div>
  <div class="stat">
    <div class="label">إجمالي النقرات</div>
    <div class="value">${totals.clicks.toLocaleString("ar-EG")}</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>العنوان</th>
      <th>النوع</th>
      <th>الأولوية</th>
      <th>الحالة</th>
      <th>المشاهدات</th>
      <th>النقرات</th>
      <th>CTR</th>
      <th>التاريخ</th>
    </tr>
  </thead>
  <tbody>
    ${announcements.map((a) => {
      const m = a.metrics;
      const views = m?.views || 0;
      const clicks = m?.clicks || 0;
      const delivered = m?.delivered || 0;
      const ctr = delivered > 0 ? ((clicks / delivered) * 100).toFixed(1) + "%" : "—";
      const typeClass =
        a.type === "INFO" ? "b-info" :
        a.type === "SUCCESS" ? "b-success" :
        a.type === "WARNING" ? "b-warning" :
        "b-error";
      return `
        <tr>
          <td><strong>${escapeHtml(a.title)}</strong></td>
          <td><span class="badge ${typeClass}">${a.type}</span></td>
          <td>${a.priority === "HIGH" ? '<span class="badge b-error">عالي</span>' : a.priority === "MEDIUM" ? '<span class="badge b-warning">متوسط</span>' : '<span class="badge b-info">منخفض</span>'}</td>
          <td>${a.isActive ? '<span class="badge b-success">نشط</span>' : '<span class="badge b-gray">متوقف</span>'}</td>
          <td>${views.toLocaleString("ar-EG")}</td>
          <td>${clicks.toLocaleString("ar-EG")}</td>
          <td>${ctr}</td>
          <td>${formatDate(a.createdAt)}</td>
        </tr>`;
    }).join("")}
  </tbody>
</table>

<div class="footer">
  تم إنشاء هذا التقرير آلياً من نظام إدارة الإعلانات © ${new Date().getFullYear()}
</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c] || c;
  });
}

/**
 * Hook مساعد لإنشاء ملف CSV من قائمة إعلانات
 */
export function useExportAnnouncementsCsv() {
  return React.useCallback(async (ids?: string[]) => {
    const url = ids && ids.length > 0
      ? `/api/admin/announcements?ids=${ids.join(",")}&limit=100`
      : `/api/admin/announcements?limit=1000`;
    const res = await adminFetch(url);
    if (!res.ok) {
      toast.error("فشل تحميل البيانات");
      return;
    }
    const json = await res.json();
    const items: Announcement[] =
      (json?.data?.items as Announcement[]) ||
      (json?.data?.announcements as Announcement[]) ||
      (json?.items as Announcement[]) ||
      [];

    const headers = ["ID", "العنوان", "النوع", "الأولوية", "الحالة", "المشاهدات", "النقرات", "التسليم", "تاريخ الإنشاء"];
    const rows = items.map((a) => [
      a.id,
      `"${(a.title || "").replace(/"/g, '""')}"`,
      a.type,
      a.priority,
      a.isActive ? "نشط" : "متوقف",
      a.metrics?.views || 0,
      a.metrics?.clicks || 0,
      a.metrics?.delivered || 0,
      a.createdAt,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `announcements-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
    toast.success(`تم تصدير ${items.length} إعلان كـ CSV`);
  }, []);
}