"use client";

import * as React from "react";
import {
  Sparkles,
  Wand2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Languages,
  ShieldAlert,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn } from "@/lib/utils";
import {
  AnnouncementPriority,
  AnnouncementType,
} from "./types";

interface SmartAssistantProps {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  onTitleSelect: (title: string) => void;
}

interface ContentAnalysis {
  score: number; // 0-100
  warnings: Array<{
    level: "info" | "warning" | "error";
    message: string;
  }>;
  suggestions: string[];
  readabilityScore: number;
  estimatedReadTime: number; // in seconds
}

/**
 * مساعد ذكي لتحسين الإعلانات
 */
export function SmartAssistant({
  title,
  content,
  type,
  priority,
  onTitleSelect,
}: SmartAssistantProps) {
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const analysis = React.useMemo(
    () => analyzeContent(title, content),
    [title, content]
  );

  const generateSuggestions = async () => {
    setLoading(true);
    // محاكاة لاقتراحات ذكية بناءً على المحتوى
    await new Promise((resolve) => setTimeout(resolve, 800));
    const generated = generateSmartTitles(content, type, priority);
    setSuggestions(generated);
    setLoading(false);
  };

  const plainContent = content.replace(/<[^>]*>/g, "").trim();

  if (!title && !plainContent) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* بطاقة التقييم */}
      <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black">المساعد الذكي</p>
              <p className="text-[10px] text-muted-foreground font-bold">
                تحسين تلقائي للمحتوى
              </p>
            </div>
          </div>
          <ScoreRing score={analysis.score} />
        </div>

        {/* مؤشرات سريعة */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/5 bg-white/2.5 p-2 text-center">
            <p className="text-[10px] text-muted-foreground font-bold">وقت القراءة</p>
            <p className="text-sm font-black font-mono">
              {Math.max(1, Math.round(analysis.estimatedReadTime / 60))} د
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/2.5 p-2 text-center">
            <p className="text-[10px] text-muted-foreground font-bold">الكلمات</p>
            <p className="text-sm font-black font-mono">
              {plainContent.split(/\s+/).filter(Boolean).length}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/2.5 p-2 text-center">
            <p className="text-[10px] text-muted-foreground font-bold">الوضوح</p>
            <p className="text-sm font-black font-mono">
              {analysis.readabilityScore}%
            </p>
          </div>
        </div>

        {/* التحذيرات */}
        {analysis.warnings.length > 0 && (
          <div className="space-y-1">
            {analysis.warnings.slice(0, 3).map((w, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-lg p-2 text-[11px]",
                  w.level === "error" && "bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300",
                  w.level === "warning" && "bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300",
                  w.level === "info" && "bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300"
                )}
              >
                {w.level === "error" && <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                {w.level === "warning" && <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                {w.level === "info" && <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                <span className="font-bold">{w.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* اقتراح العناوين */}
      <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-violet-500" />
            <p className="text-xs font-black uppercase tracking-wider">
              اقتراحات العناوين
            </p>
          </div>
          <AdminButton
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            onClick={generateSuggestions}
            loading={loading}
            className="h-7 text-[10px]"
          >
            تحديث
          </AdminButton>
        </div>

        {suggestions.length === 0 ? (
          <button
            onClick={generateSuggestions}
            className="w-full rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 p-4 text-center transition hover:bg-violet-500/10"
          >
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-violet-500" />
            <p className="text-xs font-black text-violet-600 dark:text-violet-300">
              انقر لتوليد اقتراحات ذكية
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              بناءً على محتوى الإعلان والنوع المحدد
            </p>
          </button>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onTitleSelect(s)}
                className="group w-full rounded-lg border border-white/5 bg-white/2.5 p-3 text-right transition hover:border-violet-500/40 hover:bg-violet-500/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold">{s}</p>
                  <Badge
                    variant="outline"
                    className="text-[10px] opacity-0 group-hover:opacity-100 transition"
                  >
                    انقر للاستخدام
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* اقتراحات التحسين */}
      {analysis.suggestions.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-black uppercase tracking-wider">
              اقتراحات للتحسين
            </p>
          </div>
          <div className="space-y-1.5">
            {analysis.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[11px] text-muted-foreground"
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-bold">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-white/10"
        />
        <circle
          cx="25"
          cy="25"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all"
        />
      </svg>
      <span
        className="absolute font-black text-xs font-mono"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

/**
 * تحليل ذكي للمحتوى
 */
function analyzeContent(title: string, content: string): ContentAnalysis {
  const plainContent = content.replace(/<[^>]*>/g, "").trim();
  const words = plainContent.split(/\s+/).filter(Boolean);
  const warnings: ContentAnalysis["warnings"] = [];
  const suggestions: string[] = [];
  let score = 100;

  // تقييم العنوان
  if (!title) {
    warnings.push({ level: "error", message: "لا يوجد عنوان للإعلان" });
    score -= 30;
  } else if (title.length < 5) {
    warnings.push({
      level: "warning",
      message: "العنوان قصير جداً، يُفضل أن يكون 5 أحرف على الأقل",
    });
    score -= 15;
  } else if (title.length > 80) {
    warnings.push({
      level: "warning",
      message: "العنوان طويل، قد لا يظهر بالكامل في الإشعارات",
    });
    score -= 10;
  }

  // تقييم المحتوى
  if (!plainContent) {
    warnings.push({ level: "error", message: "لا يوجد محتوى للإعلان" });
    score -= 30;
  } else if (words.length < 5) {
    warnings.push({
      level: "warning",
      message: "المحتوى قصير، قد لا يوصل الرسالة كاملة",
    });
    score -= 20;
  } else if (words.length > 200) {
    warnings.push({
      level: "warning",
      message: "المحتوى طويل، قد يتجاوز حد الإشعارات",
    });
    score -= 10;
  }

  // كشف الكلمات الحساسة
  const sensitiveWords = ["عاجل", "فوري", "طارئ", "تحذير", "خطر"];
  const hasSensitive = sensitiveWords.some((w) =>
    plainContent.toLowerCase().includes(w)
  );
  if (hasSensitive) {
    suggestions.push(
      "تم اكتشاف كلمات عاجلة. تأكد من اختيار النوع ERROR والأولوية HIGH."
    );
  }

  // تقييم الوضوح (تقريبي)
  const avgWordLength =
    words.reduce((s, w) => s + w.length, 0) / Math.max(1, words.length);
  const readabilityScore = Math.max(
    0,
    Math.min(100, Math.round(100 - (avgWordLength - 5) * 10))
  );

  // اقتراحات ذكية
  if (title && !title.includes("❗") && !title.includes("!")) {
    // يمكن اقتراح إضافة توكيد
  }
  if (!content.includes("<strong>") && !content.includes("<b>")) {
    suggestions.push("أضف كلمات بارزة (bold) لإبراز النقاط المهمة");
  }
  if (!content.includes("<a ")) {
    suggestions.push("أضف رابطاً للمحتوى ذي الصلة إن وُجد");
  }
  if (words.length > 0 && words.length < 20) {
    suggestions.push("الإعلانات الأقصر (15-30 كلمة) تحقق تفاعلاً أعلى");
  }

  // تقدير وقت القراءة
  const estimatedReadTime = Math.ceil(words.length * 0.4); // ~150 wpm

  return {
    score: Math.max(0, Math.min(100, score)),
    warnings,
    suggestions,
    readabilityScore,
    estimatedReadTime,
  };
}

/**
 * توليد اقتراحات ذكية للعناوين بناءً على المحتوى
 */
function generateSmartTitles(
  content: string,
  type: AnnouncementType,
  priority: AnnouncementPriority
): string[] {
  const plain = content.replace(/<[^>]*>/g, "").trim();
  const words = plain.split(/\s+/).filter(Boolean);
  const firstLine = plain.split(/[.!?؟]/)[0] || plain;

  const prefixes: Record<AnnouncementType, string[]> = {
    INFO: ["إعلان:", "تحديث:", "جديد:", "ملاحظة:"],
    SUCCESS: ["🎉 إنجاز:", "مبروك:", "خبر سار:", "نجاح:"],
    WARNING: ["⚠️ تنبيه:", "يرجى الانتباه:", "مهم:", "تنبيه هام:"],
    ERROR: ["🚨 عاجل:", "تحذير:", "طارئ:", "إجراء فوري:"],
  };

  const suggestions: string[] = [];

  // قص الكلمات المفتاحية
  const keywords = words
    .filter((w) => w.length > 4)
    .slice(0, 3)
    .join(" ");

  if (firstLine.length > 5 && firstLine.length < 60) {
    suggestions.push(firstLine);
  }
  if (keywords) {
    suggestions.push(`${prefixes[type][0]} ${keywords}`);
  }
  if (priority === "HIGH" && prefixes[type][0]) {
    suggestions.push(`${prefixes[type][2]} ${words.slice(0, 4).join(" ")}`);
  }
  if (plain.length < 60) {
    suggestions.push(plain.slice(0, 60));
  } else {
    suggestions.push(`${firstLine.slice(0, 50)}...`);
  }

  // إزالة التكرار والإفراغات
  return Array.from(new Set(suggestions)).filter((s) => s.length > 5).slice(0, 4);
}

/**
 * كشف المحتوى الحساس
 */
export function detectSensitiveContent(content: string): {
  hasSensitive: boolean;
  categories: string[];
} {
  const categories: string[] = [];
  const lower = content.toLowerCase();

  if (/محتوى\s+غير\s+لائق|إساءة|سب/.test(lower)) {
    categories.push("محتوى غير لائق");
  }
  if (/تهديد|عنف|إيذاء/.test(lower)) {
    categories.push("تهديد أو عنف");
  }
  if (/احتيال|خداع|نصب/.test(lower)) {
    categories.push("احتيال");
  }
  if (/تحرش|تنمر/.test(lower)) {
    categories.push("تحرش أو تنمر");
  }

  return {
    hasSensitive: categories.length > 0,
    categories,
  };
}