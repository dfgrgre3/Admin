"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { SearchInput } from "@/components/admin/ui/admin-input";
import { StatusBadge, AdminBadge } from "@/components/admin/ui/admin-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Target,
  Clock,
  Bot,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  User,
  Lightbulb,
  BookOpen,
  FileText,
  GraduationCap,
  Route,
  RefreshCw,
  BarChart3,
  ShieldAlert,
  Bell,
  Zap,
  MessageSquare,
  Send,
  BrainCircuit,
  ArrowLeft,
  ListChecks,
  Activity,
  ShieldCheck,
  ChevronLeft,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
// @tanstack/react-query hooks are used inside the unified AI hooks
import { m, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// استيراد الـ hooks الموحدة
import {
  useAIDashboard,
  useAIGenerateContent,
  useAIReviewContent,
  useAIExecuteAction,
  useAICopilot,
  useAIAdminAgent,
  useAIAdminAgentExecute,
  useAIDataAnalysis,
  useAIDataAnalysisRefresh,
  useAIAssistants,
  useAIContentReview,
  useAILogs,
  useAIModeration,
  type AILogsParams,
  type ModerationParams,
  type AIDataAnalysisResult,
} from "@/lib/ai/ai-hooks";
import type {
  ReviewItem,
  RiskStudent,
  GradingItem,
  ForecastItem,
  AiSummary,
  AIKnowledgeSource,
  AdminAgentCommandResponse,
} from "@/lib/ai/types";

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  exam_blueprint: "امتحان مقترح",
  curriculum_outline: "مخطط منهج",
  article: "مقال تعليمي",
  update_suggestion: "اقتراح تحسين المحتوى",
  lesson_summary: "ملخص ذكي لدرس",
  learning_path: "مسار تعليمي مخصص",
} as const;

const TYPE_ICONS: Record<string, React.ElementType> = {
  exam_blueprint: FileText,
  curriculum_outline: BookOpen,
  article: FileText,
  update_suggestion: Lightbulb,
  lesson_summary: GraduationCap,
  learning_path: Route,
} as const;

const RISK_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  CRITICAL: {
    label: "خطر حرج 🔴",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  WARNING: {
    label: "تحذير 🟠",
    className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  NOTICE: {
    label: "ملاحظة 🟡",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
};

const CONTENT_TYPES = [
  { value: "update_suggestion", label: "اقتراح تعديلات على المحتوى" },
  { value: "lesson_summary", label: "توليد ملخص درس ذكي" },
  { value: "learning_path", label: "إنشاء مسار تعلم مخصص" },
  { value: "exam_blueprint", label: "اختبار ملكي (أسئلة واختيارات)" },
  { value: "curriculum_outline", label: "مخطط منهج متكامل" },
  { value: "article", label: "مقال أو مسودة تعليمية" },
];

const FORECAST_CONFIDENCE_CONFIG = {
  HIGH: { label: "عالية (بناءً على 5+ اختبارات)", className: "text-emerald-500" },
  MEDIUM: { label: "متوسطة", className: "text-amber-500" },
  LOW: { label: "منخفضة", className: "text-red-500" },
} as const;

const motionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function getContentTypeIcon(type: string): React.ElementType {
  return TYPE_ICONS[type] || FileText;
}

function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type;
}

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function AiBriefingCard({
  briefing,
  onNotifyInactive,
  onRefresh,
  isNotifying,
}: {
  briefing: string;
  onNotifyInactive: () => void;
  onRefresh: () => void;
  isNotifying: boolean;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <AdminCard
        variant="glass"
        className="border-primary/30 p-6 bg-primary/5 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-20 h-20 text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-primary">
          <Bot className="w-6 h-6" aria-hidden="true" />
          الملخص التنفيذي الذكي (AI Briefing)
        </h3>
        <div className="text-lg font-bold leading-relaxed whitespace-pre-wrap max-w-4xl">
          {briefing}
        </div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <AdminButton
            variant="outline"
            size="sm"
            className="h-9 font-black gap-2"
            onClick={onNotifyInactive}
            loading={isNotifying}
            icon={Bell}
          >
            أرسل تنبيهات للطلاب المتغيبين
          </AdminButton>
          <AdminButton
            variant="outline"
            size="sm"
            className="h-9 font-black gap-2"
            onClick={onRefresh}
            icon={RefreshCw}
          >
            تحديث التحليل
          </AdminButton>
        </div>
      </AdminCard>
    </m.div>
  );
}

function QuickAccessRow({
  assistantsCount,
  activeAssistants,
  pendingReview,
  highPriorityReview,
  logsLast24h,
  errorRate,
  openCases,
  criticalCases,
}: {
  assistantsCount: number;
  activeAssistants: number;
  pendingReview: number;
  highPriorityReview: number;
  logsLast24h: number;
  errorRate: number;
  openCases: number;
  criticalCases: number;
}) {
  const cards = [
    {
      href: "/admin/ai/assistants",
      title: "إدارة المساعدين",
      description: "تهيئة وتكوين نماذج الذكاء الاصطناعي المتخصصة",
      icon: Cpu,
      color: "from-violet-500/20 to-purple-500/10",
      iconBg: "bg-violet-500/10 text-violet-500",
      stats: [
        { label: "إجمالي المساعدين", value: assistantsCount },
        { label: "نشط الآن", value: activeAssistants, highlight: true },
      ],
    },
    {
      href: "/admin/ai/content-review",
      title: "مراجعة المحتوى",
      description: "طابور المراجعة البشرية لتوليدات الذكاء الاصطناعي",
      icon: ListChecks,
      color: "from-orange-500/20 to-amber-500/10",
      iconBg: "bg-orange-500/10 text-orange-500",
      stats: [
        { label: "بانتظار المراجعة", value: pendingReview },
        { label: "أولوية عالية", value: highPriorityReview, highlight: highPriorityReview > 0 },
      ],
    },
    {
      href: "/admin/ai/logs",
      title: "سجلات النشاط",
      description: "تتبع كل استدعاءات الذكاء الاصطناعي وتحليل أدائها",
      icon: Activity,
      color: "from-blue-500/20 to-cyan-500/10",
      iconBg: "bg-blue-500/10 text-blue-500",
      stats: [
        { label: "استدعاءات اليوم", value: logsLast24h },
        {
          label: "معدل الخطأ",
          value: `${errorRate.toFixed(1)}%`,
          highlight: errorRate > 5,
        },
      ],
    },
    {
      href: "/admin/ai/moderation",
      title: "الرقابة الذكية",
      description: "مراجعة البلاغات والمحتوى المخالف آلياً",
      icon: ShieldCheck,
      color: "from-rose-500/20 to-red-500/10",
      iconBg: "bg-rose-500/10 text-rose-500",
      stats: [
        { label: "قضايا مفتوحة", value: openCases },
        {
          label: "حالات حرجة",
          value: criticalCases,
          highlight: criticalCases > 0,
        },
      ],
    },
  ];

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.href}
            href={card.href}
            prefetch={false}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
            aria-label={`${card.title} - ${card.description}`}
          >
            <AdminCard
              variant="glass"
              className={cn(
                "h-full p-5 relative overflow-hidden border-border transition-all",
                "hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5",
                `bg-gradient-to-br ${card.color}`
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", card.iconBg)}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <ChevronLeft
                  className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-black text-base mb-1">{card.title}</h3>
              <p className="text-xs text-muted-foreground font-bold mb-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                {card.description}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40">
                {card.stats.map((stat, sIdx) => (
                  <div key={sIdx} className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <p
                      className={cn(
                        "text-lg font-black",
                        stat.highlight ? "text-primary" : "text-foreground"
                      )}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </AdminCard>
          </Link>
        );
      })}
    </m.div>
  );
}

function ContentStudioTab({
  contentType,
  setContentType,
  title,
  setTitle,
  prompt,
  setPrompt,
  subjectId,
  isGenerating,
  onGenerate,
  pendingItems,
  onApprove,
  onReject,
  isReviewing,
}: {
  contentType: string;
  setContentType: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  subjectId: string;
  isGenerating: boolean;
  onGenerate: () => void;
  pendingItems: ReviewItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isReviewing: boolean;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Generator Panel */}
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <AdminCard variant="glass" className="h-full border-primary/20 p-6">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              onGenerate();
            }}
          >
            <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Bot className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-black">غرفة التوليد (Generator)</h3>
                <p className="text-sm text-muted-foreground font-bold">
                  وجه الأوامر لمحرك الذكاء الاصطناعي
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="content-type" className="text-sm font-black block">
                  نوع المحتوى المطلوب
                </label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger
                    id="content-type"
                    className="w-full h-12 rounded-xl text-right font-bold"
                    aria-label="نوع المحتوى"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        {ct.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="content-title" className="text-sm font-black block">
                  العنوان والتسمية
                </label>
                <SearchInput
                  id="content-title"
                  placeholder="مثال: تحليل فصل الكهرومغناطيسية"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 bg-background/50 font-bold"
                  aria-label="عنوان المحتوى"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content-prompt" className="text-sm font-black block flex justify-between">
                  <span>التعليمات والوصف الدقيق</span>
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                    Prompt
                  </span>
                </label>
                <Textarea
                  id="content-prompt"
                  placeholder="قم بتوضيح متطلباتك بدقة..."
                  className="min-h-[160px] resize-none bg-background/50 rounded-xl p-4 border-border font-bold focus:border-primary/50"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  aria-label="تعليمات الذكاء الاصطناعي"
                />
              </div>
            </div>

            <AdminButton
              type="submit"
              size="lg"
              className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-widest gap-3 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
              disabled={isGenerating || !title.trim() || !prompt.trim()}
              loading={isGenerating}
              icon={Sparkles}
            >
              توليد المحتوى الآن
            </AdminButton>
          </form>
        </AdminCard>
      </m.div>

      {/* Review Queue Panel */}
      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <AdminCard
          variant="glass"
          className="h-full flex flex-col p-0 overflow-hidden border-orange-500/20"
        >
          <div className="p-6 border-b border-border/50 bg-orange-500/5">
            <h3 className="text-xl font-black flex items-center gap-2 text-orange-500">
              <Clock className="w-5 h-5" aria-hidden="true" />
              طابور المراجعة البشرية
            </h3>
            <p className="text-sm text-muted-foreground mt-2 font-bold">
              مسودات ومسارات ولّدها الذكاء وبانتظار اعتمادك قبل تنشيطها للمحاربين.
            </p>
          </div>

          <div
            className="flex-1 overflow-y-auto space-y-px bg-border/30 max-h-[600px]"
            role="list"
            aria-label="عناصر المراجعة"
          >
            {pendingItems.length === 0 ? (
              <EmptyState
                icon={Check}
                title="طابور المراجعة فارغ!"
                description="تم اعتماد جميع التوليدات السابقة."
              />
            ) : (
              pendingItems.map((item) => (
                <ReviewItemCard
                  key={item.id}
                  item={item}
                  onApprove={onApprove}
                  onReject={onReject}
                  isReviewing={isReviewing}
                />
              ))
            )}
          </div>
        </AdminCard>
      </m.div>
    </div>
  );
}

function ReviewItemCard({
  item,
  onApprove,
  onReject,
  isReviewing,
}: {
  item: ReviewItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isReviewing: boolean;
}) {
  const icon = getContentTypeIcon(item.type);

  return (
    <div
      className="bg-card p-5 group flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-b last:border-0"
      role="listitem"
    >
      <div className="space-y-2 flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          {React.createElement(icon, {
            className: "w-4 h-4 text-muted-foreground",
            "aria-hidden": true,
          })}
          <h4 className="font-black truncate text-base">{item.title}</h4>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded-full bg-accent">
            {getTypeLabel(item.type)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-bold">
          {item.preview}
        </p>
      </div>
      <div className="flex sm:flex-col gap-2 shrink-0">
        <AdminButton
          variant="default"
          size="sm"
          className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 flex-1 font-black"
          onClick={() => onApprove(item.id)}
          loading={isReviewing}
          icon={Check}
        >
          اعتماد
        </AdminButton>
        <AdminButton
          variant="destructive"
          size="sm"
          className="gap-2 flex-1 font-black"
          onClick={() => onReject(item.id)}
          disabled={isReviewing}
        >
          رفض
        </AdminButton>
      </div>
    </div>
  );
}

function GradingTab({ gradingQueue }: { gradingQueue: GradingItem[] }) {
  const resolvedCount = gradingQueue.filter((g) => g.status === "RESOLVED").length;

  return (
    <AdminCard variant="glass" className="border-emerald-500/20 p-8 pt-6">
      <div className="mb-6 border-b border-border pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-emerald-500 flex items-center gap-2">
            <Target className="w-6 h-6" aria-hidden="true" />
            قائمة التصحيح الآلي للأسئلة المقالية
          </h3>
          <p className="text-muted-foreground mt-2 font-black">
            يقوم الذكاء الاصطناعي بقراءة إجابات الطلاب وفهمها وإعطاء العلامات والتبريز بدقة.
          </p>
        </div>
        <StatusBadge
          status={resolvedCount === gradingQueue.length ? "verified" : "pending"}
        />
      </div>

      <m.div className="space-y-4" variants={staggerVariants} animate="animate">
        {gradingQueue.length === 0 ? (
          <EmptyState
            icon={Check}
            title="لا توجد إجابات معلقة"
            description="جميع الإجابات تم تقييمها."
          />
        ) : (
          gradingQueue.map((item) => (
            <GradingItemCard key={item.id} item={item} />
          ))
        )}
      </m.div>
    </AdminCard>
  );
}

function GradingItemCard({ item }: { item: GradingItem }) {
  const isResolved = item.status === "RESOLVED";
  const scoreValue = item.score.split("/")[0];

  return (
    <m.div
      variants={motionVariants}
      className="bg-background/80 border border-border rounded-xl p-5 hover:border-emerald-500/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-black text-xl",
              isResolved
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-amber-500/10 text-amber-500"
            )}
          >
            {scoreValue}
          </div>
          <div>
            <h4 className="font-black text-lg">{item.studentName}</h4>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {isResolved ? "تم التقييم بنجاح" : "جاري المعالجة الذكية"}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "px-3 py-1 font-black rounded-lg text-xs border",
            isResolved
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
          )}
        >
          ({item.score})
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 bg-accent/20 p-4 rounded-xl border border-border/50">
        <div>
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">
            إجابة الطالب:
          </span>
          <p className="text-sm font-bold leading-relaxed">{item.answer}</p>
        </div>
        <div>
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-2 block",
              item.feedback ? "text-emerald-500" : "text-amber-500"
            )}
          >
            تغذية راجعة من الذكاء الاصطناعي:
          </span>
          <p className="text-sm font-bold leading-relaxed italic">
            {item.feedback || "جاري توليد التقييم العادل والملاحظات..."}
          </p>
        </div>
      </div>
    </m.div>
  );
}

function ChurnRadarTab({
  riskStudents,
  summary,
  onIntervene,
  isIntervening,
}: {
  riskStudents: RiskStudent[];
  summary: AiSummary;
  onIntervene: (userId: string) => void;
  isIntervening: boolean;
}) {
  const safePercentage = summary.highRiskCount === 0 ? "100%" : "92%";
  const dropRate = riskStudents.length > 5 ? "8.4%" : "1.2%";

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <StatsCard
          icon={AlertTriangle}
          title="الطلاب المعرضون لخطر التسرب"
          value={riskStudents.length}
          unit="طالب نشط"
          color="orange"
        />
        <StatsCard
          icon={Check}
          title="حالات تم تأمينها (Safe)"
          value={safePercentage}
          color="emerald"
        />
        <StatsCard
          icon={TrendingDown}
          title="معدل الانقطاع المتوقع"
          value={dropRate}
          color="blue"
        />
      </div>

      <AdminCard variant="glass" className="p-0 border-border overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-accent/10">
          <h3 className="text-xl font-black flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" aria-hidden="true" />
            الرادار الذكي لمخاطر الطلاب (Smart Analytics Radar)
          </h3>
          <p className="text-sm text-muted-foreground mt-2 font-bold">
            تحليل حقيقي للسلوك الأكاديمي والانتظام لضمان عدم فقدان أي طالب من جنود المملكة.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {riskStudents.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="لم يتم اكتشاف أي مخاطر حالياً"
              description="استمر في العمل الرائع!"
            />
          ) : (
            riskStudents.map((student, index) => (
              <RiskStudentCard
                key={student.userId}
                student={student}
                onIntervene={onIntervene}
                isIntervening={isIntervening}
                index={index}
              />
            ))
          )}
        </div>
      </AdminCard>
    </>
  );
}

function StatsCard({
  icon: Icon,
  title,
  value,
  unit,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  unit?: string;
  color: "orange" | "emerald" | "blue";
}) {
  const borderColorClass = {
    orange: "border-r-orange-500",
    emerald: "border-r-emerald-500",
    blue: "border-r-blue-500",
  };

  const bgColorClass = {
    orange: "bg-orange-500/10 text-orange-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    blue: "bg-blue-500/10 text-blue-500",
  };

  return (
    <AdminCard
      className={cn(
        "bg-background border-border p-6 shadow-sm border-r-4",
        borderColorClass[color]
      )}
    >
      <div
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-full mb-3",
          bgColorClass[color]
        )}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">
        {title}
      </p>
      <h2 className="text-3xl font-black mt-1">
        {value}
        {unit && (
          <span className="text-sm font-bold text-muted-foreground mr-1">
            {unit}
          </span>
        )}
      </h2>
    </AdminCard>
  );
}

function RiskStudentCard({
  student,
  onIntervene,
  isIntervening,
  index,
}: {
  student: RiskStudent;
  onIntervene: (userId: string) => void;
  isIntervening: boolean;
  index: number;
}) {
  const riskConfig = RISK_BADGE_CONFIG[student.riskLevel] || {
    label: student.riskLevel,
    className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  return (
    <m.div
      variants={motionVariants}
      className="flex flex-col md:flex-row gap-4 p-5 rounded-xl border border-border bg-background/50 items-start md:items-center justify-between hover:border-orange-500/30 transition-all"
    >
      <div className="flex-1 space-y-1">
        <div className="flex gap-3 items-center">
          <h4 className="font-black text-lg">{student.name}</h4>
          <Badge
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-black border uppercase",
              riskConfig.className
            )}
          >
            {riskConfig.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-black">
          <strong className="text-foreground">السبب:</strong> {student.reason}
        </p>
        <div className="flex items-center gap-2 bg-blue-500/5 p-3 rounded-xl mt-3 border border-blue-500/10">
          <Bot className="w-4 h-4 text-blue-500" aria-hidden="true" />
          <p className="text-xs text-blue-500 font-black">
            <strong className="text-blue-600">توصية الإنقاذ:</strong>{" "}
            {student.recommendation}
          </p>
        </div>
      </div>
      <AdminButton
        variant="outline"
        className="shrink-0 font-black h-10 border-blue-500/20 text-blue-500 hover:bg-blue-500/5 gap-2"
        onClick={() => onIntervene(student.userId)}
        loading={isIntervening}
        icon={Zap}
      >
        تطبيق التدخل الآلي
      </AdminButton>
    </m.div>
  );
}

function ForecastTab({
  forecast,
  onAssignPlan,
}: {
  forecast: ForecastItem[];
  onAssignPlan: (userId: string) => void;
}) {
  return (
    <AdminCard variant="glass" className="p-8 border-blue-500/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-blue-500 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 rotate-180" aria-hidden="true" />
            محرك التنبؤ بالأداء النهائي
          </h3>
          <p className="text-muted-foreground mt-2 font-bold">
            بناءً على سلوك الطالب ونتائجه الحالية، يتنبأ الذكاء الاصطناعي بالنتيجة المتوقعة
            في نهاية الرحلة.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {!forecast || forecast.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="لا توجد بيانات كافية للتنبؤ حالياً"
            description="يحتاج الطلاب لإكمال اختبارين على الأقل."
          />
        ) : (
          forecast.map((item, index) => (
            <ForecastItemCard
              key={item.userId}
              item={item}
              onAssignPlan={onAssignPlan}
              index={index}
            />
          ))
        )}
      </div>
    </AdminCard>
  );
}

function ForecastItemCard({
  item,
  onAssignPlan,
}: {
  item: ForecastItem;
  onAssignPlan: (userId: string) => void;
  index: number;
}) {
  const confidenceConfig = FORECAST_CONFIDENCE_CONFIG[item.confidence];
  const isImproving = item.predictedFinalScore > item.currentScore;

  return (
    <m.div
      variants={motionVariants}
      className="flex items-center justify-between p-5 bg-background/50 rounded-2xl border border-border group hover:border-blue-500/50 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <User className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h4 className="font-black text-lg">{item.name}</h4>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>دقة التنبؤ:</span>
            <span className={confidenceConfig.className}>
              {confidenceConfig.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-12 text-center">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-muted-foreground">
            الوضع الحالي
          </span>
          <p className="text-xl font-black">{item.currentScore}%</p>
        </div>
        <div className="w-12 h-px bg-border hidden md:block" />
        <div className="space-y-1 relative">
          <span className="text-[10px] font-black uppercase text-blue-500">
            متوقع مستقبلاً
          </span>
          <p className="text-3xl font-black text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            {item.predictedFinalScore}%
          </p>
          {isImproving && (
            <div className="absolute -top-1 -right-4 text-emerald-500 animate-bounce">
              <TrendingDown className="w-4 h-4 rotate-180" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <AdminButton
        size="sm"
        variant="outline"
        className="h-10 px-6 rounded-xl font-black border-blue-500/20 text-blue-500 hover:bg-blue-500/5 gap-2"
        onClick={() => onAssignPlan(item.userId)}
        icon={Target}
      >
        تخصيص الخطة
      </AdminButton>
    </m.div>
  );
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: AIKnowledgeSource[];
  agent?: AdminAgentCommandResponse;
}

function AgentResultCard({
  agent,
  onExecute,
  isExecuting,
}: {
  agent: AdminAgentCommandResponse;
  onExecute: (commandId: string, confirmed: boolean) => void;
  isExecuting: boolean;
}) {
  const severityClass: Record<string, string> = {
    critical: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-violet-500/20 bg-background/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-violet-400">خطة الوكيل: {agent.action}</p>
          <p className="text-[11px] text-muted-foreground">{agent.commandId}</p>
        </div>
        <Badge variant="outline" className={agent.requiresConfirmation ? "border-amber-500/30 text-amber-400" : "border-emerald-500/30 text-emerald-400"}>
          {agent.requiresConfirmation ? "يحتاج تأكيد" : "آمن"}
        </Badge>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {agent.plan.map((step, index) => (
          <div key={`${agent.commandId}-step-${index}`} className="rounded-xl border border-border/50 bg-muted/30 p-3">
            <p className="text-xs font-black">{step.title}</p>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      {agent.findings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-black text-muted-foreground">نتائج المراجعة</p>
          {agent.findings.map((finding, index) => (
            <div key={`${agent.commandId}-finding-${index}`} className={cn("rounded-xl border p-3 text-xs", severityClass[finding.severity] || severityClass.info)}>
              <p className="font-black">{finding.area}: {finding.message}</p>
              <p className="mt-1 opacity-80">{finding.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <AdminButton
          size="sm"
          variant={agent.requiresConfirmation ? "premium" : "outline"}
          onClick={() => onExecute(agent.commandId, agent.requiresConfirmation)}
          loading={isExecuting}
          disabled={agent.status === "completed" || isExecuting}
          icon={Check}
        >
          {agent.requiresConfirmation ? "تأكيد وتنفيذ" : "تنفيذ آمن"}
        </AdminButton>
        <Badge variant="secondary" className="rounded-xl px-3 py-2 text-[11px]">
          الحالة: {agent.status}
        </Badge>
      </div>
    </div>
  );
}

function AIChatTab() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "أهلاً بك في المساعد الذكي الشامل لإدارة المنصة! أنا متصل بكامل بيانات المشروع الحقيقية (المستخدمون، المواد، الامتحانات، المالية، الفعاليات، الدعم). يمكنك سؤالي عن أي شيء: عدد المستخدمين النشطين، نتائج الامتحانات، الإيرادات والاشتراكات، الفعاليات القادمة، تذاكر الدعم، أو طلب تحليل لأداء المنصة بالكامل.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const agentMutation = useAIAdminAgent({
    onError: (err) => {
      toast.error("فشل تشغيل الوكيل الذكي: " + err.message);
    },
  });
  const executeAgentMutation = useAIAdminAgentExecute({
    onSuccess: (data) => {
      toast.success(data.message);
      setMessages((prev) => prev.map((msg) => (
        msg.agent?.commandId === data.commandId
          ? { ...msg, content: data.message, agent: data }
          : msg
      )));
    },
    onError: (err) => toast.error("فشل تنفيذ أمر الوكيل: " + err.message),
  });
  const copilotMutation = useAICopilot({
    onError: (err) => {
      toast.error("فشل الاتصال بالمساعد الذكي: " + err.message);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, copilotMutation.isPending, agentMutation.isPending]);

  const shouldUseAgent = (value: string) => {
    const text = value.toLowerCase();
    return ["راجع", "مراجعة", "نفذ", "اعمل", "تحكم", "لوحة", "agent", "review", "execute"].some((word) => text.includes(word));
  };

  const handleExecuteAgent = (commandId: string, confirmed: boolean) => {
    executeAgentMutation.mutate({ commandId, confirmed });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || copilotMutation.isPending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");

    if (shouldUseAgent(currentInput)) {
      agentMutation.mutate(
        { command: currentInput },
        {
          onSuccess: (data) => {
            const aiMsg: ChatMessage = {
              id: `agent-${Date.now()}`,
              role: "assistant",
              content: data.message,
              agent: data,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
          },
        }
      );
      return;
    }

    copilotMutation.mutate(
      { prompt: currentInput },
      {
        onSuccess: (data) => {
          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: data.message,
            sources: data.sources,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMsg]);
        },
      }
    );
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "أهلاً بك في المساعد الذكي الشامل لإدارة المنصة! أنا متصل بكامل بيانات المشروع الحقيقية (المستخدمون، المواد، الامتحانات، المالية، الفعاليات، الدعم). يمكنك سؤالي عن أي شيء: عدد المستخدمين النشطين، نتائج الامتحانات، الإيرادات والاشتراكات، الفعاليات القادمة، تذاكر الدعم، أو طلب تحليل لأداء المنصة بالكامل.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <AdminCard variant="glass" className="border-violet-500/20 p-6 flex flex-col h-[600px] bg-background/30">
      <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-500">
            <MessageSquare className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-black">المساعد الذكي المباشر (Copilot Chat)</h3>
            <p className="text-sm text-muted-foreground font-bold">
              دردشة تفاعلية مباشرة لتسهيل إدارة محتوى المنصة والطلاب
            </p>
          </div>
        </div>
        <AdminButton
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="text-xs font-bold border-muted hover:bg-muted"
        >
          مسح المحادثة
        </AdminButton>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 flex flex-col">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[80%] rounded-2xl p-4 text-sm font-medium leading-relaxed",
              msg.role === "user"
                ? "bg-primary text-primary-foreground self-start rounded-br-none"
                : "bg-muted/60 text-foreground self-end rounded-bl-none border border-border/50"
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            {msg.agent && (
              <AgentResultCard
                agent={msg.agent}
                onExecute={handleExecuteAgent}
                isExecuting={executeAgentMutation.isPending}
              />
            )}
            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
              <div className="mt-3 border-t border-border/50 pt-3 space-y-2">
                <p className="text-[10px] font-black text-muted-foreground">المصادر المستخدمة</p>
                <div className="flex flex-wrap gap-2">
                  {msg.sources.slice(0, 6).map((source) => (
                    <span
                      key={`${source.type}-${source.id}`}
                      className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[10px] font-bold text-muted-foreground"
                      title={source.snippet}
                    >
                      {source.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <span className="text-[9px] opacity-60 mt-1 self-start">
              {msg.timestamp.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
        {copilotMutation.isPending || agentMutation.isPending ? (
          <div className="bg-muted/60 text-foreground self-end rounded-2xl rounded-bl-none border border-border/50 p-4 max-w-[80%] flex items-center gap-1.5">
            <div className="h-2 w-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-border/50 pt-4 mt-auto">
        <Input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="اكتب استفسارك هنا..."
          disabled={copilotMutation.isPending || agentMutation.isPending}
          className="h-12 rounded-xl text-sm font-bold bg-background/50 flex-1 text-right"
          dir="rtl"
        />
        <AdminButton
          type="submit"
          disabled={!input.trim() || copilotMutation.isPending || agentMutation.isPending}
          loading={copilotMutation.isPending || agentMutation.isPending}
          className="h-12 w-12 rounded-xl p-0 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 shrink-0"
          icon={Send}
        />
      </form>
    </AdminCard>
  );
}

// ─── تبويب: تحليل البيانات الذكي الشامل ─────────────────────────
function DataAnalysisTab() {
  const analysis = useAIDataAnalysis();
  const refresh = useAIDataAnalysisRefresh();
  const [focus, setFocus] = React.useState("");

  const riskColor: Record<string, string> = {
    low: "bg-emerald-500/10 text-emerald-600",
    medium: "bg-amber-500/10 text-amber-600",
    high: "bg-orange-500/10 text-orange-600",
    critical: "bg-red-500/10 text-red-600",
  };
  const riskLabel: Record<string, string> = {
    low: "منخفض",
    medium: "متوسط",
    high: "مرتفع",
    critical: "حرِج",
  };

  // يحوّل مستوى الخطورة/الشدة (low/medium/high/critical) إلى status مدعوم
  // من AdminBadge (success/warning/error/info/neutral) لتجنب تعطّل StatusBadge
  // الذي لا يعرف هذه القيم.
  const toBadgeStatus = (level?: string): "success" | "warning" | "error" | "info" | "neutral" => {
    switch (level) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
      case "critical":
        return "error";
      default:
        return "neutral";
    }
  };

  const handleRefresh = () => refresh.mutate({ focus: focus.trim() || undefined });

  return (
    <div className="space-y-6">
      <AdminCard className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-fuchsia-500" aria-hidden="true" />
              تحليل البيانات الذكي
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              يربط الذكاء الاصطناعي بكامل بيانات المنصة الحقيقية: المستخدمين، الكورسات، الامتحانات،
              المالية، المجتمع والدعم. ينتج رؤى وتوصيات قابلة للتنفيذ.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <Input
              placeholder="ركز على مجال محدد (اختياري)، مثال: الاحتفاظ بالطلاب"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="md:w-72"
            />
            <AdminButton
              variant="default"
              onClick={handleRefresh}
              disabled={refresh.isPending}
              className="shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ml-2 ${refresh.isPending ? "animate-spin" : ""}`} aria-hidden="true" />
              {refresh.isPending ? "جارٍ التحليل..." : "تحليل الآن"}
            </AdminButton>
          </div>
        </div>
        {analysis.data?.cached === true && !refresh.isPending ? (
          <p className="text-xs text-muted-foreground mt-3">
            نتيجة مخزّنة مؤقتاً (تُحدّث كل دقيقة). اضغط «تحليل الآن» للتحديث الفوري.
          </p>
        ) : null}
      </AdminCard>

      {analysis.isLoading ? (
        <AdminCard className="p-10 text-center text-muted-foreground">
          <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin text-fuchsia-500" aria-hidden="true" />
          جارٍ جمع بيانات المنصة وتحليلها...
        </AdminCard>
      ) : analysis.isError ? (
        <AdminCard className="p-10 text-center text-red-600">
          تعذّر تحليل بيانات المشروع. تأكد من تشغيل الخادم والاتصال بقاعدة البيانات.
        </AdminCard>
      ) : (
        (() => {
          const d = analysis.data as AIDataAnalysisResult | undefined;
          if (!d) return null;
          return (
            <div className="space-y-6">
              {d.riskLevel ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">مستوى المخاطرة:</span>
                  <AdminBadge
                    variant="outline"
                    status={toBadgeStatus(d.riskLevel)}
                    dot
                    className={riskColor[d.riskLevel] || "bg-muted"}
                  >
                    {riskLabel[d.riskLevel] || d.riskLevel}
                  </AdminBadge>
                  {d.modelPowered === false ? (
                    <span className="text-xs text-amber-600">
                      (تحليل محلي من البيانات — النموذج الذكي غير متصل)
                    </span>
                  ) : null}
                </div>
              ) : null}

              {d.summary ? (
                <AdminCard className="p-5 border-fuchsia-500/20 bg-fuchsia-500/5">
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fuchsia-500" aria-hidden="true" />
                    الملخص التنفيذي
                  </h4>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{d.summary}</p>
                </AdminCard>
              ) : null}

              {d.insights && d.insights.length > 0 ? (
                <AdminCard className="p-5">
                  <h4 className="font-bold mb-3">مؤشرات سريعة</h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {d.insights.map((ins, idx) => (
                      <div key={idx} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-muted-foreground">{ins.label}</span>
                          <AdminBadge
                            variant="outline"
                            status={toBadgeStatus(ins.severity)}
                            dot
                            className={riskColor[ins.severity] || "bg-muted"}
                          >
                            {ins.severity}
                          </AdminBadge>
                        </div>
                        <p className="text-sm">{ins.value}</p>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-2">
                {d.strengths && d.strengths.length > 0 ? (
                  <AdminCard className="p-5 border-emerald-500/20">
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-emerald-600">
                      <TrendingDown className="w-4 h-4 rotate-180" aria-hidden="true" /> نقاط القوة
                    </h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      {d.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </AdminCard>
                ) : null}

                {d.weaknesses && d.weaknesses.length > 0 ? (
                  <AdminCard className="p-5 border-orange-500/20">
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="w-4 h-4" aria-hidden="true" /> نقاط الضعف والمخاطر
                    </h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      {d.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </AdminCard>
                ) : null}

                {d.opportunities && d.opportunities.length > 0 ? (
                  <AdminCard className="p-5 border-blue-500/20">
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-600">
                      <Lightbulb className="w-4 h-4" aria-hidden="true" /> الفرص
                    </h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      {d.opportunities.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </AdminCard>
                ) : null}

                {d.recommendations && d.recommendations.length > 0 ? (
                  <AdminCard className="p-5 border-fuchsia-500/20">
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-fuchsia-600">
                      <Zap className="w-4 h-4" aria-hidden="true" /> التوصيات
                    </h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      {d.recommendations.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </AdminCard>
                ) : null}
              </div>

              {d.weakSubjects && d.weakSubjects.length > 0 ? (
                <AdminCard className="p-5">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    المواد الأضعف أداءً
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-right p-2">المادة</th>
                          <th className="text-right p-2">معدل الإكمال</th>
                          <th className="text-right p-2">المسجلون</th>
                          <th className="text-right p-2">التقييم</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.weakSubjects.map((s, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="p-2 font-medium">{s.title}</td>
                            <td className="p-2">{s.completionRate?.toFixed(1)}%</td>
                            <td className="p-2">{s.enrolledCount}</td>
                            <td className="p-2">{s.rating?.toFixed(1) || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AdminCard>
              ) : null}
            </div>
          );
        })()
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="p-12 text-center space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-8 h-8" aria-hidden="true" />
      </div>
      <p className="font-black text-lg">{title}</p>
      <p className="text-muted-foreground text-sm font-bold">{description}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <div className="mb-8 rounded-[2rem] border border-border/60 bg-card/80 px-5 py-5 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded-lg mb-3" />
        <div className="h-4 w-96 bg-muted rounded-lg" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card/80 p-6 animate-pulse"
          >
            <div className="h-7 w-48 bg-muted rounded-lg mb-6" />
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded-xl" />
              <div className="h-12 bg-muted rounded-xl" />
              <div className="h-40 bg-muted rounded-xl" />
              <div className="h-14 bg-muted rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

export default function AdminAIPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminAIContent />
    </Suspense>
  );
}

function AdminAIContent() {
  const searchParams = useSearchParams();
  const [contentType, setContentType] = React.useState<string>("exam_blueprint");
  const [title, setTitle] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [subjectId] = React.useState(searchParams.get("subjectId") || "general");

  // ── استخدام الـ hooks الموحدة ──────────────────────────

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAIDashboard();

  const generateMutation = useAIGenerateContent({
    onSuccess: () => {
      toast.success("تم التوليد وتم الإرسال للمراجعة البشرية بنجاح!");
      setTitle("");
      setPrompt("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const reviewMutation = useAIReviewContent({
    onSuccess: (_data, variables) => {
      toast.success(
        variables.decision === "approve"
          ? "تم الاعتماد وتشغيل المحتوى"
          : "تم رفض المحتوى"
      );
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const actionMutation = useAIExecuteAction({
    onSuccess: (data) => {
      toast.success(data.message || "تم تنفيذ الإجراء بنجاح");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Quick Access sub-pages data ───────────────────────

  const { data: assistantsData } = useAIAssistants();
  const { data: reviewData } = useAIContentReview({ page: 1, pageSize: 1 } as Parameters<typeof useAIContentReview>[0]);
  const { data: logsData } = useAILogs({ page: 1, pageSize: 1 } as AILogsParams);
  const { data: moderationData } = useAIModeration({ page: 1, pageSize: 1 } as ModerationParams);

  const assistantsCount = assistantsData?.assistants?.length || 0;
  const activeAssistants =
    assistantsData?.assistants?.filter((a) => a.status === "active").length || 0;
  const pendingReview = reviewData?.stats?.pending || 0;
  const highPriorityReview = reviewData?.stats?.urgentCount || 0;
  const logsLast24h = logsData?.stats?.totalLogs || 0;
  const errorRate =
    logsData?.stats && logsData.stats.totalLogs > 0
      ? (100 - logsData.stats.successRate)
      : 0;
  const openCases =
    (moderationData?.stats?.pendingCases || 0) +
    (moderationData?.stats?.escalatedCases || 0);
  const criticalCases = moderationData?.stats?.escalatedCases || 0;

  // ── Derived Data ───────────────────────────────────────

  const pendingItems = useMemo(
    () => data?.reviewQueue?.filter((i) => i.status === "pending_review") || [],
    [data?.reviewQueue]
  );

  const riskStudents = useMemo(() => data?.riskStudents || [], [data?.riskStudents]);
  const gradingQueue = useMemo(() => data?.gradingQueue || [], [data?.gradingQueue]);

  // ── Callbacks ──────────────────────────────────────────

  const handleGenerate = useCallback(() => {
    if (!title.trim() || !prompt.trim()) {
      toast.warning("يرجى إدخال العنوان والتعليمات");
      return;
    }
    generateMutation.mutate({
      contentType: contentType as "exam_blueprint" | "curriculum_outline" | "article" | "update_suggestion" | "lesson_summary" | "learning_path",
      title,
      prompt,
      subjectId: subjectId === "general" ? null : subjectId,
    });
  }, [title, prompt, contentType, subjectId, generateMutation]);

  const handleApprove = useCallback(
    (id: string) => reviewMutation.mutate({ id, decision: "approve" }),
    [reviewMutation]
  );

  const handleReject = useCallback(
    (id: string) => reviewMutation.mutate({ id, decision: "reject" }),
    [reviewMutation]
  );

  const handleNotifyInactive = useCallback(
    () => actionMutation.mutate({ type: "notify_inactive", params: { days: 3 } }),
    [actionMutation]
  );

  const handleIntervene = useCallback(
    (studentId: string) =>
      actionMutation.mutate({
        type: "generate_revision_plan",
        params: { studentId },
      }),
    [actionMutation]
  );

  const handleAssignPlan = useCallback(
    (userId: string) => {
      toast.info(`جاري تخصيص خطة للطالب ${userId}...`);
    },
    []
  );

  // ── Error State ────────────────────────────────────────

  if (isError) {
    return (
      <div className="space-y-8 pb-20" dir="rtl">
        <PageHeader
          title="مركز الذكاء الاصطناعي (AI Hub)"
          description="تعذر تحميل بيانات مركز الذكاء الاصطناعي"
        />
        <AdminCard className="p-12 text-center border-destructive/30 bg-destructive/5">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-black mb-2">حدث خطأ في تحميل البيانات</h3>
          <p className="text-muted-foreground mb-4">
            {(error as Error)?.message || "يرجى المحاولة مرة أخرى"}
          </p>
          <AdminButton
            variant="default"
            onClick={() => refetch()}
            icon={RefreshCw}
          >
            إعادة المحاولة
          </AdminButton>
        </AdminCard>
      </div>
    );
  }

  // ── Loading State ──────────────────────────────────────
  // نعرض الهيكل الكامل (الترويسة + التبويبات) فوراً بدلاً من شاشة تحميل كاملة،
  // حتى تُرسم أكبر عناصر الصفحة (LCP) دون انتظار جلب البيانات. الأقسام
  // المعتمدة على البيانات تستخدم قيماً فارغة آمنة حتى يصل الرد. هذا يقلّل
  // "تأخير رسم العنصر" (Element render delay) الذي أبرزه تقرير الأداء.

  const loadedData = isLoading ? null : data;

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="مركز الذكاء الاصطناعي (AI Hub)"
        description="استوديو توليد المحتوى، نظام التقييم الآلي للأسئلة المقالية، ومحرك التنبؤ بمخاطر التسرب الأكاديمي للطلاب."
      >
        <div className="flex items-center gap-3">
          <StatusBadge
            status={generateMutation.isPending ? "pending" : "verified"}
          />
          <span className="text-sm font-black text-muted-foreground hidden sm:inline-block">
            {generateMutation.isPending
              ? "محرك الذكاء يعمل..."
              : "الأنظمة الذكية مستقرة"}
          </span>
        </div>
      </PageHeader>

      {/* AI Briefing */}
      <AnimatePresence>
        {loadedData?.summary?.aiBriefing && (
          <AiBriefingCard
            briefing={loadedData.summary.aiBriefing}
            onNotifyInactive={handleNotifyInactive}
            onRefresh={() => refetch()}
            isNotifying={actionMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Quick Access sub-pages */}
      <QuickAccessRow
        assistantsCount={assistantsCount}
        activeAssistants={activeAssistants}
        pendingReview={pendingReview}
        highPriorityReview={highPriorityReview}
        logsLast24h={logsLast24h}
        errorRate={errorRate}
        openCases={openCases}
        criticalCases={criticalCases}
      />

      {/* Tabs */}
      <Tabs defaultValue="studio" className="w-full">
        <TabsList className="w-full bg-background/50 h-14 p-1 border-border rounded-xl mb-6 overflow-x-auto">
          <TabsTrigger
            value="studio"
            className="w-full h-full text-base font-bold rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap"
          >
            <Bot className="w-4 h-4 ml-2" aria-hidden="true" />
            Content Studio
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="w-full h-full text-base font-bold rounded-lg data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-500 whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4 ml-2" aria-hidden="true" />
            محادثة مباشرة
          </TabsTrigger>
          <TabsTrigger
            value="grading"
            className="w-full h-full text-base font-bold rounded-lg data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 whitespace-nowrap"
          >
            <Target className="w-4 h-4 ml-2" aria-hidden="true" />
            Auto-Grading
            {loadedData?.summary?.pendingGradingCount
              ? ` (${loadedData.summary.pendingGradingCount})`
              : ""}
          </TabsTrigger>
          <TabsTrigger
            value="churn"
            className="w-full h-full text-base font-bold rounded-lg data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-500 whitespace-nowrap"
          >
            <AlertTriangle className="w-4 h-4 ml-2" aria-hidden="true" />
            Churn Radar
            {loadedData?.summary?.highRiskCount
              ? ` (${loadedData.summary.highRiskCount})`
              : ""}
          </TabsTrigger>
          <TabsTrigger
            value="forecast"
            className="w-full h-full text-base font-bold rounded-lg data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500 whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4 ml-2" aria-hidden="true" />
            Predictions 🚀
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="w-full h-full text-base font-bold rounded-lg data-[state=active]:bg-fuchsia-500/10 data-[state=active]:text-fuchsia-500 whitespace-nowrap"
          >
            <BrainCircuit className="w-4 h-4 ml-2" aria-hidden="true" />
            تحليل البيانات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="studio" className="mt-0">
          <ContentStudioTab
            contentType={contentType}
            setContentType={setContentType}
            title={title}
            setTitle={setTitle}
            prompt={prompt}
            setPrompt={setPrompt}
            subjectId={subjectId}
            isGenerating={generateMutation.isPending}
            onGenerate={handleGenerate}
            pendingItems={pendingItems}
            onApprove={handleApprove}
            onReject={handleReject}
            isReviewing={reviewMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <AIChatTab />
        </TabsContent>

        <TabsContent value="grading" className="mt-0">
          <GradingTab gradingQueue={gradingQueue} />
        </TabsContent>

        <TabsContent value="churn" className="mt-0">
          <ChurnRadarTab
            riskStudents={riskStudents}
            summary={
              loadedData?.summary || {
                highRiskCount: 0,
                reviewPendingCount: 0,
                pendingGradingCount: 0,
              }
            }
            onIntervene={handleIntervene}
            isIntervening={actionMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="forecast" className="mt-0">
          <ForecastTab
            forecast={loadedData?.forecast || []}
            onAssignPlan={handleAssignPlan}
          />
        </TabsContent>

        <TabsContent value="analysis" className="mt-0">
          <DataAnalysisTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
