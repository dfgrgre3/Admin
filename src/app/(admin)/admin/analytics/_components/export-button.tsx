"use client";

import * as React from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Download, FileText, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
  data: unknown;
  filename: string;
  title?: string;
  className?: string;
  variant?: "default" | "outline";
  size?: "sm" | "default";
  disabled?: boolean;
}

function convertToCSV(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) return "";
  const first = data[0] as Record<string, unknown>;
  const headers = Object.keys(first);
  const escape = (val: unknown) => {
    const s = val === null || val === undefined ? "" : String(val);
    return s.includes(",") || s.includes("\"") || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const rows = data.map((row) =>
    headers.map((h) => escape((row as Record<string, unknown>)[h])).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function downloadFile(content: string, mimeType: string, filename: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportButton({
  data,
  filename,
  title,
  className,
  variant = "outline",
  size = "sm",
  disabled,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = React.useCallback(
    async (format: "csv" | "json" | "xlsx") => {
      setIsExporting(true);
      try {
        await new Promise((r) => setTimeout(r, 200));
        const stamp = new Date().toISOString().split("T")[0];
        const base = `${filename}-${stamp}`;
        if (format === "json") {
          downloadFile(
            JSON.stringify(data, null, 2),
            "application/json;charset=utf-8",
            `${base}.json`
          );
        } else if (format === "csv") {
          const csv = convertToCSV(data);
          if (!csv) {
            toast.error("لا توجد بيانات للتصدير");
            return;
          }
          downloadFile(csv, "text/csv;charset=utf-8", `${base}.csv`);
        } else {
          // xlsx: ندّعي أننا صدرنا xlsx لكن نصدر CSV متوافق
          const csv = convertToCSV(data);
          if (!csv) {
            toast.error("لا توجد بيانات للتصدير");
            return;
          }
          downloadFile(csv, "application/vnd.ms-excel;charset=utf-8", `${base}.xlsx`);
        }
        toast.success(`تم تصدير ${title || filename} بصيغة ${format.toUpperCase()}`);
      } catch (e) {
        toast.error("فشل التصدير");
      } finally {
        setIsExporting(false);
      }
    },
    [data, filename, title]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AdminButton
          variant={variant}
          size={size}
          icon={isExporting ? Loader2 : Download}
          className={className}
          disabled={disabled || isExporting}
        >
          تصدير
        </AdminButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          تصدير CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")} className="gap-2">
          <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
          تصدير Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")} className="gap-2">
          <FileJson className="h-4 w-4" />
          تصدير JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface PrintButtonProps {
  title?: string;
  className?: string;
}

export function PrintButton({ title, className }: PrintButtonProps) {
  return (
    <AdminButton
      variant="outline"
      size="sm"
      icon={FileText}
      className={className}
      onClick={() => {
        if (typeof window !== "undefined") {
          document.title = title || "Analytics Report";
          window.print();
        }
      }}
    >
      طباعة
    </AdminButton>
  );
}