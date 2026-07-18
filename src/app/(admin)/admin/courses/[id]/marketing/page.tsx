"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import NextImage from "next/image";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { cn, formatPrice } from "@/lib/utils";
import {
  Globe,
  Image,
  Link2,
  Tag,
  Percent,
  Eye,
  Sparkles,
  Save,
  ExternalLink,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface CourseMarketingData {
  id: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  isFeatured: boolean;
  featuredBannerText?: string;
  featuredBadge?: string;
  originalPrice?: number;
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  whyThisCourse?: string;
  problemSolved?: string;
  whatMakesDifferent?: string;
  whyNow?: string;
  marketingSubtitle?: string;
  communityLinks?: {
    forum?: string;
    discord?: string;
    telegram?: string;
    announcements?: string;
    events?: string;
  };
  course: {
    id: string;
    name: string;
    nameAr: string;
    price: number;
    thumbnailUrl?: string;
  };
}

export default function CourseMarketingPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [mounted, setMounted] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [copiedSlug, setCopiedSlug] = React.useState(false);

  const { data: marketingData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "courses", courseId, "marketing"],
    queryFn: async (): Promise<{ data: CourseMarketingData }> => {
      const response = await adminFetch(
        `${apiRoutes.admin.courses}/${courseId}/marketing`
      );
      if (!response.ok) throw new Error("فشل تحميل بيانات التسويق");
      return (await response.json()) as { data: CourseMarketingData };
    },
    staleTime: 60_000,
  });

  const [formData, setFormData] = React.useState<Partial<CourseMarketingData>>({});

  React.useEffect(() => {
    setMounted(true);
    if (marketingData?.data) {
      setFormData(marketingData.data);
    }
  }, [marketingData]);

  const updateField = (field: keyof CourseMarketingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateCommunityLink = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      communityLinks: {
        ...prev.communityLinks,
        [platform]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await adminFetch(
        `${apiRoutes.admin.courses}/${courseId}/marketing`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "فشل حفظ البيانات");
      }

      toast.success("تم حفظ إعدادات التسويق بنجاح");
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const course = marketingData?.data?.course;
  const finalPrice = formData.discountPercentage && formData.discountPercentage > 0
    ? (course?.price || 0) * (1 - (formData.discountPercentage || 0) / 100)
    : course?.price || 0;

  if (isLoading || !mounted) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">التسويق و SEO</h2>
          <p className="text-sm font-bold text-muted-foreground mt-1">
            تحسين ظهور الدورة في محركات البحث وإدارة العروض
          </p>
        </div>
        <AdminButton
          className="gap-2 rounded-xl h-11 px-8 font-black"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-white" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          حفظ التغييرات
        </AdminButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="text-base font-black">إعدادات SEO</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  رابط الدورة (Slug)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.slug || ""}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="my-course-slug"
                    className="h-12 rounded-xl text-sm font-bold flex-1"
                    dir="ltr"
                  />
                  <AdminButton
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    onClick={() => copyToClipboard(formData.slug || "")}
                  >
                    {copiedSlug ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </AdminButton>
                </div>
                <p className="text-[10px] text-muted-foreground font-bold">
                  /courses/{formData.slug || "my-course"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  عنوان SEO
                </Label>
                <Input
                  value={formData.seoTitle || ""}
                  onChange={(e) => updateField("seoTitle", e.target.value)}
                  placeholder="عنوان الدورة لمحركات البحث"
                  className="h-12 rounded-xl text-sm font-bold"
                  maxLength={60}
                />
                <p className="text-[10px] text-muted-foreground font-bold">
                  {(formData.seoTitle || "").length}/60 حرف
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  وصف SEO
                </Label>
                <Textarea
                  value={formData.seoDescription || ""}
                  onChange={(e) => updateField("seoDescription", e.target.value)}
                  placeholder="وصف مختصر للدورة يظهر في نتائج البحث"
                  className="min-h-[100px] rounded-xl text-sm font-bold resize-none"
                  maxLength={160}
                />
                <p className="text-[10px] text-muted-foreground font-bold">
                  {(formData.seoDescription || "").length}/160 حرف
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  كلمات مفتاحية (Meta Keywords)
                </Label>
                <Input
                  value={formData.metaKeywords?.join(", ") || ""}
                  onChange={(e) =>
                    updateField(
                      "metaKeywords",
                      e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                    )
                  }
                  placeholder="تعليم, برمجة, تصميم (افصل بفاصلة)"
                  className="h-12 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  صورة Open Graph (OG Image)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.ogImageUrl || ""}
                    onChange={(e) => updateField("ogImageUrl", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="h-12 rounded-xl text-sm font-bold flex-1"
                    dir="ltr"
                  />
                </div>
                {formData.ogImageUrl && (
                  <div className="relative mt-2 h-32 w-full rounded-xl border border-border/40 overflow-hidden">
                    <NextImage
                      src={formData.ogImageUrl}
                      alt="OG Preview"
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </AdminCard>

          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-black">إعدادات التميز</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/10 p-4">
                <div>
                  <Label className="text-sm font-black">دورة مميزة</Label>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">
                    عرض الدورة في البانر الرئيسي بالصفحة الرئيسية
                  </p>
                </div>
                <Switch
                  checked={formData.isFeatured || false}
                  onCheckedChange={(checked) => updateField("isFeatured", checked)}
                />
              </div>

              {formData.isFeatured && (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">
                      نص البانر
                    </Label>
                    <Input
                      value={formData.featuredBannerText || ""}
                      onChange={(e) => updateField("featuredBannerText", e.target.value)}
                      placeholder="نص يظهر على البانر المميز"
                      className="h-12 rounded-xl text-sm font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">
                      شارة التميز
                    </Label>
                    <Input
                      value={formData.featuredBadge || ""}
                      onChange={(e) => updateField("featuredBadge", e.target.value)}
                      placeholder="مثال: الأكثر مبيعاً"
                      className="h-12 rounded-xl text-sm font-bold"
                    />
                  </div>
                </>
              )}
            </div>
          </AdminCard>

          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-base font-black">العناوين التسويقية والتفاصيل</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  العنوان الفرعي التسويقي (Marketing Subtitle)
                </Label>
                <Input
                  value={formData.marketingSubtitle || ""}
                  onChange={(e) => updateField("marketingSubtitle", e.target.value)}
                  placeholder="عنوان تشويقي يظهر أسفل العنوان الرئيسي للدورة"
                  className="h-12 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  لماذا هذه الدورة؟ (Why This Course)
                </Label>
                <Textarea
                  value={formData.whyThisCourse || ""}
                  onChange={(e) => updateField("whyThisCourse", e.target.value)}
                  placeholder="وصف أهداف الدورة وأهميتها للطالب..."
                  className="min-h-[80px] rounded-xl text-sm font-bold resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  المشكلة التي يحلها الكورس (Problem Solved)
                </Label>
                <Textarea
                  value={formData.problemSolved || ""}
                  onChange={(e) => updateField("problemSolved", e.target.value)}
                  placeholder="ما هي الصعوبات التي سيتغلب عليها الطالب بعد هذا الكورس؟..."
                  className="min-h-[80px] rounded-xl text-sm font-bold resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  ما الذي يجعله مختلفاً؟ (What Makes It Different)
                </Label>
                <Textarea
                  value={formData.whatMakesDifferent || ""}
                  onChange={(e) => updateField("whatMakesDifferent", e.target.value)}
                  placeholder="الأساليب والوسائل الحصرية المتبعة في هذه الدورة..."
                  className="min-h-[80px] rounded-xl text-sm font-bold resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  لماذا البدء الآن؟ (Why Now)
                </Label>
                <Textarea
                  value={formData.whyNow || ""}
                  onChange={(e) => updateField("whyNow", e.target.value)}
                  placeholder="أهمية البدء الفوري وجدوى تنظيم الوقت حالياً..."
                  className="min-h-[80px] rounded-xl text-sm font-bold resize-none"
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center gap-2 mb-5">
              <Link2 className="h-5 w-5 text-primary" />
              <h3 className="text-base font-black">روابط مجتمعات الدورة</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  رابط مجتمع تليجرام (Telegram)
                </Label>
                <Input
                  value={formData.communityLinks?.telegram || ""}
                  onChange={(e) => updateCommunityLink("telegram", e.target.value)}
                  placeholder="https://t.me/your_group"
                  className="h-12 rounded-xl text-sm font-bold"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  رابط خادم ديسكورد (Discord)
                </Label>
                <Input
                  value={formData.communityLinks?.discord || ""}
                  onChange={(e) => updateCommunityLink("discord", e.target.value)}
                  placeholder="https://discord.gg/your_server"
                  className="h-12 rounded-xl text-sm font-bold"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  رابط منتدى المناقشات (Forum)
                </Label>
                <Input
                  value={formData.communityLinks?.forum || ""}
                  onChange={(e) => updateCommunityLink("forum", e.target.value)}
                  placeholder="/forum/course-topic"
                  className="h-12 rounded-xl text-sm font-bold"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  رابط الإعلانات (Announcements)
                </Label>
                <Input
                  value={formData.communityLinks?.announcements || ""}
                  onChange={(e) => updateCommunityLink("announcements", e.target.value)}
                  placeholder="/announcements"
                  className="h-12 rounded-xl text-sm font-bold"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">
                  رابط الفعاليات (Events)
                </Label>
                <Input
                  value={formData.communityLinks?.events || ""}
                  onChange={(e) => updateCommunityLink("events", e.target.value)}
                  placeholder="/events"
                  className="h-12 rounded-xl text-sm font-bold"
                  dir="ltr"
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center gap-2 mb-5">
              <Percent className="h-5 w-5 text-red-500" />
              <h3 className="text-base font-black">الخصومات والعروض</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">
                    السعر الأصلي (ج.م)
                  </Label>
                  <Input
                    type="number"
                    value={course?.price || 0}
                    disabled
                    className="h-12 rounded-xl text-sm font-bold bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">
                    نسبة الخصم (%)
                  </Label>
                  <Input
                    type="number"
                    value={formData.discountPercentage || 0}
                    onChange={(e) =>
                      updateField("discountPercentage", Number(e.target.value))
                    }
                    min={0}
                    max={100}
                    className="h-12 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              {(formData.discountPercentage || 0) > 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">
                        السعر النهائي
                      </p>
                      <p className="text-2xl font-black text-emerald-500">
                        {formatPrice(finalPrice)}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-sm px-3 py-1">
                      وفر {formatPrice((course?.price || 0) - finalPrice)}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">
                    بداية الخصم
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.discountStartDate?.slice(0, 16) || ""}
                    onChange={(e) => updateField("discountStartDate", e.target.value)}
                    className="h-12 rounded-xl text-sm font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">
                    نهاية الخصم
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.discountEndDate?.slice(0, 16) || ""}
                    onChange={(e) => updateField("discountEndDate", e.target.value)}
                    className="h-12 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black">معاينة</h3>
            </div>

            <div className="space-y-3">
              {course?.thumbnailUrl && (
                <div className="relative h-32 w-full rounded-xl border border-border/40 overflow-hidden">
                  <NextImage
                    src={course.thumbnailUrl}
                    alt={course.nameAr ?? "course"}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">
                  الرابط العام
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg flex-1 overflow-hidden text-ellipsis">
                    /courses/{formData.slug || courseId}
                  </code>
                </div>
              </div>

              <AdminButton
                variant="outline"
                className="w-full gap-2 rounded-xl h-10 text-xs font-black"
                onClick={() => window.open(`/courses/${formData.slug || courseId}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                فتح الدورة في الموقع
              </AdminButton>
            </div>
          </AdminCard>

          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black">درجة SEO</h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Slug مخصص",
                  done: !!formData.slug,
                },
                {
                  label: "عنوان SEO",
                  done: !!formData.seoTitle && formData.seoTitle.length >= 30,
                },
                {
                  label: "وصف SEO",
                  done: !!formData.seoDescription && formData.seoDescription.length >= 120,
                },
                {
                  label: "صورة OG",
                  done: !!formData.ogImageUrl,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border",
                    item.done
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  )}
                >
                  <span className="text-[11px] font-bold">{item.label}</span>
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-red-500/50" />
                  )}
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="p-6 border-border/40">
            <h3 className="text-sm font-black mb-4">معلومات سريعة</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-bold">السعر الأصلي</span>
                <span className="font-black">{formatPrice(course?.price || 0)}</span>
              </div>
              {(formData.discountPercentage || 0) > 0 && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-bold">الخصم</span>
                    <span className="font-black text-red-500">
                      -{formData.discountPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-bold">السعر النهائي</span>
                    <span className="font-black text-emerald-500">
                      {formatPrice(finalPrice)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}