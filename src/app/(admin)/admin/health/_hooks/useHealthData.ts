import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { HealthData, TimeRange } from "../_types/health";
import { adminFetch } from "@/lib/api/admin-api";

export function useHealthData(timeRange: TimeRange, autoRefresh: boolean) {
  return useQuery<HealthData>({
    queryKey: ["admin", "health", timeRange],
    queryFn: async () => {
      const response = await adminFetch(`/api/admin/health/detailed?range=${timeRange}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Health API Error:", response.status, errorText);
        throw new Error(`فشل في جلب بيانات الصحة: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 5000,
  });
}

export function useExportHealthReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await adminFetch("/api/admin/health/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      });

      if (!response.ok) {
        throw new Error("فشل في تصدير التقرير");
      }

      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `health-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير تقرير الصحة بنجاح");
    },
    onError: () => {
      toast.error("فشل في تصدير التقرير");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "health"] });
    },
  });
}

export function useHistoricalData(baseValue: number, variance: number, points: number = 20) {
  return () => {
    const now = new Date();
    return Array.from({ length: points }, (_, i) => {
      const time = new Date(now.getTime() - (points - 1 - i) * 60000);
      return {
        time: time.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        value: Math.max(0, baseValue + (Math.random() - 0.5) * variance),
      };
    });
  };
}