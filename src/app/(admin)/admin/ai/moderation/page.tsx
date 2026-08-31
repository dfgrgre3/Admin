"use client";

import * as React from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Flag,
  Gavel,
  Hash,
  Info,
  MessageSquare,
  MessageCircle,
  PenLine,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminBadge, StatusBadge } from "@/components/admin/ui/admin-badge";
import { Input as TextInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useAIModeration,
  useAIDecideModeration,
  useAIModerationRules,
  useAIToggleModerationRule,
  type ModerationParams,
} from "@/lib/ai/ai-hooks";
import type {
  ModerationCase,
  ModerationCaseStatus,
  ModerationReason,
  ModerationSeverity,
  ModerationStats,
} from "@/lib/ai/types";
import { cn } from "@/lib/utils";

// ─── Configuration Constants ───────────────────────────────

const STATUS_CONFIG: Record<
  ModerationCaseStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: {
    label: "معلّق",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: Clock,
  },
  auto_approved: {
    label: "موافقة تلقائية",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: ShieldCheck,
  },
  auto_rejected: {
    label: "رفض تلقائي",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/30",
    icon: ShieldOff,
  },
  escalated: {
    label: "تصعيد",
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/30",
    icon: AlertOctagon,
  },
  human_reviewing: {
    label: "مراجعة بشرية",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: UserCheck,
  },
  resolved: {
    label: "محسوم",
    color: "text-slate-500",
    bg: "bg-slate-500/10 border-slate-500/30",
    icon: CheckCircle2,
  },
};

const SEVERITY_CONFIG: Record<
  ModerationSeverity,
  { label: string; color: string; bg: string; border: string }
> = {
  low: {
    label: "منخفض",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  medium: {
    label: "متوسط",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  high: {
    label: "مرتفع",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  critical: {
    label: "حرج",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  },
};

const REASON_CONFIG: Record<
  ModerationReason,
  { label: string; icon: React.ElementType; color: string }
> = {
  spam: { label: "رسائل مزعجة", icon: MessageSquare, color: "text-slate-500" },
  profanity: { label: "ألفاظ بذيئة", icon: AlertOctagon, color: "text-orange-500" },
  hate_speech: { label: "خطاب كراهية", icon: ShieldAlert, color: "text-rose-500" },
  sexual_content: { label: "محتوى جنسي", icon: ShieldOff, color: "text-pink-500" },
  violence: { label: "عنف", icon: AlertTriangle, color: "text-red-500" },
  personal_info: { label: "بيانات شخصية", icon: User, color: "text-yellow-500" },
  misinformation: { label: "معلومات مضللة", icon: Info, color: "text-amber-500" },
  cheating: { label: "غش", icon: Eye, color: "text-violet-500" },
  off_topic: { label: "خارج الموضوع", icon: Hash, color: "text-blue-500" },
  plagiarism: { label: "انتحال", icon: FileText, color: "text-purple-500" },
  other: { label: "أخرى", icon: Flag, color: "text-muted-foreground" },
};

const CONTENT_TYPE_ICONS: Record<string, React.ElementType> = {
  comment: MessageCircle,
  post: FileText,
  message: MessageSquare,
  profile: User,
  submission: PenLine,
  review: Sparkles,
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  comment: "تعليق",
  post: "منشور",
  message: "رسالة",
  profile: "ملف شخصي",
  submission: "تسليم",
  review: "مراجعة",
};

const FILTER_TABS: Array<{ value: string; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "معلّق" },
  { value: "escalated", label: "تصعيد" },
  { value: "human_reviewing", label: "مراجعة بشرية" },
  { value: "auto_approved", label: "موافقة آلية" },
  { value: "auto_rejected", label: "رفض آلي" },
  { value: "resolved", label: "محسوم" },
];

const RULE_ACTIONS = [
  { value: "auto_approve", label: "موافقة تلقائية" },
  { value: "auto_reject", label: "رفض تلقائي" },
  { value: "flag_for_review", label: "إبلاغ للمراجعة" },
  { value: "escalate", label: "تصعيد" },
] as const;

// ─── Helpers ───────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("ar-EG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}س`;
  const days = Math.floor(hours / 24);
  return `${days}ي`;
}

// ─── Page Skeleton ──────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <Skeleton className="h-28 rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Stats Cards ────────────────────────────────────────────

function StatsCards({ stats }: { stats: ModerationStats }) {
  const cards = [
    {
      label: "حالات معلقة",
      value: stats.pendingCases.toLocaleString("ar-EG"),
      sub: "بانتظار المراجعة",
      icon: Clock,
      color: "amber" as const,
    },
    {
      label: "محسومة اليوم",
      value: stats.resolvedToday.toLocaleString("ar-EG"),
      sub: `${stats.autoApprovedToday} موافقة • ${stats.autoRejectedToday} رفض`,
      icon: CheckCircle2,
      color: "emerald" as const,
    },
    {
      label: "حالات مصعّدة",
      value: stats.escalatedCases.toLocaleString("ar-EG"),
      sub: "تحتاج تدخل بشري",
      icon: AlertOctagon,
      color: "orange" as const,
    },
    {
      label: "زمن الاستجابة",
      value: `${(stats.averageResponseTimeMs / 1000).toFixed(1)}s`,
      sub: `${stats.falsePositiveRate.toFixed(1)}% إنذارات كاذبة`,
      icon: TrendingUp,
      color: "blue" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <m.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <AdminCard variant="glass" className="relative overflow-hidden">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-30 bg-primary" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-1 text-3xl font-black">{card.value}</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">{card.sub}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </AdminCard>
        </m.div>
      ))}
    </div>
  );
}

// ─── Top Reasons Card ───────────────────────────────────────

function TopReasons({ reasons }: { reasons: ModerationStats["topReasons"] }) {
  const total = reasons.reduce((sum, r) => sum + r.count, 0) || 1;

  if (!reasons.length) return null;

  return (
    <AdminCard variant="glass" className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4 text-primary" />
        <h3 className="font-black text-base">أسباب الإبلاغ الأكثر شيوعاً</h3>
      </div>
      <div className="space-y-3">
        {reasons.slice(0, 5).map((r) => {
          const config = REASON_CONFIG[r.reason] || REASON_CONFIG.other;
          const Icon = config.icon;
          const pct = (r.count / total) * 100;
          return (
            <div key={r.reason} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                  {config.label}
                </span>
                <span className="text-muted-foreground font-bold">
                  {r.count.toLocaleString("ar-EG")} ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <m.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                  className={cn("h-full", config.color.replace("text-", "bg-"))}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}

// ─── Case Card ─────────────────────────────────────────────

function CaseCard({
  caseItem,
  onDecide,
  isDeciding,
}: {
  caseItem: ModerationCase;
  onDecide: (caseItem: ModerationCase) => void;
  isDeciding: boolean;
}) {
  const statusConfig = STATUS_CONFIG[caseItem.status] || STATUS_CONFIG.pending;
  const severityConfig = SEVERITY_CONFIG[caseItem.severity];
  const reasonConfig = REASON_CONFIG[caseItem.reason] || REASON_CONFIG.other;
  const ContentIcon = CONTENT_TYPE_ICONS[caseItem.contentType] || FileText;
  const StatusIcon = statusConfig.icon;
  const ReasonIcon = reasonConfig.icon;

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <AdminCard
        variant="outline"
        className={cn(
          "p-5 group hover:border-primary/40 transition-all",
          caseItem.status === "pending" && "border-amber-500/30 bg-amber-500/5",
          caseItem.severity === "critical" && "border-rose-500/40 bg-rose-500/5"
        )}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn("rounded-xl border p-2", statusConfig.bg)}>
                <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <ContentIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground">
                    {CONTENT_TYPE_LABELS[caseItem.contentType] || caseItem.contentType}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <ReasonIcon className={cn("h-3.5 w-3.5", reasonConfig.color)} />
                  <span className="text-xs font-bold">{reasonConfig.label}</span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-2 font-medium">
                  {caseItem.contentPreview}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end shrink-0">
              <span
                className={cn(
                  "rounded-full border px-2 py-1 text-[10px] font-black flex items-center gap-1",
                  statusConfig.bg,
                  statusConfig.color
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-black",
                  severityConfig.bg,
                  severityConfig.border,
                  severityConfig.color
                )}
              >
                {severityConfig.label}
              </span>
            </div>
          </div>

          {/* AI Info */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                تحليل الذكاء الاصطناعي
              </span>
              <span className="text-[10px] font-bold text-muted-foreground mr-auto">
                ثقة: {caseItem.confidence.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">
              {caseItem.aiExplanation}
            </p>
            {caseItem.flaggedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {caseItem.flaggedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-600"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="font-bold">{caseItem.authorName}</span>
              <span className="text-muted-foreground/60">({caseItem.authorEmail})</span>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{timeAgo(caseItem.createdAt)}</span>
            {caseItem.reviewerName && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="flex items-center gap-1 text-blue-500">
                  <UserCheck className="h-3 w-3" />
                  مراجع: {caseItem.reviewerName}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          {(caseItem.status === "pending" ||
            caseItem.status === "escalated" ||
            caseItem.status === "human_reviewing") && (
            <div className="flex items-center gap-2 border-t border-border/50 pt-3">
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => onDecide(caseItem)}
                loading={isDeciding}
                icon={Gavel}
                className="flex-1"
              >
                اتخاذ قرار
              </AdminButton>
            </div>
          )}

          {caseItem.resolution && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
                القرار
              </p>
              <p className="text-xs">{caseItem.resolution}</p>
            </div>
          )}
        </div>
      </AdminCard>
    </m.div>
  );
}

// ─── Decide Dialog ─────────────────────────────────────────

function DecideDialog({
  caseItem,
  open,
  onOpenChange,
}: {
  caseItem: ModerationCase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [decision, setDecision] = React.useState<"approve" | "reject" | "escalate">("approve");
  const [resolution, setResolution] = React.useState("");

  const decideMutation = useAIDecideModeration({
    onSuccess: () => {
      toast.success("تم اتخاذ القرار بنجاح");
      onOpenChange(false);
      setResolution("");
    },
    onError: (err) => toast.error(err.message),
  });

  React.useEffect(() => {
    if (open) {
      setDecision("approve");
      setResolution("");
    }
  }, [open]);

  if (!caseItem) return null;

  const handleSubmit = () => {
    if (!resolution.trim() && decision !== "approve") {
      toast.warning("يرجى كتابة توضيح للقرار");
      return;
    }
    decideMutation.mutate({
      id: caseItem.id,
      decision,
      resolution: resolution || (decision === "approve" ? "موافقة" : "رفض"),
    });
  };

  const reasonConfig = REASON_CONFIG[caseItem.reason] || REASON_CONFIG.other;
  const ReasonIcon = reasonConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            اتخاذ قرار مراجعة
          </DialogTitle>
          <DialogDescription>
            مراجعة الحالة واتخاذ الإجراء المناسب
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Preview */}
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <ReasonIcon className={cn("h-3.5 w-3.5", reasonConfig.color)} />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {reasonConfig.label}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground mr-auto">
                ثقة AI: {caseItem.confidence.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-2">{caseItem.contentPreview}</p>
            <p className="text-xs text-muted-foreground italic">
              <Bot className="inline h-3 w-3 ml-1" />
              {caseItem.aiExplanation}
            </p>
          </div>

          {/* Decision */}
          <div className="space-y-2">
            <Label className="text-xs font-black">القرار</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision("approve")}
                className={cn(
                  "rounded-xl border-2 p-3 text-center transition-all",
                  decision === "approve"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <ShieldCheck className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-black">موافقة</p>
              </button>
              <button
                type="button"
                onClick={() => setDecision("reject")}
                className={cn(
                  "rounded-xl border-2 p-3 text-center transition-all",
                  decision === "reject"
                    ? "border-rose-500 bg-rose-500/10"
                    : "border-border hover:border-rose-500/50"
                )}
              >
                <ShieldOff className="h-5 w-5 text-rose-500 mx-auto mb-1" />
                <p className="text-xs font-black">رفض</p>
              </button>
              <button
                type="button"
                onClick={() => setDecision("escalate")}
                className={cn(
                  "rounded-xl border-2 p-3 text-center transition-all",
                  decision === "escalate"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-border hover:border-orange-500/50"
                )}
              >
                <AlertOctagon className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <p className="text-xs font-black">تصعيد</p>
              </button>
            </div>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <Label className="text-xs font-black">التوضيح / القرار</Label>
            <Textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="اشرح سبب اتخاذ هذا القرار..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <AdminButton variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            onClick={handleSubmit}
            loading={decideMutation.isPending}
            icon={CheckCircle2}
          >
            تأكيد القرار
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Rules Manager Dialog ──────────────────────────────────

function RulesManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useAIModerationRules();
  const toggleMutation = useAIToggleModerationRule({
    onSuccess: () => toast.success("تم تحديث حالة القاعدة"),
    onError: (err) => toast.error(err.message),
  });

  const rules = data?.rules || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            قواعد الرقابة التلقائية
          </DialogTitle>
          <DialogDescription>
            إدارة القواعد التي تحكم كيفية معالجة المحتوى تلقائياً
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : rules.length === 0 ? (
          <AdminCard className="p-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-black text-lg">لا توجد قواعد</p>
            <p className="text-sm text-muted-foreground mt-1">
              لم يتم تكوين أي قواعد رقابة بعد
            </p>
          </AdminCard>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => {
              const reasonConfig = REASON_CONFIG[rule.reason] || REASON_CONFIG.other;
              const ReasonIcon = reasonConfig.icon;
              const severityConfig = SEVERITY_CONFIG[rule.severity];
              return (
                <AdminCard key={rule.id} variant="outline" className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn("rounded-xl p-2", reasonConfig.color.replace("text-", "bg-") + "/10")}>
                        <ReasonIcon className={cn("h-4 w-4", reasonConfig.color)} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-sm">{rule.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold">
                          <span className="rounded-md bg-muted/30 border border-border px-2 py-0.5">
                            السبب: {reasonConfig.label}
                          </span>
                          <span className={cn("rounded-md border px-2 py-0.5", severityConfig.bg, severityConfig.border, severityConfig.color)}>
                            الخطورة: {severityConfig.label}
                          </span>
                          <span className="rounded-md bg-primary/10 border border-primary/30 text-primary px-2 py-0.5">
                            الإجراء: {RULE_ACTIONS.find(a => a.value === rule.action)?.label}
                          </span>
                          <span className="rounded-md bg-muted/30 border border-border px-2 py-0.5">
                            {rule.matchCount.toLocaleString("ar-EG")} مطابقة
                          </span>
                        </div>
                        {rule.lastTriggeredAt && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            آخر تفعيل: {formatDate(rule.lastTriggeredAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: rule.id, enabled: checked })
                      }
                      disabled={toggleMutation.isPending}
                    />
                  </div>
                </AdminCard>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <AdminButton onClick={() => onOpenChange(false)}>إغلاق</AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Filter Toolbar ─────────────────────────────────────────

function FilterToolbar({
  search,
  setSearch,
  severityFilter,
  setSeverityFilter,
  reasonFilter,
  setReasonFilter,
}: {
  search: string;
  setSearch: (v: string) => void;
  severityFilter: string;
  setSeverityFilter: (v: string) => void;
  reasonFilter: string;
  setReasonFilter: (v: string) => void;
}) {
  return (
    <AdminCard variant="glass" className="p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <TextInput
            placeholder="ابحث في المحتوى أو المستخدمين..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-bold"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="all">جميع مستويات الخطورة</option>
          {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-bold"
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
        >
          <option value="all">جميع الأسباب</option>
          {Object.entries(REASON_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
    </AdminCard>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function AiModerationPage() {
  const [search, setSearch] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [reasonFilter, setReasonFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 15;

  const [activeTab, setActiveTab] = React.useState("all");
  const [selectedCase, setSelectedCase] = React.useState<ModerationCase | null>(null);
  const [rulesOpen, setRulesOpen] = React.useState(false);

  const params: ModerationParams = {
    status: (activeTab !== "all" ? activeTab : undefined) as ModerationCaseStatus | undefined,
    severity: severityFilter !== "all" ? severityFilter : undefined,
    reason: reasonFilter !== "all" ? reasonFilter : undefined,
    search: search.trim() || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useAIModeration(params);
  const decideMutation = useAIDecideModeration();

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, severityFilter, reasonFilter, activeTab]);

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="space-y-8 pb-20" dir="rtl">
        <PageHeader
          eyebrow="الذكاء الاصطناعي"
          title="الرقابة الذكية"
          description="مراقبة ومراجعة المحتوى تلقائياً بالذكاء الاصطناعي"
        />
        <AdminCard className="p-12 text-center border-destructive/30 bg-destructive/5">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-black mb-2">تعذر تحميل البيانات</h3>
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

  const stats: ModerationStats = data?.stats || {
    pendingCases: 0,
    resolvedToday: 0,
    autoApprovedToday: 0,
    autoRejectedToday: 0,
    escalatedCases: 0,
    averageResponseTimeMs: 0,
    topReasons: [],
    falsePositiveRate: 0,
  };

  const cases = data?.cases || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        eyebrow="الذكاء الاصطناعي"
        title="الرقابة الذكية"
        description="مراقبة ومراجعة المحتوى تلقائياً بالذكاء الاصطناعي. اتخاذ قرارات ذكية، إدارة القواعد، ومراجعة الحالات."
      >
        <div className="flex items-center gap-3">
          <AdminButton
            variant="outline"
            onClick={() => setRulesOpen(true)}
            icon={SettingsIcon}
          >
            قواعد الرقابة
          </AdminButton>
          <AdminButton
            variant="outline"
            onClick={() => refetch()}
            loading={isFetching}
            icon={RefreshCw}
          >
            تحديث
          </AdminButton>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Top Reasons */}
      <TopReasons reasons={stats.topReasons} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/50 p-1 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <FilterToolbar
        search={search}
        setSearch={setSearch}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        reasonFilter={reasonFilter}
        setReasonFilter={setReasonFilter}
      />

      {/* Cases List */}
      {cases.length === 0 ? (
        <AdminCard className="p-16 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-black text-lg">لا توجد حالات</p>
          <p className="text-sm text-muted-foreground mt-1">
            لم يتم العثور على حالات تطابق عوامل التصفية
          </p>
        </AdminCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {cases.map((c) => (
              <CaseCard
                key={c.id}
                caseItem={c}
                onDecide={setSelectedCase}
                isDeciding={decideMutation.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <AdminCard variant="outline" className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground">
              عرض {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} من {total.toLocaleString("ar-EG")}
            </p>
            <div className="flex items-center gap-2">
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                icon={ChevronRight}
              >
                السابق
              </AdminButton>
              <span className="text-xs font-bold px-2">
                صفحة {page} من {totalPages}
              </span>
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                icon={ChevronLeft}
              >
                التالي
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Decide Dialog */}
      <DecideDialog
        caseItem={selectedCase}
        open={!!selectedCase}
        onOpenChange={(open) => !open && setSelectedCase(null)}
      />

      {/* Rules Dialog */}
      <RulesManager open={rulesOpen} onOpenChange={setRulesOpen} />
    </div>
  );
}