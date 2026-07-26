"use client";

import React, { useState, useCallback, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Send, 
  Save,
  RotateCcw,
  BookOpen,
  Users,
  Image,
  Video,
  DollarSign,
  Award,
  Globe,
  Shield,
  Layers,
  Clock,
} from "lucide-react";
import { useCourseBuilder } from "../hooks";
import type { CourseDraft, Chapter, Lesson } from "../types";
import { Section, Card, Button, Badge, Alert } from "../ui";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  passed: boolean;
  warning?: boolean;
  icon: React.ReactNode;
}

interface PublishStepProps {
  draft: CourseDraft | null;
  onPublish: () => Promise<void>;
  onSaveDraft: () => Promise<void>;
  isPublishing: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const PublishStep: React.FC<PublishStepProps> = ({ 
  draft, 
  onPublish, 
  onSaveDraft, 
  isPublishing, 
  isSaving,
  hasUnsavedChanges 
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const totalLessons = draft?.sections?.reduce((sum: number, s: Chapter) => sum + (s.lessons?.length || 0), 0) || 0;
  const totalDuration = draft?.sections?.reduce((sum: number, s: Chapter) => 
    sum + (s.lessons?.reduce((lsum: number, l: Lesson) => lsum + (l.durationSeconds || 0), 0) || 0), 0) || 0;
  const hasVideo = draft?.sections?.some((s: Chapter) => 
    s.lessons?.some((l: Lesson) => l.type === "VIDEO" && l.mediaUrl)
  ) || false;
  
  useEffect(() => {
    if (draft) {
      const items: ChecklistItem[] = [
        {
          id: "title",
          label: "يوجد عنوان للكورس",
          description: "عنوان واضح وجذاب للكورس",
          passed: !!draft.title?.trim(),
          icon: <BookOpen className="w-5 h-5" />,
        },
        {
          id: "cover",
          label: "يوجد صورة غلاف",
          description: "صورة غلاف احترافية للكورس",
          passed: !!draft.coverImageUrl,
          icon: <Image className="w-5 h-5" />,
        },
        {
          id: "teacher",
          label: "يوجد معلم واحد على الأقل",
          description: "مدرس رئيسي معين للكورس",
          passed: (draft.instructors?.length || 0) > 0,
          icon: <Users className="w-5 h-5" />,
        },
        {
          id: "chapters",
          label: "يوجد فصل واحد على الأقل",
          description: "فصل دراسي واحد على الأقل",
          passed: (draft.sections?.length || 0) > 0,
          icon: <Layers className="w-5 h-5" />,
        },
        {
          id: "lessons",
          label: "يوجد درس واحد على الأقل",
          description: "درس واحد على الأقل داخل الفصول",
          passed: totalLessons > 0,
          icon: <BookOpen className="w-5 h-5" />,
        },
        {
          id: "videos",
          label: "يوجد فيديو واحد على الأقل",
          description: "درس فيديو واحد على الأقل مع ملف مرفوع",
          passed: hasVideo,
          warning: totalLessons > 0 && !hasVideo,
          icon: <Video className="w-5 h-5" />,
        },
        {
          id: "pricing",
          label: "تم إعداد التسعير",
          description: "خطة تسعير واحدة على الأقل",
          passed: (draft.pricings?.length || 0) > 0,
          icon: <DollarSign className="w-5 h-5" />,
        },
        {
          id: "category",
          label: "تم اختيار التصنيف",
          description: "تصنيف واحد على الأقل للكورس",
          passed: (draft.categoryIds?.length || 0) > 0,
          icon: <Shield className="w-5 h-5" />,
        },
        {
          id: "seo",
          label: "تم إعداد SEO",
          description: "عنوان ووصف محسّنان لمحركات البحث",
          passed: !!draft.seoTitle && !!draft.seoDescription,
          warning: !!draft.seoTitle && draft.seoTitle.length > 60,
          icon: <Globe className="w-5 h-5" />,
        },
        {
          id: "validation",
          label: "جميع التحققات مرت",
          description: "لا توجد أخطاء في التحقق من البيانات",
          passed: validateDraft(draft),
          icon: <CheckCircle className="w-5 h-5" />,
        },
      ];
      
      setChecklist(items);
    }
  }, [draft]);
  
  const passedCount = checklist.filter(c => c.passed).length;
  const totalCount = checklist.length;
  const canPublish = passedCount === totalCount;
  
  const validateDraft = (course: CourseDraft): boolean => {
    if (!course.title?.trim()) return false;
    if (!course.slug?.trim()) return false;
    if (!course.categoryIds?.length) return false;
    if (!course.level) return false;
    if (!course.language) return false;
    if (!course.primaryInstructorId) return false;
    if ((course.pricings?.length || 0) === 0) return false;
    return true;
  };
  
  const handlePublish = useCallback(async () => {
    if (!canPublish) {
      alert("لا يمكن النشر: هناك عناصر غير مكتملة في قائمة التحقق");
      return;
    }
    setShowConfirm(true);
  }, [canPublish]);
  
  const confirmPublish = useCallback(async () => {
    setShowConfirm(false);
    await onPublish();
  }, [onPublish]);
  
  return (
    <div className="space-y-6">
      <Section title="النشر النهائي" description="قائمة التحقق الكاملة قبل نشر الكورس" icon={<Send className="w-5 h-5" />}>
        {/* Progress Header */}
        <Card className={`mb-6 p-6 ${canPublish ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-900/50"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                    className="dark:stroke-gray-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={canPublish ? "#22c55e" : "#3b82f6"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - passedCount / totalCount)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((passedCount / totalCount) * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {canPublish ? "جاهز للنشر!" : "قائمة التحقق غير مكتملة"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {passedCount} من {totalCount} متطلبات مكتملة
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <Button 
                  variant="outline" 
                  onClick={onSaveDraft} 
                  disabled={isSaving}
                  icon={<Save className="w-4 h-4" />}
                >
                  {isSaving ? "جاري الحفظ..." : "حفظ المسودة"}
                </Button>
              )}
              <Button
                onClick={handlePublish}
                disabled={isPublishing || !canPublish}
                className={canPublish ? "bg-green-600 hover:bg-green-700" : "opacity-50 cursor-not-allowed"}
                icon={<Send className="w-4 h-4" />}
                size="lg"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري النشر...
                  </>
                ) : canPublish ? (
                  "نشر الكورس"
                ) : (
                  "أكمل المتطلبات أولاً"
                )}
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Checklist */}
        <div className="space-y-3">
          {checklist.map((item) => (
            <ChecklistItemCard key={item.id} item={item} />
          ))}
        </div>
        
        {/* Warnings */}
        {checklist.some(c => c.warning) && (
          <Alert variant="warning" className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <div>
              <p className="font-medium">تحذيرات:</p>
              <ul className="list-disc list-inside mt-1 text-sm">
                {checklist.filter(c => c.warning).map(w => (
                  <li key={w.id}>{w.description || w.label}</li>
                ))}
              </ul>
            </div>
          </Alert>
        )}
        
        {/* Additional Requirements */}
        <Section title="متطلبات إضافية مقترحة" description="هذه العناصر ليست مطلوبة للنشر لكن يفضل توفرها" icon={<Info className="w-5 h-5" />}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SuggestionCard
              icon={<Video className="w-5 h-5" />}
              title="فيديو ترويجي"
              description="فيديو قصير يعرض محتوى الكورس"
              passed={!!draft?.promoVideoUrl}
            />
            <SuggestionCard
              icon={<Clock className="w-5 h-5" />}
              title="مدة تقديرية"
              description="إضافة مدة تقديرية للكورس"
              passed={(draft?.estimatedDurationMins || 0) > 0}
            />
            <SuggestionCard
              icon={<FileText className="w-5 h-5" />}
              title="متطلبات مسبقة"
              description="تحديد ما يحتاج الطالب معرفته قبل الكورس"
              passed={!!draft?.prerequisitesText}
            />
            <SuggestionCard
              icon={<Users className="w-5 h-5" />}
              title="الجمهور المستهدف"
              description="وصف لمن يناسب هذا الكورس"
              passed={!!draft?.targetAudience}
            />
            <SuggestionCard
              icon={<Award className="w-5 h-5" />}
              title="مخرجات التعلم"
              description="ما سيتعلمه الطالب بعد إكمال الكورس"
              passed={(draft?.learningOutcomes?.length || 0) > 0}
            />
            <SuggestionCard
              icon={<Shield className="w-5 h-5" />}
              title="شهادة معتمدة"
              description="تعيين قالب شهادة للكورس"
              passed={!!draft?.hasCertificate}
            />
          </div>
        </Section>
      </Section>
      
      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">تأكيد النشر</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                هل أنت متأكد من نشر الكورس "{draft?.title}"؟ سيصبح متاحاً للطلاب فوراً.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={confirmPublish} 
                disabled={isPublishing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  "نعم، انشر الآن"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

interface ChecklistItemCardProps {
  item: ChecklistItem;
}

const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({ item }) => (
  <Card className={`flex items-center gap-4 p-4 transition-colors ${
    item.passed ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : 
    item.warning ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" :
    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
  }`}>
    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
      item.passed ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
      item.warning ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
      "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
    }`}>
      {item.passed ? (
        <CheckCircle className="w-5 h-5" />
      ) : item.warning ? (
        <AlertCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
      {item.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
      )}
    </div>
    <div className="flex-shrink-0">
      {item.passed ? (
        <Badge variant="success" className="text-xs">مكتمل</Badge>
      ) : item.warning ? (
        <Badge variant="warning" className="text-xs">تحذير</Badge>
      ) : (
        <Badge variant="destructive" className="text-xs">مطلوب</Badge>
      )}
    </div>
  </Card>
);

interface SuggestionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  passed: boolean;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ icon, title, description, passed }) => (
  <Card className={`p-4 flex items-start gap-3 ${passed ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : ""}`}>
    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
      passed ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
      "bg-gray-100 dark:bg-gray-800 text-gray-400"
    }`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-medium ${passed ? "text-green-700 dark:text-green-300" : "text-gray-900 dark:text-white"}`}>
        {title}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
    </div>
    <div className="flex-shrink-0">
      {passed ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
      )}
    </div>
  </Card>
);

import { Info, FileText } from "lucide-react";

export default PublishStep;