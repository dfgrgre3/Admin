"use client";

import * as React from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  ScanSearch,
  Check,
  X,
  Clock,
  AlertCircle,
  AlertTriangle,
  Eye,
  Filter,
  RefreshCw,
  ChevronLeft,
  User,
  Calendar,
  Flag,
  Bot,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  FileText,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Hash,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminBadge, StatusBadge } from "@/components/admin/ui/admin-badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useAIContentReview,
  useAIReviewDecide,
  useAIReviewItem,
} from "@/lib/ai/ai-hooks";
import type {
  AIContentReviewItem,
  ContentReviewPriority,
  ContentReviewStats,
  ContentReviewStatus,
} from "@/lib/ai/types";
import { cn } from "@/lib/utils";

// ─── Configuration ──────────────────────────────────────────

const STATUS_CONFIG: Record<
  ContentReviewStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending_review: {
    label: "بانتظار المراجعة",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: Clock,
  },
  in_review: {
    label: "قيد المراجعة",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: Eye,
  },
  approved: {
    label: "معتمد",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "مرفوض",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/30",
    icon: XCircle,
  },
  needs_revision: {
    label: "يحتاج تعديل",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/30",
    icon: RotateCcw,
  },
};

const PRIORITY_CONFIG: Record<
  ContentReviewPriority,
  { label: string; color: string; bg: string }
> = {
  low: { label: "منخفضة", color: "text-slate-500", bg: "bg-slate-500/10" },
  medium: { label: "متوسطة", color: "text-blue-500", bg: "bg-blue-500/10" },
  high: { label: "عالية", color: "text-amber-500", bg: "bg-amber-500/10" },
  urgent: { label: "عاجلة", color: "text-rose-500", bg: "bg-rose-500/10" },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  exam_blueprint: FileText,
  curriculum_outline: BookOpen,
  article: FileText,
  update_suggestion: Lightbulb,
  lesson_summary: GraduationCap,
  learning_path: GraduationCap,
};

const TYPE_LABELS: Record<string, string> = {
  exam_blueprint: "امتحان مقترح",
  curriculum_outline: "مخطط منهج",
  article: "مقال تعليمي",
  update_suggestion: "اقتراح تحسين",
  lesson_summary: "ملخص درس",
  learning_path: "مسار تعليمي",
};

const FILTER_TABS: Array<{ value: ContentReviewStatus | "all"; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "pending_review", label: "بانتظار المراجعة" },
  { value: "in_review", label: "قيد المراجعة" },
  { value: "needs_revision", label: "يحتاج تعديل" },
  { value: "approved", label: "معتمد" },
  { value: "rejected", label: "مرفوض" },
];

// ─── Page Skeleton ──────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <Skeleton className="h-28 rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Stats Cards ────────────────────────────────────────────

function StatsCards({ stats }: { stats: ContentReviewStats }) {
  const items = [
    {
      label: "بانتظار",
      value: stats.pending,
      icon: Clock,
      color: "amber" as const,
    },
    {
      label: "قيد المراجعة",
      value: stats.inReview,
      icon: Eye,
      color: "blue" as const,
    },
    {
      label: "معتمد",
      value: stats.approved,
      icon: CheckCircle2,
      color: "emerald" as const,
    },
    {
      label: "يحتاج تعديل",
      value: stats.needsRevision,
      icon: RotateCcw,
      color: "purple" as const,
    },
    {
      label: "مرفوض",
      value: stats.rejected,
      icon: XCircle,
      color: "rose" as const,
    },
  ];

  const colorMap: Record<string, string> = {
    amber: "text-amber-500 bg-amber-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    rose: "text-rose-500 bg-rose-500/10",
  };

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {items.map((item, idx) => (
        <m.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <AdminCard variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-xl p-2.5", colorMap[item.color])}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-2xl font-black">{item.value}</p>
              </div>
            </div>
          </AdminCard>
        </m.div>
      ))}
    </div>
  );
}

// ─── Review Item Card ───────────────────────────────────────

function ReviewItemRow({
  item,
  onView,
  onApprove,
  onReject,
  onRevise,
  isDeciding,
}: {
  item: AIContentReviewItem;
  onView: (item: AIContentReviewItem) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRevise: (id: string) => void;
  isDeciding: boolean;
}) {
  const statusConfig = STATUS_CONFIG[item.status];
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const Icon = TYPE_ICONS[item.type] || FileText;

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <AdminCard variant="glass" className="p-5 hover:border-primary/40 transition-all">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Left side: type + title + content */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start gap-3 flex-wrap">
              <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black", statusConfig.bg)}>
                <statusConfig.icon className={cn("h-3 w-3", statusConfig.color)} />
                <span className={statusConfig.color}>{statusConfig.label}</span>
              </div>
              <div className={cn("rounded-full px-2 py-0.5 text-[10px] font-black", priorityConfig.bg, priorityConfig.color)}>
                أولوية {priorityConfig.label}
              </div>
              <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {TYPE_LABELS[item.type] || item.type}
              </span>
            </div>

            <h3 className="font-black text-lg leading-tight">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {item.preview}
            </p>

            <div className="flex items-center gap-3 flex-wrap text-[11px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {item.author.name?.charAt(0) || "؟"}
                  </AvatarFallback>
                </Avatar>
                {item.author.name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {item.subject}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(item.createdAt).toLocaleDateString("ar-EG", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              {item.reviewer && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.reviewer.name}
                  </span>
                </>
              )}
            </div>

            {item.aiFlags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.aiFlags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-600"
                  >
                    <Flag className="inline h-3 w-3 ml-1" />
                    {flag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right side: AI score + actions */}
          <div className="flex flex-row lg:flex-col items-center gap-3 shrink-0 lg:items-end">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                تقييم AI
              </p>
              <p
                className={cn(
                  "text-3xl font-black",
                  item.aiScore >= 80
                    ? "text-emerald-500"
                    : item.aiScore >= 50
                    ? "text-amber-500"
                    : "text-rose-500"
                )}
              >
                {item.aiScore}
                <span className="text-base text-muted-foreground">/100</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => onView(item)}
              >
                <Eye className="h-3.5 w-3.5" />
                عرض
              </AdminButton>

              {(item.status === "pending_review" || item.status === "in_review" || item.status === "needs_revision") && (
                <>
                  <AdminButton
                    size="sm"
                    variant="default"
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => onApprove(item.id)}
                    loading={isDeciding}
                    icon={Check}
                  >
                    اعتماد
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(item.id)}
                    loading={isDeciding}
                    icon={X}
                  >
                    رفض
                  </AdminButton>
                  {item.status !== "needs_revision" && (
                    <AdminButton
                      size="sm"
                      variant="outline"
                      onClick={() => onRevise(item.id)}
                      loading={isDeciding}
                      icon={RotateCcw}
                    >
                      تعديل
                    </AdminButton>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </AdminCard>
    </m.div>
  );
}

// ─── View Dialog ────────────────────────────────────────────

function ViewItemDialog({
  itemId,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRevise,
}: {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onRevise: (id: string, notes?: string) => void;
}) {
  const { data: item, isLoading } = useAIReviewItem(itemId || "");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (open) setNotes("");
  }, [open]);

  if (!itemId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        {isLoading || !item ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black",
                    STATUS_CONFIG[item.status].bg
                  )}
                >
                  {React.createElement(STATUS_CONFIG[item.status].icon, {
                    className: cn("h-3 w-3", STATUS_CONFIG[item.status].color),
                  })}
                  <span className={STATUS_CONFIG[item.status].color}>
                    {STATUS_CONFIG[item.status].label}
                  </span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-black",
                    PRIORITY_CONFIG[item.priority].bg,
                    PRIORITY_CONFIG[item.priority].color
                  )}
                >
                  أولوية {PRIORITY_CONFIG[item.priority].label}
                </span>
              </div>
              <DialogTitle>{item.title}</DialogTitle>
              <DialogDescription>
                {TYPE_LABELS[item.type] || item.type} • {item.subject}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Author + Score */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {item.author.name?.charAt(0) || "؟"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-black text-sm">{item.author.name}</p>
                    <p className="text-xs text-muted-foreground">{item.author.email}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    تقييم AI
                  </p>
                  <p
                    className={cn(
                      "text-3xl font-black",
                      item.aiScore >= 80
                        ? "text-emerald-500"
                        : item.aiScore >= 50
                        ? "text-amber-500"
                        : "text-rose-500"
                    )}
                  >
                    {item.aiScore}/100
                  </p>
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <p className="text-xs font-black text-violet-600">اقتراح الذكاء الاصطناعي</p>
                </div>
                <p className="text-sm leading-relaxed">{item.aiSuggestion}</p>
              </div>

              {/* AI Flags */}
              {item.aiFlags.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="h-4 w-4 text-amber-500" />
                    <p className="text-xs font-black text-amber-600">علامات تحذيرية</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.aiFlags.map((flag) => (
                      <span
                        key={flag}
                        className="rounded-md bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-700"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Content */}
              <div className="space-y-2">
                <Label className="text-xs font-black">المحتوى الكامل</Label>
                <div className="rounded-xl border border-border bg-background/50 p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {item.fullContent}
                  </p>
                </div>
              </div>

              {/* Reviewer notes */}
              {(item.status === "pending_review" ||
                item.status === "in_review" ||
                item.status === "needs_revision") && (
                <div className="space-y-2">
                  <Label className="text-xs font-black">ملاحظات المراجع (اختيارية)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="اكتب ملاحظاتك أو سبب القرار..."
                    rows={3}
                  />
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="font-black text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-bold mt-1">
                    {new Date(item.createdAt).toLocaleString("ar-EG")}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="font-black text-muted-foreground">آخر تحديث</p>
                  <p className="font-bold mt-1">
                    {new Date(item.updatedAt).toLocaleString("ar-EG")}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 flex-wrap">
              <AdminButton variant="outline" onClick={() => onOpenChange(false)}>
                إغلاق
              </AdminButton>
              {(item.status === "pending_review" ||
                item.status === "in_review" ||
                item.status === "needs_revision") && (
                <>
                  <AdminButton
                    variant="outline"
                    onClick={() => {
                      onRevise(item.id, notes || undefined);
                      onOpenChange(false);
                    }}
                    icon={RotateCcw}
                  >
                    طلب تعديل
                  </AdminButton>
                  <AdminButton
                    variant="destructive"
                    onClick={() => {
                      onReject(item.id, notes || undefined);
                      onOpenChange(false);
                    }}
                    icon={X}
                  >
                    رفض
                  </AdminButton>
                  <AdminButton
                    variant="default"
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => {
                      onApprove(item.id, notes || undefined);
                      onOpenChange(false);
                    }}
                    icon={Check}
                  >
                    اعتماد
                  </AdminButton>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function AiContentReviewPage() {
  const [activeFilter, setActiveFilter] = React.useState<ContentReviewStatus | "all">("pending_review");
  const [search, setSearch] = React.useState("");
  const [viewItemId, setViewItemId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  const params = React.useMemo(
    () => ({
      status: activeFilter === "all" ? undefined : (activeFilter as ContentReviewStatus),
      search: search || undefined,
      page,
      pageSize: 20,
    }),
    [activeFilter, search, page]
  );

  const { data, isLoading, isError, error, refetch } = useAIContentReview(params);
  const decideMutation = useAIReviewDecide();

  const handleApprove = (id: string, notes?: string) => {
    decideMutation.mutate(
      { id, decision: "approved", notes },
      {
        onSuccess: () => toast.success("تم اعتماد المحتوى وتشغيله"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleReject = (id: string, notes?: string) => {
    decideMutation.mutate(
      { id, decision: "rejected", notes },
      {
        onSuccess: () => toast.success("تم رفض المحتوى"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleRevise = (id: string, notes?: string) => {
    decideMutation.mutate(
      { id, decision: "needs_revision", notes },
      {
        onSuccess: () => toast.info("تم إرسال المحتوى للمراجعة والتعديل"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="space-y-8 pb-20" dir="rtl">
        <PageHeader
          eyebrow="الذكاء الاصطناعي"
          title="مراجعة المحتوى"
          description="مراجعة المحتوى التعليمي بمساعدة الذكاء الاصطناعي"
        />
        <AdminCard className="p-12 text-center border-destructive/30 bg-destructive/5">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-black mb-2">تعذر تحميل قائمة المراجعة</h3>
          <p className="text-muted-foreground mb-4">
            {(error as Error)?.message || "يرجى المحاولة مرة أخرى"}
          </p>
          <AdminButton onClick={() => refetch()} icon={ArrowUpRight}>
            إعادة المحاولة
          </AdminButton>
        </AdminCard>
      </div>
    );
  }

  const items = data?.items || [];
  const stats = data?.stats || {
    pending: 0,
    inReview: 0,
    approved: 0,
    rejected: 0,
    needsRevision: 0,
    averageAiScore: 0,
    urgentCount: 0,
  };
  const total = data?.total || 0;

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        eyebrow="الذكاء الاصطناعي"
        title="مراجعة المحتوى"
        description="مراجعة المحتوى التعليمي بمساعدة الذكاء الاصطناعي: تقييم، اقتراحات، واعتماد بشري نهائي."
      >
        <div className="flex items-center gap-3">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            icon={RefreshCw}
          >
            تحديث
          </AdminButton>
          {stats.urgentCount > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 border border-rose-500/30">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <span className="text-xs font-black text-rose-600">
                {stats.urgentCount} عاجل
              </span>
            </div>
          )}
        </div>
      </PageHeader>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* AI Insights */}
      <AdminCard
        variant="gradient"
        className="border-violet-500/30 bg-violet-500/5 p-5 flex items-start gap-4"
      >
        <div className="rounded-2xl bg-violet-500/20 p-3 text-violet-500">
          <Bot className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-violet-600">تحليل ذكي للمراجعة</p>
          <p className="text-sm text-muted-foreground mt-1">
            متوسط تقييم AI للمحتوى المعلق:{" "}
            <strong className="text-foreground">
              {stats.averageAiScore.toFixed(1)}/100
            </strong>
            {stats.averageAiScore >= 80 && " - المحتوى ذو جودة عالية عموماً ✅"}
            {stats.averageAiScore >= 50 && stats.averageAiScore < 80 && " - يحتاج مراجعة دقيقة ⚠️"}
            {stats.averageAiScore < 50 && " - جودة منخفضة، مراجعة مكثفة مطلوبة 🚨"}
          </p>
        </div>
      </AdminCard>

      {/* Filters */}
      <AdminCard variant="glass" className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              placeholder="ابحث بالعنوان أو المؤلف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-black transition-colors",
                  activeFilter === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </AdminCard>

      {/* Items List */}
      {items.length === 0 ? (
        <AdminCard className="p-16 text-center">
          <ScanSearch className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-black text-lg">لا توجد عناصر للمراجعة</p>
          <p className="text-sm text-muted-foreground mt-1">
            {activeFilter === "pending_review"
              ? "لا يوجد محتوى بانتظار المراجعة حالياً 🎉"
              : "جرب تغيير عوامل التصفية"}
          </p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <ReviewItemRow
                key={item.id}
                item={item}
                onView={(it) => setViewItemId(it.id)}
                onApprove={handleApprove}
                onReject={handleReject}
                onRevise={handleRevise}
                isDeciding={decideMutation.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <AdminButton
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            السابق
          </AdminButton>
          <span className="text-sm font-bold text-muted-foreground">
            صفحة {page} من {Math.ceil(total / 20)}
          </span>
          <AdminButton
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            التالي
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </AdminButton>
        </div>
      )}

      {/* View Dialog */}
      <ViewItemDialog
        itemId={viewItemId}
        open={!!viewItemId}
        onOpenChange={(open) => !open && setViewItemId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onRevise={handleRevise}
      />
    </div>
  );
}