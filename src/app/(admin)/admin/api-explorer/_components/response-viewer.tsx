"use client";

/**
 * لوحة عرض الاستجابة: الحالة، الزمن، الحجم، التبويبات (Body / Headers / Cookies).
 */

import * as React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Globe,
  Code2,
  Key,
  Copy,
  Download,
  FileText,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ResponseRecord } from "../_types/api-explorer";
import { cn } from "@/lib/utils";

interface ResponseViewerProps {
  response: ResponseRecord | null;
  loading: boolean;
}

function statusColor(status: number): string {
  if (status === 0) return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  if (status >= 200 && status < 300) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (status >= 300 && status < 400) return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  if (status >= 400 && status < 500) return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  if (status >= 500) return "bg-rose-500/15 text-rose-300 border-rose-500/30";
  return "bg-slate-500/15 text-slate-300 border-slate-500/30";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function tryFormatJson(source: string): { kind: "json"; value: string } | { kind: "text"; value: string } {
  if (!source) return { kind: "text", value: "" };
  const trimmed = source.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      return { kind: "json", value: JSON.stringify(parsed, null, 2) };
    } catch {
      return { kind: "text", value: source };
    }
  }
  return { kind: "text", value: source };
}

export function ResponseViewer({ response, loading }: ResponseViewerProps): React.ReactElement {
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3" dir="rtl">
        <div className="relative h-12 w-12">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <span className="absolute inset-2 animate-pulse rounded-full bg-primary/60" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">جاري إرسال الطلب…</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="grid h-full place-items-center" dir="rtl">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-white/10">
            <Globe className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            لم يتم إرسال أي طلب بعد
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            اضغط «إرسال» في الأعلى لاختبار المسار
          </p>
        </div>
      </div>
    );
  }

  const formatted = tryFormatJson(response.body);
  const isJson = response.contentType.includes("application/json") || formatted.kind === "json";

  return (
    <div className="flex h-full flex-col" dir="rtl">
      {/* ترويسة الحالة */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <Badge variant="outline" className={cn("h-7 border px-2 text-xs font-black", statusColor(response.status))}>
          {response.status === 0 ? "—" : response.status} {response.statusText}
        </Badge>

        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {response.durationMs} مللي ثانية
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Database className="h-3.5 w-3.5" />
          {formatBytes(response.sizeBytes)}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Globe className="h-3.5 w-3.5" />
          {response.contentType || "—"}
        </span>

        <div className="ms-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(response.body);
              toast.success("تم نسخ الجسم");
            }}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Copy className="h-3 w-3" />
            نسخ
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const blob = new Blob([response.body], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `response-${response.timestamp}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Download className="h-3 w-3" />
            تنزيل
          </Button>
        </div>
      </div>

      {/* رسائل الخطأ */}
      {response.networkError ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{response.networkError}</span>
        </div>
      ) : null}

      {/* التبويبات */}
      <Tabs defaultValue="body" className="mt-3 flex flex-1 flex-col overflow-hidden">
        <TabsList className="grid h-9 w-full grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
          <TabsTrigger value="body" className="gap-1.5 rounded-lg text-xs font-bold">
            <FileText className="h-3.5 w-3.5" />
            الجسم
          </TabsTrigger>
          <TabsTrigger value="headers" className="gap-1.5 rounded-lg text-xs font-bold">
            <Key className="h-3.5 w-3.5" />
            الرؤوس ({Object.keys(response.headers).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="mt-2 flex-1 overflow-hidden">
          <div className="h-full overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4">
            {response.body ? (
              <pre
                dir="ltr"
                className="whitespace-pre-wrap break-all font-mono text-[11px] leading-6 text-foreground/90"
              >
                {isJson ? formatted.value : response.body}
              </pre>
            ) : (
              <p className="text-center text-xs text-muted-foreground">لا يوجد محتوى</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="headers" className="mt-2 flex-1 overflow-hidden">
          <div className="h-full overflow-auto rounded-2xl border border-white/10 bg-black/30 p-3">
            {Object.keys(response.headers).length === 0 ? (
              <p className="text-center text-xs text-muted-foreground">لا توجد رؤوس</p>
            ) : (
              <table className="w-full text-start" dir="ltr">
                <thead className="sticky top-0 bg-black/50 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1 text-start font-bold">Header</th>
                    <th className="px-2 py-1 text-start font-bold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(response.headers).map(([k, v]) => (
                    <tr key={k} className="border-t border-white/5">
                      <td className="px-2 py-1 font-mono text-[11px] font-bold text-primary">{k}</td>
                      <td className="px-2 py-1 font-mono text-[11px] text-foreground/80 break-all">
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* وصلة الرموز السريعة في الأسفل */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
        {response.ok ? (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            استجابة ناجحة
          </span>
        ) : (
          <span className="flex items-center gap-1 text-rose-400">
            <AlertTriangle className="h-3 w-3" />
            استجابة فاشلة
          </span>
        )}
        <span>·</span>
        <span className="font-mono">{new Date(response.timestamp).toLocaleString("ar-EG")}</span>
      </div>
    </div>
  );
}
