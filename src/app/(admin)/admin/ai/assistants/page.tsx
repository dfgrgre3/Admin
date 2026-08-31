"use client";

import * as React from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  Bot,
  Brain,
  Shield,
  Sparkles,
  Target,
  Eye,
  MessageSquare,
  Send,
  Activity,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Loader2,
  AlertTriangle,
  Cpu,
  Zap,
  TrendingUp,
  Settings as SettingsIcon,
  PlayCircle,
  StopCircle,
  ArrowUpRight,
  Calendar,
  Layers,
  Hash,
  ChevronRight,
  Info,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  useAIAssistants,
  useAIToggleAssistant,
  useAIUpdateAssistant,
  useAITestAssistant,
} from "@/lib/ai/ai-hooks";
import type {
  Assistant,
  AssistantOverview,
  AssistantStatus,
  AssistantType,
  AssistantCapability,
} from "@/lib/ai/types";
import { cn } from "@/lib/utils";

// ─── Configuration Constants ───────────────────────────────

const ASSISTANT_TYPE_CONFIG: Record<
  AssistantType,
  { label: string; labelEn: string; icon: React.ElementType; color: string; gradient: string }
> = {
  copilot: {
    label: "المساعد الإداري",
    labelEn: "Admin Copilot",
    icon: MessageSquare,
    color: "violet",
    gradient: "from-violet-500/20 to-purple-500/10",
  },
  content_studio: {
    label: "استوديو المحتوى",
    labelEn: "Content Studio",
    icon: Sparkles,
    color: "fuchsia",
    gradient: "from-fuchsia-500/20 to-pink-500/10",
  },
  tutor: {
    label: "المعلم الذكي",
    labelEn: "AI Tutor",
    icon: Brain,
    color: "blue",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  moderator: {
    label: "الرقابة الذكية",
    labelEn: "Smart Moderator",
    icon: Shield,
    color: "amber",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  grader: {
    label: "المصحح الآلي",
    labelEn: "Auto Grader",
    icon: Target,
    color: "emerald",
    gradient: "from-emerald-500/20 to-green-500/10",
  },
  forecast: {
    label: "محرك التنبؤ",
    labelEn: "Forecast Engine",
    icon: TrendingUp,
    color: "rose",
    gradient: "from-rose-500/20 to-red-500/10",
  },
};

const STATUS_CONFIG: Record<
  AssistantStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  active: {
    label: "نشط",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: CheckCircle2,
  },
  idle: {
    label: "خامل",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: Pause,
  },
  disabled: {
    label: "معطل",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/30",
    icon: XCircle,
  },
  training: {
    label: "قيد التدريب",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: Loader2,
  },
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  claude: "Claude",
  deepseek: "DeepSeek",
  auto: "تلقائي",
};

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
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Overview Stats Cards ───────────────────────────────────

function OverviewCards({ overview }: { overview: AssistantOverview }) {
  const cards = [
    {
      label: "إجمالي المساعدين",
      value: overview.totalAssistants,
      sub: `${overview.activeAssistants} نشط`,
      icon: Bot,
      color: "violet" as const,
    },
    {
      label: "استدعاءات اليوم",
      value: overview.totalCallsToday,
      sub: `${overview.totalCallsThisWeek.toLocaleString("ar-EG")} هذا الأسبوع`,
      icon: Zap,
      color: "fuchsia" as const,
    },
    {
      label: "التوكنات المستخدمة",
      value: overview.totalTokensThisWeek,
      sub: "هذا الأسبوع",
      icon: Cpu,
      color: "blue" as const,
    },
    {
      label: "معدل النجاح",
      value: `${overview.averageSuccessRate.toFixed(1)}%`,
      sub: "متوسط لجميع المساعدين",
      icon: Activity,
      color: "emerald" as const,
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

// ─── Assistant Card ─────────────────────────────────────────

function AssistantCard({
  assistant,
  onConfigure,
  onTest,
  onToggle,
  isToggling,
}: {
  assistant: Assistant;
  onConfigure: (a: Assistant) => void;
  onTest: (a: Assistant) => void;
  onToggle: (id: string, status: AssistantStatus) => void;
  isToggling: boolean;
}) {
  const typeConfig = ASSISTANT_TYPE_CONFIG[assistant.type];
  const statusConfig = STATUS_CONFIG[assistant.status];
  const Icon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const successRateColor =
    assistant.capabilities.length > 0
      ? assistant.capabilities.reduce((sum, c) => sum + c.successRate, 0) /
        assistant.capabilities.length >=
        80
        ? "text-emerald-500"
        : assistant.capabilities.reduce((sum, c) => sum + c.successRate, 0) /
            assistant.capabilities.length >=
          50
        ? "text-amber-500"
        : "text-rose-500"
      : "text-muted-foreground";

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      layout
    >
      <AdminCard
        variant="glass"
        className={cn(
          "group relative overflow-hidden border-border transition-all hover:border-primary/40",
          "bg-gradient-to-br",
          typeConfig.gradient
        )}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl opacity-30" />

        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-2xl p-3 border", statusConfig.bg)}>
                <Icon className={cn("h-6 w-6", statusConfig.color)} />
              </div>
              <div>
                <h3 className="font-black text-base leading-tight">{assistant.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {assistant.nameEn}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black",
                statusConfig.bg
              )}
            >
              <StatusIcon
                className={cn("h-3 w-3", statusConfig.color, assistant.status === "training" && "animate-spin")}
              />
              <span className={statusConfig.color}>{statusConfig.label}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {assistant.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="rounded-full bg-background/50 border border-border/60 px-2 py-0.5 font-bold">
              {PROVIDER_LABELS[assistant.provider] || assistant.provider}
            </span>
            <span className="rounded-full bg-background/50 border border-border/60 px-2 py-0.5 font-bold">
              {assistant.model}
            </span>
            <span className="rounded-full bg-background/50 border border-border/60 px-2 py-0.5 font-bold">
              {assistant.totalCalls.toLocaleString("ar-EG")} استدعاء
            </span>
            <span className={cn("rounded-full bg-background/50 border border-border/60 px-2 py-0.5 font-black", successRateColor)}>
              {assistant.capabilities.length > 0
                ? `${(
                    assistant.capabilities.reduce((sum, c) => sum + c.successRate, 0) /
                    assistant.capabilities.length
                  ).toFixed(0)}% نجاح`
                : "—"}
            </span>
          </div>

          {/* Capabilities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>
                <Layers className="ml-1 inline h-3 w-3" />
                القدرات ({assistant.capabilities.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assistant.capabilities.slice(0, 4).map((cap) => (
                <span
                  key={cap.id}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-bold border",
                    cap.enabled
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/30 text-muted-foreground border-border opacity-60"
                  )}
                  title={cap.description}
                >
                  {cap.name}
                </span>
              ))}
              {assistant.capabilities.length > 4 && (
                <span className="rounded-md bg-muted/30 px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
                  +{assistant.capabilities.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 border-t border-border/50 pt-3">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                توكنات
              </p>
              <p className="text-sm font-black">
                {(assistant.totalTokens / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                زمن الاستجابة
              </p>
              <p className="text-sm font-black">{assistant.averageLatencyMs}ms</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                آخر استخدام
              </p>
              <p className="text-xs font-bold">
                {assistant.lastUsedAt
                  ? new Date(assistant.lastUsedAt).toLocaleDateString("ar-EG", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-t border-border/50 pt-3">
            <AdminButton
              variant="outline"
              size="sm"
              className="flex-1 font-bold gap-1"
              onClick={() => onConfigure(assistant)}
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              إعدادات
            </AdminButton>
            <AdminButton
              variant="outline"
              size="sm"
              className="flex-1 font-bold gap-1"
              onClick={() => onTest(assistant)}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              اختبار
            </AdminButton>
            <AdminButton
              variant={assistant.status === "active" ? "destructive" : "default"}
              size="sm"
              className="px-3"
              onClick={() =>
                onToggle(
                  assistant.id,
                  assistant.status === "active" ? "disabled" : "active"
                )
              }
              loading={isToggling}
            >
              {assistant.status === "active" ? (
                <StopCircle className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </AdminButton>
          </div>
        </div>
      </AdminCard>
    </m.div>
  );
}

// ─── Configuration Dialog ───────────────────────────────────

function ConfigurationDialog({
  assistant,
  open,
  onOpenChange,
}: {
  assistant: Assistant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = React.useState("general");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [systemPrompt, setSystemPrompt] = React.useState("");
  const [temperature, setTemperature] = React.useState(0.7);
  const [maxTokens, setMaxTokens] = React.useState(2048);
  const [capabilities, setCapabilities] = React.useState<AssistantCapability[]>([]);

  const updateMutation = useAIUpdateAssistant();

  React.useEffect(() => {
    if (assistant) {
      setName(assistant.name);
      setDescription(assistant.description);
      setSystemPrompt(assistant.systemPrompt);
      setTemperature(assistant.temperature);
      setMaxTokens(assistant.maxTokens);
      setCapabilities(assistant.capabilities);
    }
  }, [assistant]);

  const handleSave = () => {
    if (!assistant) return;
    updateMutation.mutate(
      {
        id: assistant.id,
        payload: {
          name,
          description,
          systemPrompt,
          temperature,
          maxTokens,
          capabilities,
        },
      },
      {
        onSuccess: () => {
          toast.success("تم حفظ إعدادات المساعد بنجاح");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const toggleCapability = (id: string) => {
    setCapabilities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  if (!assistant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            إعدادات المساعد: {assistant.name}
          </DialogTitle>
          <DialogDescription>
            اضبط سلوك وموديلات وقدرات المساعد الذكي
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="capabilities">القدرات</TabsTrigger>
            <TabsTrigger value="advanced">متقدم</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black">
                اسم المساعد
              </Label>
              <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-black">
                الوصف
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-xs font-black">
                موجه النظام (System Prompt)
              </Label>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={6}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                التعليمات التي توجه سلوك المساعد في جميع المحادثات
              </p>
            </div>
          </TabsContent>

          <TabsContent value="capabilities" className="space-y-3 pt-4">
            <p className="text-xs text-muted-foreground">
              فعّل أو عطّل القدرات التي يمكن للمساعد تنفيذها
            </p>
            {capabilities.map((cap) => (
              <AdminCard key={cap.id} variant="outline" className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-black text-sm">{cap.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{cap.description}</p>
                    <div className="flex gap-3 mt-2 text-[10px] font-bold text-muted-foreground">
                      <span>
                        <Hash className="inline h-3 w-3 ml-1" />
                        {cap.usageCount.toLocaleString("ar-EG")} استخدام
                      </span>
                      <span>• {cap.successRate.toFixed(1)}% نجاح</span>
                    </div>
                  </div>
                  <Switch
                    checked={cap.enabled}
                    onCheckedChange={() => toggleCapability(cap.id)}
                  />
                </div>
              </AdminCard>
            ))}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-black">
                الحرارة (Temperature): {temperature.toFixed(2)}
              </Label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-[10px] text-muted-foreground">
                قيمة منخفضة = إجابات أكثر دقة، قيمة عالية = إجابات أكثر إبداعاً
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black">
                الحد الأقصى للتوكنات: {maxTokens.toLocaleString("ar-EG")}
              </Label>
              <input
                type="range"
                min={256}
                max={8192}
                step={256}
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-blue-600">معلومات الموديل</p>
                  <p className="text-muted-foreground">
                    المزود: <strong>{PROVIDER_LABELS[assistant.provider]}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    الموديل: <code className="bg-background px-1 rounded">{assistant.model}</code>
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <AdminButton variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            onClick={handleSave}
            loading={updateMutation.isPending}
            icon={CheckCircle2}
          >
            حفظ التغييرات
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Test Dialog ────────────────────────────────────────────

function TestDialog({
  assistant,
  open,
  onOpenChange,
}: {
  assistant: Assistant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [prompt, setPrompt] = React.useState("");
  const [response, setResponse] = React.useState<{
    text: string;
    durationMs: number;
  } | null>(null);

  const testMutation = useAITestAssistant({
    onSuccess: (data) => {
      setResponse({ text: data.response, durationMs: data.durationMs });
      toast.success("تم اختبار المساعد بنجاح");
    },
    onError: (err) => toast.error(err.message),
  });

  React.useEffect(() => {
    if (open) {
      setPrompt("");
      setResponse(null);
    }
  }, [open]);

  const handleTest = () => {
    if (!assistant || !prompt.trim()) {
      toast.warning("يرجى كتابة رسالة لاختبار المساعد");
      return;
    }
    testMutation.mutate({ id: assistant.id, prompt });
  };

  if (!assistant) return null;

  const Icon = ASSISTANT_TYPE_CONFIG[assistant.type].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            اختبار المساعد: {assistant.name}
          </DialogTitle>
          <DialogDescription>
            أرسل رسالة للمساعد وشاهد كيف يستجيب قبل استخدامه في الإنتاج
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-black">رسالة الاختبار</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكستب سؤالك أو طلبك للمساعد هنا..."
              rows={4}
            />
          </div>

          {response && (
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-primary/30 bg-primary/5 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-black text-primary">
                  <Bot className="h-4 w-4" />
                  الاستجابة
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {response.durationMs}ms
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{response.text}</p>
            </m.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <AdminButton variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </AdminButton>
          <AdminButton
            onClick={handleTest}
            loading={testMutation.isPending}
            icon={Send}
            disabled={!prompt.trim()}
          >
            إرسال الاختبار
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Filter Toolbar ─────────────────────────────────────────

function FilterToolbar({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
}: {
  search: string;
  setSearch: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}) {
  return (
    <AdminCard variant="glass" className="p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <TextInput
          placeholder="ابحث في المساعدين..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2"
        />
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-bold"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">جميع الأنواع</option>
          {Object.entries(ASSISTANT_TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-bold"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
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

export default function AiAssistantsPage() {
  const { data, isLoading, isError, error, refetch } = useAIAssistants();
  const toggleMutation = useAIToggleAssistant();

  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const [configAssistant, setConfigAssistant] = React.useState<Assistant | null>(null);
  const [testAssistant, setTestAssistant] = React.useState<Assistant | null>(null);

  const filteredAssistants = React.useMemo(() => {
    if (!data?.assistants) return [];
    return data.assistants.filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.nameEn.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data?.assistants, typeFilter, statusFilter, search]);

  const handleToggle = (id: string, status: AssistantStatus) => {
    toggleMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success(
            status === "active" ? "تم تفعيل المساعد" : "تم تعطيل المساعد"
          );
        },
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
          title="المساعدون الذكيون"
          description="إدارة وتكوين جميع المساعدين الذكيين في المنصة"
        />
        <AdminCard className="p-12 text-center border-destructive/30 bg-destructive/5">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-black mb-2">تعذر تحميل المساعدين</h3>
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

  const assistants = data?.assistants || [];
  const overview = data?.overview || {
    totalAssistants: 0,
    activeAssistants: 0,
    totalCallsToday: 0,
    totalCallsThisWeek: 0,
    totalTokensThisWeek: 0,
    averageSuccessRate: 0,
    topPerformer: null,
    needsAttention: [],
  };

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        eyebrow="الذكاء الاصطناعي"
        title="المساعدون الذكيون"
        description="إدارة شاملة لجميع المساعدين الذكيين في المنصة: التفعيل، التكوين، الاختبار، ومراقبة الأداء."
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={overview.activeAssistants > 0 ? "active" : "inactive"} />
          <span className="text-xs font-bold text-muted-foreground">
            {overview.activeAssistants} من {overview.totalAssistants} نشط
          </span>
        </div>
      </PageHeader>

      {/* Overview Cards */}
      <OverviewCards overview={overview} />

      {/* Top Performer Banner */}
      {overview.topPerformer && (
        <AdminCard
          variant="gradient"
          className="border-primary/30 bg-primary/5 p-5 flex flex-col md:flex-row items-start md:items-center gap-4"
        >
          <div className="rounded-2xl bg-primary/20 p-4 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-primary">
              المساعد الأكثر أداءً
            </p>
            <h3 className="text-xl font-black">{overview.topPerformer.name}</h3>
            <p className="text-sm text-muted-foreground">
              {overview.topPerformer.totalCalls.toLocaleString("ar-EG")} استدعاء •{" "}
              {overview.topPerformer.averageLatencyMs}ms زمن استجابة
            </p>
          </div>
          <AdminButton
            variant="outline"
            onClick={() => setConfigAssistant(overview.topPerformer)}
            icon={SettingsIcon}
          >
            عرض الإعدادات
          </AdminButton>
        </AdminCard>
      )}

      {/* Filter */}
      <FilterToolbar
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Assistants Grid */}
      {filteredAssistants.length === 0 ? (
        <AdminCard className="p-16 text-center">
          <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-black text-lg">لا يوجد مساعدون مطابقون</p>
          <p className="text-sm text-muted-foreground mt-1">
            جرب تعديل عوامل التصفية أو البحث
          </p>
        </AdminCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredAssistants.map((assistant) => (
              <AssistantCard
                key={assistant.id}
                assistant={assistant}
                onConfigure={setConfigAssistant}
                onTest={setTestAssistant}
                onToggle={handleToggle}
                isToggling={toggleMutation.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Needs Attention */}
      {overview.needsAttention.length > 0 && (
        <AdminCard variant="outline" className="border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-black text-amber-600">يحتاج إلى انتباه</h3>
              <p className="text-xs text-muted-foreground mt-1">
                مساعدون بمعدل نجاح منخفض أو خاملون لفترة طويلة
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {overview.needsAttention.map((a) => (
                  <AdminBadge key={a.id} variant="outline" status="warning">
                    {a.name}
                  </AdminBadge>
                ))}
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Dialogs */}
      <ConfigurationDialog
        assistant={configAssistant}
        open={!!configAssistant}
        onOpenChange={(open) => !open && setConfigAssistant(null)}
      />
      <TestDialog
        assistant={testAssistant}
        open={!!testAssistant}
        onOpenChange={(open) => !open && setTestAssistant(null)}
      />
    </div>
  );
}