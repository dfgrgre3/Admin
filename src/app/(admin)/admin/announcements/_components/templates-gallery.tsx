"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutGrid,
  Search,
  Star,
  Save,
  Plus,
  Sparkles,
  Copy,
  Trash2,
  X,
  Filter,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import {
  AnnouncementTemplate,
  BUILTIN_TEMPLATES,
  TEMPLATE_CATEGORIES,
  TemplateCategory,
} from "./types";

interface TemplatesGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: AnnouncementTemplate) => void;
}

export function TemplatesGallery({
  open,
  onOpenChange,
  onSelect,
}: TemplatesGalleryProps) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<TemplateCategory | "all">("all");
  const [tab, setTab] = React.useState<"builtin" | "custom">("builtin");
  const [deleteTarget, setDeleteTarget] = React.useState<AnnouncementTemplate | null>(null);

  // جلب قوالب المستخدم
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "announcements", "templates"],
    queryFn: async () => {
      try {
        const res = await adminFetch("/api/admin/announcements/templates");
        if (!res.ok) return { templates: [] as AnnouncementTemplate[] };
        const json = await res.json();
        return {
          templates:
            (json?.data?.templates as AnnouncementTemplate[]) ||
            (json?.templates as AnnouncementTemplate[]) ||
            [],
        };
      } catch {
        return { templates: [] as AnnouncementTemplate[] };
      }
    },
    enabled: open,
    staleTime: 60000,
  });

  const customTemplates = data?.templates || [];

  // دمج القوالب المضمّنة مع قوالب المستخدم
  const allTemplates = React.useMemo(() => {
    return tab === "builtin" ? BUILTIN_TEMPLATES : customTemplates;
  }, [tab, customTemplates]);

  // تطبيق الفلاتر
  const filtered = React.useMemo(() => {
    let list = allTemplates;
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.data.title.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTemplates, category, search]);

  const handleUse = (template: AnnouncementTemplate) => {
    onSelect(template);
    toast.success(`تم تحميل قالب "${template.name}"`);
    onOpenChange(false);
  };

  const handleDelete = async (template: AnnouncementTemplate) => {
    try {
      const res = await adminFetch("/api/admin/announcements/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: template.id }),
      });
      if (res.ok) {
        toast.success("تم حذف القالب");
        refetch();
      } else {
        toast.error("فشل حذف القالب");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setDeleteTarget(null);
    }
  };

  const categories: { value: TemplateCategory | "all"; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "academic", label: TEMPLATE_CATEGORIES.academic.label },
    { value: "exam", label: TEMPLATE_CATEGORIES.exam.label },
    { value: "event", label: TEMPLATE_CATEGORIES.event.label },
    { value: "emergency", label: TEMPLATE_CATEGORIES.emergency.label },
    { value: "celebration", label: TEMPLATE_CATEGORIES.celebration.label },
    { value: "maintenance", label: TEMPLATE_CATEGORIES.maintenance.label },
    { value: "general", label: TEMPLATE_CATEGORIES.general.label },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[90vh]">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl font-black flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-violet-500" />
                    مكتبة القوالب
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-sm text-muted-foreground">
                    اختر قالباً جاهزاً لتسريع عملية إنشاء الإعلانات. يمكنك حفظ أي
                    إعلان كقالب لإعادة استخدامه لاحقاً.
                  </DialogDescription>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-full p-2 hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </DialogHeader>

            {/* تبويبات */}
            <div className="mb-6 flex items-center gap-2 border-b border-white/5">
              <button
                onClick={() => setTab("builtin")}
                className={cn(
                  "relative px-4 py-2 text-sm font-black transition",
                  tab === "builtin"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Star className="h-3.5 w-3.5 inline ml-1.5" />
                قوالب النظام
                {tab === "builtin" && (
                  <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
              <button
                onClick={() => setTab("custom")}
                className={cn(
                  "relative px-4 py-2 text-sm font-black transition",
                  tab === "custom"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5 inline ml-1.5" />
                قوالبك
                {tab === "custom" && (
                  <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            </div>

            {/* الفلاتر */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في القوالب..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider transition border",
                      category === cat.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-white/10 hover:bg-white/5 text-muted-foreground"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* شبكة القوالب */}
            {isLoading && tab === "custom" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/2.5 py-12 text-center">
                <LayoutGrid className="h-10 w-10 opacity-30" />
                <p className="text-sm font-bold text-muted-foreground">
                  لا توجد قوالب مطابقة
                </p>
                {tab === "custom" && (
                  <p className="text-xs text-muted-foreground/70">
                    احفظ أي إعلان كقالب من خلال نافذة التعديل
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((template) => {
                  const catConfig = TEMPLATE_CATEGORIES[template.category];
                  const Icon = catConfig.icon;
                  return (
                    <div
                      key={template.id}
                      className="group relative rounded-2xl border border-white/10 bg-white/2.5 p-5 transition hover:border-primary/40 hover:bg-white/5"
                    >
                      {/* الشارات */}
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-black uppercase tracking-wider rounded-md border",
                            catConfig.color
                          )}
                        >
                          <Icon className="h-3 w-3 ml-1" />
                          {catConfig.label}
                        </Badge>
                        {template.id.startsWith("builtin-") && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>

                      {/* العنوان والوصف */}
                      <h3 className="text-base font-black tracking-tight mb-1">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {template.description}
                        </p>
                      )}

                      {/* معاينة المحتوى */}
                      <div className="mb-4 rounded-lg border border-white/5 bg-black/20 p-3 text-[11px] text-muted-foreground line-clamp-3">
                        <p className="font-bold text-foreground/80">
                          {template.data.title}
                        </p>
                        <p
                          className="mt-1"
                          dangerouslySetInnerHTML={{
                            __html: template.data.content.replace(/<[^>]*>/g, " "),
                          }}
                        />
                      </div>

                      {/* البيانات الوصفية */}
                      <div className="mb-4 flex items-center gap-2 flex-wrap text-[10px]">
                        <Badge
                          variant="outline"
                          className="bg-white/5 border-white/10"
                        >
                          {template.data.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-white/5 border-white/10"
                        >
                          {template.data.priority}
                        </Badge>
                        {template.usageCount > 0 && (
                          <span className="text-muted-foreground font-bold">
                            • {template.usageCount} استخدام
                          </span>
                        )}
                      </div>

                      {/* الأزرار */}
                      <div className="flex items-center gap-2">
                        <AdminButton
                          size="sm"
                          rounded="lg"
                          icon={Copy}
                          onClick={() => handleUse(template)}
                          className="flex-1"
                        >
                          استخدام
                        </AdminButton>
                        {tab === "custom" && !template.id.startsWith("builtin-") && (
                          <button
                            onClick={() => setDeleteTarget(template)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition"
                            title="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AdminConfirm
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="حذف القالب؟"
        description={`هل تريد حذف قالب "${deleteTarget?.name}"؟ لا يمكن التراجع.`}
        confirmText="حذف"
        variant="destructive"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </>
  );
}

/**
 * زر فتح مكتبة القوالب (يُستخدم في شريط الأدوات)
 */
export function TemplatesButton({ onClick }: { onClick: () => void }) {
  return (
    <AdminButton
      icon={LayoutGrid}
      variant="outline"
      size="sm"
      rounded="lg"
      onClick={onClick}
    >
      <Sparkles className="h-3.5 w-3.5 ml-1.5 text-violet-500" />
      القوالب
    </AdminButton>
  );
}