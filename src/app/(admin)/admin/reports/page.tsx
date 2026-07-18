"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Play, Save, Plus, Trash2 } from "lucide-react";
import {
  analyticsApi, REPORT_DATASETS, REPORT_OPERATORS,
  ReportFilter,
} from "@/lib/api/analytics-api";

export default function ReportsBuilderPage() {
  const qc = useQueryClient();
  const [dataset, setDataset] = React.useState("User");
  const [columns, setColumns] = React.useState<string[]>(["name", "email", "role"]);
  const [filters, setFilters] = React.useState<ReportFilter[]>([]);
  const [limit, setLimit] = React.useState(100);
  const [result, setResult] = React.useState<Record<string, unknown>[] | null>(null);

  const ds = REPORT_DATASETS.find((d) => d.value === dataset)!;

  const runMutation = useMutation({
    mutationFn: () => analyticsApi.buildReport({ dataset, columns, filters, limit }),
    onSuccess: (res) => { setResult(res.rows); toast.success(`تم جلب ${res.count} صف`); },
    onError: () => toast.error("فشل بناء التقرير"),
  });

  const saveMutation = useMutation({
    mutationFn: () => analyticsApi.saveReport({ name: `تقرير ${ds.label} - ${new Date().toLocaleDateString("ar-EG")}`, spec: { dataset, columns, filters, limit } }),
    onSuccess: () => { toast.success("تم حفظ التقرير"); qc.invalidateQueries({ queryKey: ["admin", "reports"] }); },
    onError: () => toast.error("فشل الحفظ"),
  });

  const toggleCol = (c: string) =>
    setColumns((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <div className="space-y-6">
      <PageHeader title="مولد التقارير المخصص" description="اسحب وحدد الأعمدة والفلاتر لبناء تقريرك بنفسك (محرك استعلام آمن)" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Builder */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-lg border p-4 space-y-3">
            <label className="text-sm font-medium">مجموعة البيانات</label>
            <select value={dataset} onChange={(e) => { setDataset(e.target.value); setColumns([]); }} className="w-full rounded-lg border px-3 py-2 text-sm">
              {REPORT_DATASETS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium">الأعمدة</p>
            <div className="flex flex-wrap gap-2">
              {ds.columns.map((c) => (
                <button key={c} onClick={() => toggleCol(c)}
                  className={`rounded-full px-3 py-1 text-xs ${columns.includes(c) ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium">الفلاتر</p>
            {filters.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select value={f.column} onChange={(e) => updateFilter(setFilters, i, "column", e.target.value)} className="rounded border px-2 py-1 text-xs flex-1">
                  {ds.columns.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={f.operator} onChange={(e) => updateFilter(setFilters, i, "operator", e.target.value)} className="rounded border px-2 py-1 text-xs">
                  {REPORT_OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {!["IS NULL", "IS NOT NULL"].includes(f.operator) && (
                  <input value={String(f.value ?? "")} onChange={(e) => updateFilter(setFilters, i, "value", e.target.value)}
                    className="rounded border px-2 py-1 text-xs w-20" placeholder="قيمة" />
                )}
                <button onClick={() => setFilters((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3 text-red-500" /></button>
              </div>
            ))}
            <AdminButton size="sm" variant="outline" onClick={() => setFilters((p) => [...p, { column: ds.columns[0] ?? "", operator: "=", value: "" }])}>
              <Plus className="mr-1 h-3 w-3" /> فلتر
            </AdminButton>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <label className="text-sm font-medium">الحد الأقصى للصفوف: {limit}</label>
            <input type="range" min={10} max={1000} step={10} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full" />
            <div className="flex gap-2">
              <AdminButton onClick={() => runMutation.mutate()} disabled={runMutation.isPending || columns.length === 0}>
                <Play className="mr-1 h-4 w-4" /> تشغيل
              </AdminButton>
              <AdminButton variant="outline" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                <Save className="mr-1 h-4 w-4" /> حفظ
              </AdminButton>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-2 rounded-lg border overflow-x-auto">
          {result === null ? (
            <div className="p-10 text-center text-muted-foreground">شغّل التقرير لعرض النتائج</div>
          ) : result.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">لا توجد نتائج مطابقة</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>{Object.keys(result[0] ?? {}).map((k) => <th key={k} className="p-2 text-right">{k}</th>)}</tr>
              </thead>
              <tbody>
                {result.map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((v, j) => <td key={j} className="p-2 max-w-xs truncate">{String(v ?? "-")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function updateFilter(set: React.Dispatch<React.SetStateAction<ReportFilter[]>>, idx: number, key: keyof ReportFilter, val: unknown) {
  set((prev) => prev.map((f, i) => (i === idx ? { ...f, [key]: val } : f)));
}
