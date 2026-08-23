import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { HealthData, TimeRange } from "../_types/health";
import { adminFetch } from "@/lib/api/admin-api";
import { parseContentDispositionFilename } from "@/lib/export-utils";

export interface ExportedHealthReport {
  blob: Blob;
  filename: string;
  contentType: string;
}

export function useHealthData(timeRange: TimeRange, autoRefresh: boolean) {
  return useQuery<HealthData>({
    queryKey: ["admin", "health", timeRange],
    queryFn: async () => {
      const response = await adminFetch(
        `/api/admin/health/detailed?range=${encodeURIComponent(timeRange)}`
      );
      if (!response.ok) {
        throw new Error(`فشل في جلب بيانات الصحة (${response.status})`);
      }
      return response.json() as Promise<HealthData>;
    },
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 5000,
  });
}

function parseFilename(header: string | null): string {
  return parseContentDispositionFilename(
    header,
    `health-report-${new Date().toISOString().split("T")[0]}.csv`
  );
}

export function useExportHealthReport() {
  return useMutation<ExportedHealthReport, Error, TimeRange>({
    mutationFn: async (timeRange) => {
      const response = await adminFetch(
        `/api/admin/health/export?range=${encodeURIComponent(timeRange)}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("فشل في تصدير التقرير");

      return {
        blob: await response.blob(),
        filename: parseFilename(response.headers.get("content-disposition")),
        contentType: response.headers.get("content-type") ?? "text/csv",
      };
    },
    onSuccess: ({ blob, filename, contentType }) => {
      const url = window.URL.createObjectURL(new Blob([blob], { type: contentType }));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير تقرير الصحة بنجاح");
    },
    onError: () => toast.error("فشل في تصدير التقرير"),
  });
}
