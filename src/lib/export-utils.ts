"use client";

import * as React from "react";

import { adminApi } from "@/lib/api/admin-api";

export interface ExportColumn<T = any> {
  header: string;
  accessor: string | ((row: T) => any);
}

const MAX_EXPORT_ROWS = 100_000;

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  let str = typeof value === "string" ? value : String(value);
  // Prefix formula-like values so Excel/Sheets cannot execute them as formulas.
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function resolveAccessor<T>(col: ExportColumn<T>, row: T): string {
  const value = typeof col.accessor === "function" ? col.accessor(row) : (row as any)[col.accessor];
  return escapeCsvValue(value);
}

export function exportToCSV<T>(data: T[], columns: ExportColumn<T>[], filename: string): void {
  try {
    if (data.length > MAX_EXPORT_ROWS) {
      throw new Error(`CSV export exceeds the maximum of ${MAX_EXPORT_ROWS.toLocaleString()} rows`);
    }
    const headers = columns.map(col => escapeCsvValue(col.header)).join(",");
    const rows = data.map(row => columns.map(col => resolveAccessor(col, row)).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

export function exportToJSON(data: any, filename: string): void {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

export function useExport() {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportCSV = React.useCallback(<T,>(data: T[], columns: ExportColumn<T>[], filename: string) => {
    setIsExporting(true);
    try {
      exportToCSV(data, columns, filename);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleExportJSON = React.useCallback((data: any, filename: string) => {
    setIsExporting(true);
    try {
      exportToJSON(data, filename);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportToCSV: handleExportCSV,
    exportToJSON: handleExportJSON,
  };
}

/** Shape returned by POST /api/admin/dashboard/export. */
interface DashboardExportResponse {
  exportJobId: string;
  status: string;
  downloadUrl: string | null;
  expiresAt: string;
  rowCount: number;
}

/**
 * Extracts a filename from a Content-Disposition response header, handling
 * both RFC 6266's percent-encoded `filename*=UTF-8''...` form and the plain
 * `filename="..."` form. Only the encoded form should ever be decoded — a
 * literal "%" in a plain filename is not an escape sequence, and blindly
 * running decodeURIComponent on it throws and discards an already-downloaded
 * response. Falls back to `defaultFilename` when the header is absent or
 * doesn't match either form.
 */
export function parseContentDispositionFilename(
  header: string | null,
  defaultFilename: string
): string {
  if (!header) return defaultFilename;

  const encodedMatch = /filename\*=UTF-8''([^";]+)/i.exec(header);
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1]);
    } catch {
      return defaultFilename;
    }
  }

  const plainMatch = /filename="?([^";]+)"?/i.exec(header);
  return plainMatch?.[1] ?? defaultFilename;
}

export function useDashboardExport(dateRange: { startDate: string; endDate: string }) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const exportDashboard = React.useCallback(
    async (scope: string = "summary") => {
      setIsExporting(true);
      setError(null);
      try {
        const response = await adminApi.post<DashboardExportResponse>("/dashboard/export", {
          exportScope: scope,
          fileFormat: "csv",
          dateRange,
          includeChartsMetadata: false,
          includeSensitiveFields: false,
        });

        const downloadUrl = response?.downloadUrl;
        if (downloadUrl) {
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `dashboard-${scope}-${dateRange.startDate}-${dateRange.endDate}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل تصدير البيانات");
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    [dateRange]
  );

  return { exportDashboard, isExporting, error };
}
