"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LayoutTemplate, Save, Eye, EyeOff } from "lucide-react";
import { landingApi, LandingSection } from "@/lib/api/media-api";

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

function SectionEditor({ section, onSave, saving }: { section: LandingSection; onSave: (b: Partial<LandingSection>) => void; saving: boolean }) {
  const [title, setTitle] = React.useState(section.title);
  const [subtitle, setSubtitle] = React.useState(section.subtitle);
  const [content, setContent] = React.useState(section.content);
  const [buttonText, setButtonText] = React.useState(section.buttonText);
  const [buttonUrl, setButtonUrl] = React.useState(section.buttonUrl);
  const [imageUrl, setImageUrl] = React.useState(section.imageUrl ?? "");
  const [isActive, setIsActive] = React.useState(section.isActive);

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2"><LayoutTemplate className="h-4 w-4 text-indigo-500" /> {section.key}</h3>
        <button onClick={() => setIsActive(!isActive)} className="text-xs flex items-center gap-1 text-muted-foreground">
          {isActive ? <><Eye className="h-3 w-3" /> مفعّل</> : <><EyeOff className="h-3 w-3" /> مخفي</>}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="العنوان" className="rounded-lg border px-3 py-2 text-sm" />
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="العنوان الفرعي" className="rounded-lg border px-3 py-2 text-sm" />
      </div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="المحتوى" rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="نص الزر" className="rounded-lg border px-3 py-2 text-sm" />
        <input value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} placeholder="رابط الزر" className="rounded-lg border px-3 py-2 text-sm" />
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="رابط الصورة" className="rounded-lg border px-3 py-2 text-sm" />
      </div>
      <AdminButton size="sm" disabled={saving} onClick={() => onSave({ key: section.key, title, subtitle, content, buttonText, buttonUrl, imageUrl, isActive })}>
        <Save className="mr-1 h-3 w-3" /> حفظ
      </AdminButton>
    </div>
  );
}
