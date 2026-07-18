"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  Shield,
  History,
  FileCode,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Eye,
} from "lucide-react";

// Types matching Backend
interface FAQItem {
  question: string;
  answer: string;
}

interface CourseGuarantee {
  moneyBack: string;
  quality: string;
  support: string;
  freeUpdates: boolean;
}

interface ChangelogEntry {
  version: string;
  date: string;
  additions: string[];
  removals: string[];
  modifications: string[];
}

interface CourseProject {
  id: string;
  name: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedHours: number;
  tools: string[];
}

export default function CourseContentPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [activeTab, setActiveTab] = React.useState<"faq" | "guarantee" | "changelog" | "projects">("faq");
  const [isSaving, setIsSaving] = React.useState(false);

  // Queries for Metadata
  const { data: faqData, isLoading: isFaqLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "faq"],
    queryFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseFaq(courseId));
      if (!res.ok) throw new Error("Failed to load FAQ");
      const json = await res.json();
      return (json.data?.faq || json.faq || []) as FAQItem[];
    },
  });

  const { data: guaranteeData, isLoading: isGuaranteeLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "guarantee"],
    queryFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseGuarantee(courseId));
      if (!res.ok) throw new Error("Failed to load guarantee");
      const json = await res.json();
      return (json.data?.guarantee || json.guarantee || { moneyBack: "", quality: "", support: "", freeUpdates: false }) as CourseGuarantee;
    },
  });

  const { data: changelogData, isLoading: isChangelogLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "changelog"],
    queryFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseChangelog(courseId));
      if (!res.ok) throw new Error("Failed to load changelog");
      const json = await res.json();
      return (json.data?.changelog || json.changelog || []) as ChangelogEntry[];
    },
  });

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "projects"],
    queryFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseProjects(courseId));
      if (!res.ok) throw new Error("Failed to load projects");
      const json = await res.json();
      return (json.data?.projects || json.projects || []) as CourseProject[];
    },
  });

  // State Management
  const [faq, setFaq] = React.useState<FAQItem[]>([]);
  const [guarantee, setGuarantee] = React.useState<CourseGuarantee>({
    moneyBack: "",
    quality: "",
    support: "",
    freeUpdates: false,
  });
  const [changelog, setChangelog] = React.useState<ChangelogEntry[]>([]);
  const [projects, setProjects] = React.useState<CourseProject[]>([]);

  // Sync state with fetch results
  React.useEffect(() => {
    if (faqData) setFaq(faqData);
  }, [faqData]);

  React.useEffect(() => {
    if (guaranteeData) setGuarantee(guaranteeData);
  }, [guaranteeData]);

  React.useEffect(() => {
    if (changelogData) setChangelog(changelogData);
  }, [changelogData]);

  React.useEffect(() => {
    if (projectsData) setProjects(projectsData);
  }, [projectsData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let url = "";
      let payload = {};

      if (activeTab === "faq") {
        url = apiRoutes.admin.courseFaq(courseId);
        payload = { faq };
      } else if (activeTab === "guarantee") {
        url = apiRoutes.admin.courseGuarantee(courseId);
        payload = { guarantee };
      } else if (activeTab === "changelog") {
        url = apiRoutes.admin.courseChangelog(courseId);
        payload = { changelog };
      } else if (activeTab === "projects") {
        url = apiRoutes.admin.courseProjects(courseId);
        payload = { projects };
      }

      const res = await adminFetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save data");
      toast.success("تم الحفظ بنجاح");
    } catch (e) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isFaqLoading || isGuaranteeLoading || isChangelogLoading || isProjectsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">المحتوى الإضافي للدورة</h2>
          <p className="text-sm font-bold text-muted-foreground mt-1">
            إدارة الأسئلة الشائعة، شهادة الضمان، سجل التغييرات، والمشاريع البرمجية أو التطبيقية
          </p>
        </div>
        <AdminButton className="gap-2 rounded-xl h-11 px-8 font-black" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-white" /> : <Save className="h-4 w-4" />}
          حفظ القسم الحالي
        </AdminButton>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 rounded-3xl bg-muted/30 p-2 border border-border/50 max-w-fit">
        {[
          { key: "faq", label: "أسئلة شائعة", icon: HelpCircle },
          { key: "guarantee", label: "الضمان والجودة", icon: Shield },
          { key: "changelog", label: "سجل التحديثات", icon: History },
          { key: "projects", label: "مشاريع عملية", icon: FileCode },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-black transition-all",
              activeTab === tab.key
                ? "bg-background text-primary shadow-xl shadow-black/5 ring-1 ring-border/50 scale-[1.02]"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Renderer */}
      <div className="grid gap-6">
        {activeTab === "faq" && (
          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                الأسئلة الشائعة (FAQ)
              </h3>
              <AdminButton
                variant="outline"
                size="sm"
                className="rounded-xl font-bold gap-1.5"
                onClick={() => setFaq([...faq, { question: "", answer: "" }])}
              >
                <Plus className="h-4 w-4" />
                إضافة سؤال
              </AdminButton>
            </div>

            {faq.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-3xl">
                <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground">لا يوجد أسئلة مضافة بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faq.map((item, idx) => (
                  <div key={idx} className="p-4 border rounded-2xl relative bg-muted/10">
                    <button
                      className="absolute left-4 top-4 text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                      onClick={() => setFaq(faq.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <div className="grid gap-4 max-w-[92%]">
                      <div className="space-y-1">
                        <Label className="text-xs font-black">السؤال</Label>
                        <Input
                          value={item.question}
                          onChange={(e) => {
                            const updated = [...faq];
                            if (updated[idx]) {
                              updated[idx].question = e.target.value;
                              setFaq(updated);
                            }
                          }}
                          placeholder="مثال: هل توفرون شهادة عند إتمام الدورة؟"
                          className="rounded-xl text-sm font-bold h-11"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-black">الإجابة</Label>
                        <Textarea
                          value={item.answer}
                          onChange={(e) => {
                            const updated = [...faq];
                            if (updated[idx]) {
                              updated[idx].answer = e.target.value;
                              setFaq(updated);
                            }
                          }}
                          placeholder="اكتب الإجابة التفصيلية هنا..."
                          className="rounded-xl text-sm font-bold min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        )}

        {activeTab === "guarantee" && (
          <AdminCard className="p-6 border-border/40">
            <h3 className="text-lg font-black flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-emerald-500" />
              سياسة الضمان والجودة
            </h3>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-black">ضمان استرداد الأموال (Money Back)</Label>
                  <Input
                    value={guarantee.moneyBack || ""}
                    onChange={(e) => setGuarantee({ ...guarantee, moneyBack: e.target.value })}
                    placeholder="مثال: ضمان استرداد كامل المبلغ خلال 14 يومًا بدون شروط"
                    className="rounded-xl text-sm font-bold h-11"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-black">ضمان الجودة (Quality Guarantee)</Label>
                  <Input
                    value={guarantee.quality || ""}
                    onChange={(e) => setGuarantee({ ...guarantee, quality: e.target.value })}
                    placeholder="مثال: محتوى علمي متوافق مع متطلبات السوق بمراجعة خبراء معتمدين"
                    className="rounded-xl text-sm font-bold h-11"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-black">الدعم الفني ومرافقة الطلاب (Support)</Label>
                  <Input
                    value={guarantee.support || ""}
                    onChange={(e) => setGuarantee({ ...guarantee, support: e.target.value })}
                    placeholder="مثال: إجابة مباشرة على كل أسئلتك خلال 24 ساعة طوال أيام الأسبوع"
                    className="rounded-xl text-sm font-bold h-11"
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl border bg-muted/10 p-4 mt-2">
                  <div>
                    <Label className="text-sm font-black">تحديثات مجانية للأبد (Free Updates)</Label>
                    <p className="text-[10px] text-muted-foreground font-bold mt-1">
                      سيحصل الطالب على كل الإضافات والتعديلات المستقبلية للدورة مجاناً وبدون أي رسوم إضافية.
                    </p>
                  </div>
                  <Switch
                    checked={guarantee.freeUpdates || false}
                    onCheckedChange={(checked) => setGuarantee({ ...guarantee, freeUpdates: checked })}
                  />
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {activeTab === "changelog" && (
          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <History className="h-5 w-5 text-violet-500" />
                سجل التحديثات والتغييرات (Changelog)
              </h3>
              <AdminButton
                variant="outline"
                size="sm"
                className="rounded-xl font-bold gap-1.5"
                onClick={() =>
                  setChangelog([
                    ...changelog,
                    { version: "v1.0.0", date: new Date().toISOString().slice(0, 10), additions: [], removals: [], modifications: [] },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                إضافة إصدار
              </AdminButton>
            </div>

            {changelog.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-3xl">
                <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground">لا يوجد إصدارات مسجلة بعد</p>
              </div>
            ) : (
              <div className="space-y-6">
                {changelog.map((entry, idx) => (
                  <div key={idx} className="p-6 border rounded-2xl bg-muted/10 relative">
                    <button
                      className="absolute left-4 top-4 text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                      onClick={() => setChangelog(changelog.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <div className="grid gap-4 md:grid-cols-2 max-w-[92%]">
                      <div className="space-y-1">
                        <Label className="text-xs font-black">رقم الإصدار</Label>
                        <Input
                          value={entry.version}
                          onChange={(e) => {
                            const updated = [...changelog];
                            if (updated[idx]) {
                              updated[idx].version = e.target.value;
                              setChangelog(updated);
                            }
                          }}
                          placeholder="v1.1.0"
                          className="rounded-xl text-sm font-bold h-11"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-black">تاريخ الإصدار</Label>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => {
                            const updated = [...changelog];
                            if (updated[idx]) {
                              updated[idx].date = e.target.value;
                              setChangelog(updated);
                            }
                          }}
                          className="rounded-xl text-sm font-bold h-11"
                        />
                      </div>
                    </div>
                    {/* Additions, modifications list editor */}
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label className="text-xs font-black text-emerald-600 block mb-1">الإضافات الجديدة</Label>
                        <Input
                          placeholder="اكتب التغيير واضغط Enter للإضافة..."
                          className="rounded-xl text-sm font-bold h-11 mb-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                const updated = [...changelog];
                                if (updated[idx]) {
                                  updated[idx].additions = [...(updated[idx].additions || []), val];
                                  setChangelog(updated);
                                  e.currentTarget.value = "";
                                }
                              }
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {(entry.additions || []).map((add, i) => (
                            <Badge key={i} className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold pr-3 pl-1 gap-1">
                              {add}
                              <button
                                className="hover:bg-emerald-500/20 rounded-full p-0.5"
                                onClick={() => {
                                  const updated = [...changelog];
                                  if (updated[idx]) {
                                    updated[idx].additions = (updated[idx].additions || []).filter((_, index) => index !== i);
                                    setChangelog(updated);
                                  }
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-black text-amber-600 block mb-1">التعديلات والتحسينات</Label>
                        <Input
                          placeholder="اكتب التغيير واضغط Enter للإضافة..."
                          className="rounded-xl text-sm font-bold h-11 mb-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                const updated = [...changelog];
                                if (updated[idx]) {
                                  updated[idx].modifications = [...(updated[idx].modifications || []), val];
                                  setChangelog(updated);
                                  e.currentTarget.value = "";
                                }
                              }
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {(entry.modifications || []).map((mod, i) => (
                            <Badge key={i} className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold pr-3 pl-1 gap-1">
                              {mod}
                              <button
                                className="hover:bg-amber-500/20 rounded-full p-0.5"
                                onClick={() => {
                                  const updated = [...changelog];
                                  if (updated[idx]) {
                                    updated[idx].modifications = (updated[idx].modifications || []).filter((_, index) => index !== i);
                                    setChangelog(updated);
                                  }
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        )}

        {activeTab === "projects" && (
          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <FileCode className="h-5 w-5 text-amber-500" />
                المشاريع التطبيقية والعملية
              </h3>
              <AdminButton
                variant="outline"
                size="sm"
                className="rounded-xl font-bold gap-1.5"
                onClick={() =>
                  setProjects([
                    ...projects,
                    {
                      id: `project-${Date.now()}`,
                      name: "",
                      description: "",
                      difficulty: "BEGINNER",
                      estimatedHours: 4,
                      tools: [],
                    },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                إضافة مشروع
              </AdminButton>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-3xl">
                <FileCode className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground">لا يوجد مشاريع مضافة بعد</p>
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-6 border rounded-2xl bg-muted/10 relative">
                    <button
                      className="absolute left-4 top-4 text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                      onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <div className="grid gap-4 md:grid-cols-3 max-w-[92%]">
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs font-black">اسم المشروع</Label>
                        <Input
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...projects];
                            if (updated[idx]) {
                              updated[idx].name = e.target.value;
                              setProjects(updated);
                            }
                          }}
                          placeholder="مثال: تطبيق متجر إلكتروني متكامل"
                          className="rounded-xl text-sm font-bold h-11"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-black">الصعوبة</Label>
                        <select
                          value={proj.difficulty}
                          onChange={(e) => {
                            const updated = [...projects];
                            if (updated[idx]) {
                              updated[idx].difficulty = e.target.value as any;
                              setProjects(updated);
                            }
                          }}
                          className="w-full rounded-xl border border-input bg-background h-11 px-3 text-sm font-bold shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                          <option value="BEGINNER">مبتدئ (Easy)</option>
                          <option value="INTERMEDIATE">متوسط (Medium)</option>
                          <option value="ADVANCED">متقدم (Hard)</option>
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-3">
                        <Label className="text-xs font-black">وصف المشروع ومتطلباته</Label>
                        <Textarea
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...projects];
                            if (updated[idx]) {
                              updated[idx].description = e.target.value;
                              setProjects(updated);
                            }
                          }}
                          placeholder="اكتب متطلبات وشرح المشروع بالتفصيل هنا..."
                          className="rounded-xl text-sm font-bold min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-black">عدد الساعات المتوقع للإنجاز</Label>
                        <Input
                          type="number"
                          value={proj.estimatedHours}
                          onChange={(e) => {
                            const updated = [...projects];
                            if (updated[idx]) {
                              updated[idx].estimatedHours = Number(e.target.value);
                              setProjects(updated);
                            }
                          }}
                          className="rounded-xl text-sm font-bold h-11"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs font-black">الأدوات المستعملة</Label>
                        <Input
                          placeholder="اكتب الأداة واضغط Enter للإضافة..."
                          className="rounded-xl text-sm font-bold h-11 mb-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                const updated = [...projects];
                                if (updated[idx]) {
                                  updated[idx].tools = [...(updated[idx].tools || []), val];
                                  setProjects(updated);
                                  e.currentTarget.value = "";
                                }
                              }
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {(proj.tools || []).map((t, i) => (
                            <Badge key={i} className="bg-primary/10 text-primary border-primary/20 font-bold pr-3 pl-1 gap-1">
                              {t}
                              <button
                                className="hover:bg-primary/20 rounded-full p-0.5"
                                onClick={() => {
                                  const updated = [...projects];
                                  if (updated[idx]) {
                                    updated[idx].tools = (updated[idx].tools || []).filter((_, index) => index !== i);
                                    setProjects(updated);
                                  }
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        )}
      </div>
    </div>
  );
}
