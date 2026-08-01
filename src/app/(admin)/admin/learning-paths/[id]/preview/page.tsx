"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Award, Clock, Layers, Check, Lock, ArrowRight, Star } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { formatPrice } from "@/lib/utils";

interface PreviewItem {
  subjectId: string;
  order: number;
  isRequired: boolean;
  subject?: { id: string; name: string } | null;
}

interface PreviewPath {
  id: string;
  name: string;
  nameAr?: string | null;
  slug?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  level: string;
  price: number;
  isActive: boolean;
  isPublished: boolean;
  estimatedHours: number;
  certificateId?: string | null;
  items: PreviewItem[];
}

export default function LearningPathPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.id as string;

  const { data: path, isLoading } = useQuery({
    queryKey: ["admin", "learning-paths", "preview", pathId],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.learningPathById(pathId));
      const result = await response.json();
      return result.data as PreviewPath;
    },
    enabled: !!pathId,
  });

  const sortedItems = React.useMemo(
    () => (path?.items || []).slice().sort((a, b) => a.order - b.order),
    [path]
  );

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="معاينة المسار (كطالب)"
        description="هكذا يظهر مسار التعلّم للطلاب في الواجهة العامة."
        badge={path?.isPublished ? "منشور" : "مسودة"}
      >
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton variant="outline" icon={ArrowLeft} onClick={() => router.push("/admin/learning-paths")}>
            العودة للمسارات
          </AdminButton>
          <AdminButton icon={ArrowRight} onClick={() => router.push(`/admin/learning-paths/${pathId}`)}>
            تعديل المسار
          </AdminButton>
        </div>
      </PageHeader>

      {isLoading ? (
        <AdminCard className="animate-pulse space-y-4 p-8">
          <div className="h-6 w-1/3 rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </AdminCard>
      ) : !path ? (
        <AdminCard className="p-8 text-center text-muted-foreground">تعذّر تحميل بيانات المسار.</AdminCard>
      ) : (
        <>
          {/* Hero */}
          <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-br from-primary/10 via-card/30 to-violet-500/10 p-8">
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-[80px]" />
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-bold">
                    {path.level}
                  </Badge>
                  {path.certificateId && (
                    <Badge className="gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-600">
                      <Award className="h-3 w-3" /> شهادة إتمام
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-black tracking-tight">
                  {path.nameAr || path.name}
                </h1>
                {path.description && (
                  <p className="max-w-2xl text-muted-foreground">{path.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4" /> {sortedItems.length} دورة
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {path.estimatedHours} ساعة
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-3xl font-black text-primary">{formatPrice(path.price)}</span>
                  <AdminButton icon={Check}>سجّل الآن</AdminButton>
                </div>
              </div>
              {path.thumbnailUrl && (
                <img
                  src={path.thumbnailUrl}
                  alt={path.name}
                  loading="lazy"
                  decoding="async"
                  className="h-40 w-64 rounded-2xl object-cover shadow-xl"
                />
              )}
            </div>
          </div>

          {/* Curriculum timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-black">محتوى المسار</h2>
            <div className="space-y-3">
              {sortedItems.map((item, idx) => (
                <div
                  key={item.subjectId}
                  className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card/40 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-black text-primary">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="font-bold">
                      {item.subject?.name || item.subjectId}
                    </p>
                    {item.isRequired ? (
                      <span className="text-xs text-muted-foreground">دورة مطلوبة</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">دورة اختيارية</span>
                    )}
                  </div>
                  {item.isRequired ? (
                    <Lock className="h-4 w-4 text-primary" />
                  ) : (
                    <Star className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              ))}
              {sortedItems.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border/50 p-6 text-center text-muted-foreground">
                  لا توجد دورات مرتبطة بهذا المسار بعد.
                </p>
              )}
            </div>
          </div>

          {/* Certificate CTA */}
          {path.certificateId && (
            <AdminCard className="flex items-center gap-4 bg-emerald-500/5 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold">شهادة إتمام معتمدة</p>
                <p className="text-sm text-muted-foreground">
                  يحصل الطالب على شهادة فور إكمال جميع الدورات المطلوبة في المسار.
                </p>
              </div>
            </AdminCard>
          )}
        </>
      )}
    </div>
  );
}
