"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Edit,
  Sparkles,
  Send,
  Eye,
  Link as LinkIcon,
  Tag as TagIcon,
  X,
  Plus,
  Globe,
  Hash,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  TYPE_CONFIG,
  Announcement,
  AnnouncementAudienceSegment,
  AnnouncementBroadcastChannel,
  AUDIENCE_SEGMENT_VALUES,
  CHANNEL_VALUES,
} from "./types";
import { AnnouncementPreviewContent } from "./preview-dialog";
import { SchedulePicker } from "./schedule-picker";
import { AudienceSelector } from "./audience-selector";
import { TemplatesButton } from "./templates-gallery";
import { TemplatesGallery } from "./templates-gallery";
import { SaveAsTemplateDialog } from "./save-as-template-dialog";
import { RecurrencePicker } from "./recurrence-picker";
import { ApprovalToggle } from "./approval-workflow";
import { SmartAssistant } from "./smart-assistant";

const TipTapEditor = dynamic(
  () => import("@/components/ui/tiptap-editor").then((mod) => mod.TipTapEditor),
  {
    ssr: false,
    loading: () => <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />,
  }
);

export const announcementSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان الإعلان مطلوب")
    .max(200, "العنوان طويل جداً (200 حرف كحد أقصى)"),
  content: z.string().min(1, "محتوى الإعلان مطلوب"),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  isActive: z.boolean(),
  link: z.string().url("رابط غير صحيح").or(z.literal("")).optional(),
  category: z.string().max(80).optional(),
  tags: z.array(z.string().min(1).max(40)).max(10).optional(),
  internalNotes: z.string().max(500).optional(),
  scheduledAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  audience: z.array(z.enum(AUDIENCE_SEGMENT_VALUES as [string, ...string[]])).optional(),
  audienceGrades: z.array(z.string()).optional(),
  audienceRoles: z.array(z.string()).optional(),
  audienceUserIds: z.array(z.string()).optional(),
  channels: z.array(z.enum(CHANNEL_VALUES as [string, ...string[]])).optional(),
  requiresApproval: z.boolean().optional(),
  recurrence: z
    .object({
      frequency: z.enum(["none", "daily", "weekly", "biweekly", "monthly", "custom"]),
      count: z.number().min(0),
      weekdays: z.array(z.number().min(0).max(6)).optional(),
      dayOfMonth: z.number().min(1).max(31).optional(),
      hour: z.number().min(0).max(23),
      minute: z.number().min(0).max(59),
      endDate: z.string().optional(),
    })
    .optional(),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

const defaultValues: AnnouncementFormValues = {
  title: "",
  content: "",
  type: "INFO",
  priority: "MEDIUM",
  isActive: true,
  link: "",
  category: "",
  tags: [],
  internalNotes: "",
  scheduledAt: null,
  expiresAt: null,
  audience: ["all"],
  audienceGrades: [],
  audienceRoles: [],
  audienceUserIds: [],
  channels: ["in_app"],
  requiresApproval: false,
  recurrence: { frequency: "none", count: 0, hour: 9, minute: 0 },
};

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
  submitting?: boolean;
  onSubmit: (values: AnnouncementFormValues) => Promise<void>;
}

const TABS = [
  { id: "content", label: "المحتوى", icon: Edit },
  { id: "audience", label: "الجمهور", icon: Sparkles },
  { id: "schedule", label: "الجدولة", icon: Send },
  { id: "preview", label: "معاينة", icon: Eye },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AnnouncementDialog({
  open,
  onOpenChange,
  announcement = null,
  submitting = false,
  onSubmit,
}: AnnouncementDialogProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>("content");
  const [tagInput, setTagInput] = React.useState("");
  const [autoTitle, setAutoTitle] = React.useState(true);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues,
  });

  // مزامنة الحقول عند فتح النافذة للإنشاء أو التعديل
  React.useEffect(() => {
    if (!open) return;
    if (announcement) {
      form.reset({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        isActive: announcement.isActive,
        link: announcement.link || "",
        category: announcement.category || "",
        tags: announcement.tags || [],
        internalNotes: announcement.internalNotes || "",
        scheduledAt: announcement.scheduledAt || null,
        expiresAt: announcement.expiresAt || null,
        audience: (announcement.audience?.length ? announcement.audience : ["all"]) as AnnouncementAudienceSegment[],
        audienceGrades: announcement.audienceGrades || [],
        audienceRoles: [],
        audienceUserIds: announcement.audienceUserIds || [],
        channels: (announcement.channels?.length
          ? announcement.channels
          : ["in_app"]) as AnnouncementBroadcastChannel[],
      });
    } else {
      form.reset(defaultValues);
    }
    setActiveTab("content");
    setTagInput("");
    setAutoTitle(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, announcement?.id]);

  // اقتراح عنوان تلقائياً من أول سطر في المحتوى إذا بقي فارغاً
  const content = form.watch("content");
  React.useEffect(() => {
    if (!autoTitle || !open) return;
    if (form.getValues("title")) return;
    const stripped = (content || "").replace(/<[^>]*>/g, "").trim();
    if (stripped) {
      const firstLine = (stripped.split(/\r?\n/, 1)[0] || "").slice(0, 80);
      if (firstLine) {
        form.setValue("title", firstLine, { shouldDirty: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, autoTitle, open]);

  const watched = form.watch();
  const livePreview: Announcement = React.useMemo(
    () => ({
      id: announcement?.id || "preview",
      title: watched.title || "عنوان الإعلان",
      content: watched.content || "",
      type: watched.type,
      priority: watched.priority,
      isActive: watched.isActive,
      link: watched.link || null,
      category: watched.category || null,
      createdAt: announcement?.createdAt || new Date().toISOString(),
      scheduledAt: watched.scheduledAt || null,
      expiresAt: watched.expiresAt || null,
      audience: (watched.audience as AnnouncementAudienceSegment[] | undefined) || [],
      audienceGrades: watched.audienceGrades || [],
      author: announcement?.author || { id: "", name: "أنت", avatar: null },
    }),
    [watched, announcement]
  );

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    const tags = form.getValues("tags") || [];
    if (tags.includes(v) || tags.length >= 10) {
      setTagInput("");
      return;
    }
    form.setValue("tags", [...tags, v], { shouldDirty: true });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const tags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      tags.filter((t) => t !== tag),
      { shouldDirty: true }
    );
  };

  // القوالب والتوقيع
  const [templatesOpen, setTemplatesOpen] = React.useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = React.useState(false);
  const formValues = form.watch();

  const handleTemplateSelect = (template: import("./types").AnnouncementTemplate) => {
    form.reset({
      ...defaultValues,
      ...formValues,
      title: template.data.title,
      content: template.data.content,
      type: template.data.type,
      priority: template.data.priority,
      category: template.data.category || "",
      audience: template.data.audience as AnnouncementAudienceSegment[] || ["all"],
      channels: template.data.channels as AnnouncementBroadcastChannel[] || ["in_app"],
      tags: template.data.tags || [],
      link: template.data.link || "",
    });
  };

  const saveTemplateData = {
    title: formValues.title,
    content: formValues.content,
    type: formValues.type,
    priority: formValues.priority,
    category: formValues.category || "",
    audience: formValues.audience,
    channels: formValues.channels,
    tags: formValues.tags,
    link: formValues.link,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card/90 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-5">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                {announcement ? (
                  <>
                    <Edit className="h-7 w-7 text-indigo-500" />
                    تعديل الإعلان
                  </>
                ) : (
                  <>
                    <Sparkles className="h-7 w-7 text-blue-500" />
                    إضافة إعلان جديد
                  </>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <TemplatesButton onClick={() => setTemplatesOpen(true)} />
              </div>
            </div>
            <DialogDescription className="font-bold text-muted-foreground">
              صمم إعلانك بأربع خطوات: المحتوى، الجمهور، الجدولة، ثم معاينة النتيجة قبل النشر.
            </DialogDescription>
          </DialogHeader>

          {/* ── تبويبات ─────────────────────────────────────────────────────── */}
          <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/2.5 p-1.5">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* ── تبويب: المحتوى ─────────────────────────────────────────── */}
              {activeTab === "content" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                            عنوان الإعلان
                          </FormLabel>
                          {!announcement && (
                            <button
                              type="button"
                              onClick={() => setAutoTitle((v) => !v)}
                              className={cn(
                                "rounded-md px-2 py-1 text-[10px] font-bold transition",
                                autoTitle
                                  ? "bg-primary/10 text-primary"
                                  : "bg-white/5 text-muted-foreground"
                              )}
                            >
                              {autoTitle ? "اقتراح تلقائي ✓" : "اقتراح تلقائي"}
                            </button>
                          )}
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="مثال: صدور النتائج النهائية للفصل الدراسي"
                            className="rounded-xl border-white/10 bg-white/5 h-12 px-6 font-bold"
                            onFocus={() => setAutoTitle(false)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                            نوع الإعلان
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-12">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-white/10">
                              {TYPE_OPTIONS.map((opt) => {
                                const config = TYPE_CONFIG[opt.value];
                                const Icon = config.icon;
                                return (
                                  <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="cursor-pointer py-3 font-bold"
                                  >
                                    <span className="flex items-center gap-2">
                                      <Icon className={cn("h-4 w-4", config.textClass)} />
                                      <span>{opt.label}</span>
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-[10px] font-bold">
                            {TYPE_CONFIG[watched.type]?.description}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                            مستوى الأولوية
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-12">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-white/10">
                              {PRIORITY_OPTIONS.map((opt) => (
                                <SelectItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="cursor-pointer py-3 font-bold"
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                          محتوى الإعلان
                        </FormLabel>
                        <FormControl>
                          <TipTapEditor
                            content={field.value}
                            onChange={field.onChange}
                            placeholder="أعزائي الطلاب والمستخدمين..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            رابط «اعرف المزيد» (اختياري)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="url"
                              placeholder="https://example.com"
                              className="rounded-xl border-white/10 bg-white/5 h-12 font-bold"
                            />
                          </FormControl>
                          <FormDescription className="text-[10px] font-bold">
                            يظهر كزر قابل للنقر أسفل الإعلان
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            التصنيف (اختياري)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="مثال: امتحانات، تحديثات، فعاليات"
                              className="rounded-xl border-white/10 bg-white/5 h-12 font-bold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* الوسوم (Tags) */}
                  <div className="space-y-2 rounded-xl border border-white/10 bg-white/2.5 p-3">
                    <p className="font-black text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                      <TagIcon className="h-3 w-3" />
                      وسوم التتبع الداخلي (حد أقصى 10)
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="أضف وسمًا ثم اضغط Enter..."
                        className="h-10 rounded-lg border-white/10 bg-white/5 text-xs font-bold"
                      />
                      <AdminButton type="button" size="sm" icon={Plus} onClick={addTag}>
                        إضافة
                      </AdminButton>
                    </div>
                    {(form.watch("tags") || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(form.watch("tags") || []).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-black text-primary"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* الملاحظات الداخلية */}
                  <FormField
                    control={form.control}
                    name="internalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          ملاحظات داخلية (تظهر لفريق الإدارة فقط)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="مثال: راجعها المدير قبل النشر"
                            className="rounded-xl border-white/10 bg-white/5 h-11 font-bold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* قنوات الإرسال */}
                  <FormField
                    control={form.control}
                    name="channels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          قنوات الإرسال
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {[
                            { v: "in_app", l: "داخل التطبيق" },
                            { v: "push", l: "إشعار المتصفح" },
                            { v: "email", l: "البريد" },
                            { v: "sms", l: "رسالة SMS" },
                          ].map((ch) => {
                            const checked = (field.value || []).includes(ch.v as never);
                            return (
                              <button
                                key={ch.v}
                                type="button"
                                onClick={() => {
                                  const cur = field.value || [];
                                  field.onChange(
                                    checked
                                      ? cur.filter((c) => c !== ch.v)
                                      : [...cur, ch.v]
                                  );
                                }}
                                className={cn(
                                  "flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-black transition",
                                  checked
                                    ? "border-primary/40 bg-primary/10 text-primary"
                                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                                )}
                              >
                                {ch.l}
                              </button>
                            );
                          })}
                        </div>
                        <FormDescription className="text-[10px] font-bold">
                          اختر القنوات التي سيُرسل إليها هذا الإعلان عند النشر
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-xl border border-white/10 p-4 bg-white/5">
                        <div>
                          <FormLabel className="font-black text-xs">نشر فوري؟</FormLabel>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            تفعيل ظهور الإعلان في لوحة المستخدمين فور الحفظ
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  </div>
                  {/* المساعد الذكي */}
                  <div className="lg:col-span-1">
                    <SmartAssistant
                      title={form.watch("title") || ""}
                      content={form.watch("content") || ""}
                      type={form.watch("type")}
                      priority={form.watch("priority")}
                      onTitleSelect={(t) => form.setValue("title", t, { shouldDirty: true })}
                    />
                  </div>
                </div>
              )}

              {/* ── تبويب: الجمهور ─────────────────────────────────────────── */}
              {activeTab === "audience" && (
                <AudienceSelector
                  segments={
                    (form.watch("audience") as AnnouncementAudienceSegment[] | undefined) || []
                  }
                  onSegmentsChange={(segs) =>
                    form.setValue("audience", segs, { shouldDirty: true })
                  }
                  grades={form.watch("audienceGrades") || []}
                  onGradesChange={(g) => form.setValue("audienceGrades", g, { shouldDirty: true })}
                  roles={form.watch("audienceRoles") || []}
                  onRolesChange={(r) => form.setValue("audienceRoles", r, { shouldDirty: true })}
                  userIds={form.watch("audienceUserIds") || []}
                  onUserIdsChange={(ids) => form.setValue("audienceUserIds", ids, { shouldDirty: true })}
                />
              )}

              {/* ── تبويب: الجدولة ─────────────────────────────────────────── */}
              {activeTab === "schedule" && (
                <div className="space-y-4">
                  <SchedulePicker
                    scheduledAt={form.watch("scheduledAt") || null}
                    onScheduledAtChange={(v) => form.setValue("scheduledAt", v, { shouldDirty: true })}
                    expiresAt={form.watch("expiresAt") || null}
                    onExpiresAtChange={(v) => form.setValue("expiresAt", v, { shouldDirty: true })}
                  />
                  <RecurrencePicker
                    value={form.watch("recurrence")}
                    onChange={(v) => form.setValue("recurrence", v, { shouldDirty: true })}
                  />
                  <ApprovalToggle
                    value={form.watch("requiresApproval") || false}
                    onChange={(v) => form.setValue("requiresApproval", v, { shouldDirty: true })}
                  />
                </div>
              )}

              {/* ── تبويب: المعاينة ─────────────────────────────────────────── */}
              {activeTab === "preview" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      معاينة حية كما ستظهر للمستخدمين
                    </p>
                  </div>
                  <AnnouncementPreviewContent announcement={livePreview} />
                </div>
              )}

              {/* ── أزرار الإجراء ───────────────────────────────────────────── */}
              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                <div className="flex gap-2">
                  {activeTab !== "content" && (
                    <AdminButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const idx = TABS.findIndex((t) => t.id === activeTab);
                        if (idx > 0) setActiveTab(TABS[idx - 1]!.id);
                      }}
                    >
                      السابق
                    </AdminButton>
                  )}
                  {activeTab !== "preview" && (
                    <AdminButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const idx = TABS.findIndex((t) => t.id === activeTab);
                        if (idx >= 0 && idx < TABS.length - 1)
                          setActiveTab(TABS[idx + 1]!.id);
                      }}
                    >
                      التالي
                    </AdminButton>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <AdminButton
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                  >
                    إلغاء
                  </AdminButton>
                  <AdminButton
                    type="submit"
                    loading={submitting}
                    className="h-12 px-8 text-md font-black shadow-xl rounded-2xl"
                    icon={announcement ? Edit : Send}
                  >
                    {announcement ? "تحديث الإعلان" : "نشر الإعلان الآن"}
                  </AdminButton>
                </div>
              </div>
            </form>
          </Form>

          {/* نوافذ مساعدة */}
          <TemplatesGallery
            open={templatesOpen}
            onOpenChange={setTemplatesOpen}
            onSelect={handleTemplateSelect}
          />
          <SaveAsTemplateDialog
            open={saveTemplateOpen}
            onOpenChange={setSaveTemplateOpen}
            data={saveTemplateData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}