"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { landingApi, LandingSection } from "@/lib/api/media-api";
import { SectionEditor } from "@/components/admin/landing/section-editor";

export default function LandingBuilderPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "landing"],
    queryFn: () => landingApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (body: Partial<LandingSection>) => landingApi.upsert(body),
    onSuccess: () => {
      toast.success("تم حفظ قسم الصفحة");
      qc.invalidateQueries({ queryKey: ["admin", "landing"] });
    },
    onError: () => toast.error("فشل الحفظ"),
  });

  const sections = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="منشئ صفحات الهبوط" description="عدّل نصوص الصفحة الرئيسية دون الحاجة لمبرمج" />

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          {sections.map((s) => (
            <SectionEditor key={s.id} section={s} onSave={(b) => saveMutation.mutate(b)} saving={saveMutation.isPending} />
          ))}
          {sections.length === 0 && (
            <div className="text-center text-muted-foreground py-10">لا توجد أقسام</div>
          )}
        </div>
      )}
    </div>
  );
}
