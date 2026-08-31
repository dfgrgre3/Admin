"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FlaskConical,
  Trophy,
  Eye,
  MousePointerClick,
  Plus,
  Trash2,
  TrendingUp,
  X,
  PlayCircle,
  StopCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import {
  ABTest,
  ABTestStatus,
  ABTestVariant,
  AB_GOAL_OPTIONS,
  Announcement,
  TYPE_OPTIONS,
} from "./types";

interface ABTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onComplete?: () => void;
}

export function ABTestDialog({
  open,
  onOpenChange,
  announcement,
  onComplete,
}: ABTestDialogProps) {
  const [name, setName] = React.useState("");
  const [goal, setGoal] = React.useState<(typeof AB_GOAL_OPTIONS)[number]["value"]>("ctr");
  const [variants, setVariants] = React.useState<ABTestVariant[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // تهيئة البيانات عند فتح
  React.useEffect(() => {
    if (open && announcement) {
      setName(`اختبار: ${announcement.title}`);
      setVariants([
        {
          id: "v1",
          name: "النسخة A (الأصلية)",
          weight: 50,
          data: {
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
          },
        },
        {
          id: "v2",
          name: "النسخة B",
          weight: 50,
          data: {
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
          },
        },
      ]);
    }
  }, [open, announcement]);

  const totalWeight = variants.reduce((s, v) => s + v.weight, 0);

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `v${prev.length + 1}`,
        name: `النسخة ${String.fromCharCode(65 + prev.length)}`,
        weight: 0,
        data: {
          title: announcement?.title || "",
          content: announcement?.content || "",
        },
      },
    ]);
  };

  const updateVariant = (idx: number, patch: Partial<ABTestVariant>) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, ...patch } : v))
    );
  };

  const updateVariantData = (
    idx: number,
    patch: Partial<ABTestVariant["data"]>
  ) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === idx ? { ...v, data: { ...v.data, ...patch } } : v
      )
    );
  };

  const handleStart = async () => {
    if (!announcement) return;
    if (variants.length < 2) {
      toast.error("يلزم وجود نسختين على الأقل");
      return;
    }
    if (totalWeight !== 100) {
      toast.error(`مجموع الأوزان يجب أن يساوي 100 (الحالي: ${totalWeight})`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminFetch(
        `/api/admin/announcements/${announcement.id}/ab-test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            goalMetric: goal,
            variants,
          }),
        }
      );
      if (res.ok) {
        toast.success("تم بدء اختبار A/B بنجاح");
        onComplete?.();
        onOpenChange(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string })?.error || "فشل بدء الاختبار");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[90vh]">
        <div className="h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500" />
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
          <DialogHeader className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <FlaskConical className="h-6 w-6 text-fuchsia-500" />
                  اختبار A/B
                </DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  قارن بين نسخ مختلفة من الإعلان لاكتشاف الأفضل أداءً
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-full p-2 hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            {/* اسم الاختبار والمعيار */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                  اسم الاختبار
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اختبار العناوين"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                  معيار النجاح
                </label>
                <Select
                  value={goal}
                  onValueChange={(v) => setGoal(v as typeof goal)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AB_GOAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* النسخ */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider">
                  النسخ ({variants.length})
                </p>
                <AdminButton
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={handleAddVariant}
                >
                  إضافة نسخة
                </AdminButton>
              </div>

              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <VariantCard
                    key={v.id}
                    variant={v}
                    index={idx}
                    onUpdate={(patch) => updateVariant(idx, patch)}
                    onUpdateData={(patch) => updateVariantData(idx, patch)}
                    onRemove={() =>
                      setVariants((prev) => prev.filter((_, i) => i !== idx))
                    }
                    canRemove={variants.length > 2}
                  />
                ))}
              </div>
            </div>

            {/* ملخص الأوزان */}
            <div
              className={cn(
                "rounded-xl border p-3 flex items-center justify-between",
                totalWeight === 100
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              )}
            >
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={cn(
                    "h-4 w-4",
                    totalWeight === 100 ? "text-emerald-500" : "text-amber-500"
                  )}
                />
                <span className="text-xs font-black">مجموع الأوزان</span>
              </div>
              <span
                className={cn(
                  "text-sm font-black font-mono",
                  totalWeight === 100 ? "text-emerald-500" : "text-amber-500"
                )}
              >
                {totalWeight}%
              </span>
            </div>

            {/* أزرار */}
            <div className="flex items-center gap-2 justify-end">
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                إلغاء
              </AdminButton>
              <AdminButton
                icon={PlayCircle}
                size="sm"
                onClick={handleStart}
                loading={submitting}
              >
                بدء الاختبار
              </AdminButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VariantCard({
  variant,
  index,
  onUpdate,
  onUpdateData,
  onRemove,
  canRemove,
}: {
  variant: ABTestVariant;
  index: number;
  onUpdate: (patch: Partial<ABTestVariant>) => void;
  onUpdateData: (patch: Partial<ABTestVariant["data"]>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const colors = [
    "border-blue-500/30 bg-blue-500/5",
    "border-fuchsia-500/30 bg-fuchsia-500/5",
    "border-emerald-500/30 bg-emerald-500/5",
    "border-amber-500/30 bg-amber-500/5",
  ];

  return (
    <div className={cn("rounded-2xl border p-4", colors[index % colors.length])}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Input
          value={variant.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="max-w-xs font-black"
        />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {variant.weight}%
          </Badge>
          {canRemove && (
            <button
              onClick={onRemove}
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5 block">
          الوزن (%)
        </label>
        <Input
          type="number"
          min={0}
          max={100}
          value={variant.weight}
          onChange={(e) =>
            onUpdate({ weight: parseInt(e.target.value) || 0 })
          }
        />
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5 block">
            العنوان
          </label>
          <Input
            value={variant.data.title}
            onChange={(e) => onUpdateData({ title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5 block">
            المحتوى
          </label>
          <Textarea
            value={variant.data.content}
            onChange={(e) => onUpdateData({ content: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

/** بطاقة عرض نتائج A/B Test الجارية */
export function ABTestResults({
  test,
  onDeclareWinner,
}: {
  test: ABTest;
  onDeclareWinner: (variantId: string) => void;
}) {
  const sortedVariants = [...test.variants].sort(
    (a, b) => (b.metrics?.ctr || 0) - (a.metrics?.ctr || 0)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-fuchsia-500" />
        <p className="text-xs font-black uppercase tracking-wider">
          نتائج اختبار A/B
        </p>
        <Badge variant="outline" className="text-[10px]">
          {test.status === "running" ? "قيد التشغيل" : test.status}
        </Badge>
      </div>

      {sortedVariants.map((v, i) => {
        const isWinner = i === 0 && test.status === "completed";
        return (
          <div
            key={v.id}
            className={cn(
              "rounded-xl border p-3 flex items-center gap-3",
              isWinner
                ? "border-amber-500/50 bg-amber-500/5"
                : "border-white/10 bg-white/2.5"
            )}
          >
            {isWinner && <Trophy className="h-4 w-4 text-amber-500" />}
            <div className="flex-1">
              <p className="text-xs font-black">{v.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {v.metrics?.views || 0} مشاهدة •{" "}
                {v.metrics?.clicks || 0} نقرة
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-fuchsia-500">
                {(v.metrics?.ctr || 0).toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground">CTR</p>
            </div>
            {test.status === "running" && (
              <button
                onClick={() => onDeclareWinner(v.id)}
                className="rounded-lg p-1.5 hover:bg-white/10"
                title="اعلان الفائز"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}