"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  ExternalLink,
  RefreshCw,
  BookOpen,
  Users,
  Clock,
  Award,
  Layers,
  Video,
  FileText,
  Info,
  HelpCircle,
} from "lucide-react";
import { useCourseBuilder } from "../hooks";
import type { CourseDraft, Chapter, Lesson } from "../types";
import { Section, Card, Badge, Button, Skeleton, EmptyState, Tabs, TabsList, Tab, TabPanels, TabPanel } from "../ui";

interface PreviewStepProps {
  draft: CourseDraft | null;
  onRefresh: () => void;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({ draft, onRefresh }) => {
  const { loadPreview, isLoading, error, clearError } = useCourseBuilder({ courseId: draft?.id });
  const [previewData, setPreviewData] = useState<CourseDraft | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "details">("overview");
  
  useEffect(() => {
    if (draft?.id) {
      loadPreview(draft.id).then(data => {
        if (data) setPreviewData(data);
      });
    }
  }, [draft?.id, loadPreview]);
  
  const handleRefresh = useCallback(() => {
    if (draft?.id) {
      loadPreview(draft.id).then(data => {
        if (data) setPreviewData(data);
      });
    }
    onRefresh();
  }, [draft?.id, loadPreview, onRefresh]);
  
  const course = previewData || draft;
  
  if (!course) {
    return (
      <EmptyState
        icon={<BookOpen className="w-12 h-12 text-gray-300" />}
        title="لا توجد بيانات للمعاينة"
        description="أنشئ مسودة كورس أولاً أو احفظ التغييرات لرؤية المعاينة"
      />
    );
  }
  
  const totalLessons = course.sections?.reduce((sum: number, s: Chapter) => sum + (s.lessons?.length || 0), 0) || 0;
  const totalDuration = course.sections?.reduce((sum: number, s: Chapter) => 
    sum + (s.lessons?.reduce((lsum: number, l: Lesson) => lsum + (l.durationSeconds || 0), 0) || 0), 0) || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">معاينة الكورس</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">شاهد كيف سيظهر الكورس للطلاب</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} icon={<RefreshCw className="w-4 h-4" />}>
            تحديث
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open(`/courses/${course.slug}`, "_blank")}
            icon={<ExternalLink className="w-4 h-4" />}
          >
            عرض في الموقع
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 dark:text-red-300">{error.message}</p>
          <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto">إغلاق</Button>
        </div>
      )}
      
      {/* Course Header */}
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-800">
          {course.coverImageUrl && (
            <img 
              src={course.coverImageUrl} 
              alt={course.title} 
              className="w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <Badge variant="secondary" className="mb-2 text-sm">
                  {course.status === "PUBLISHED" ? "منشور" : course.status === "DRAFT" ? "مسودة" : "قيد المراجعة"}
                </Badge>
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-lg opacity-90 max-w-2xl">{course.shortDescription || course.longDescription?.substring(0, 200) + "..."}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(totalDuration / 60)} ساعة {totalDuration % 60} دقيقة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>{course.sections?.length || 0} فصل</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{totalLessons} درس</span>
                </div>
                {course.hasCertificate && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>شهادة معتمدة</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as typeof activeTab)}>
        <TabsList className="w-full">
          <Tab value="overview">نظرة عامة</Tab>
          <Tab value="curriculum">المنهج الدراسي</Tab>
          <Tab value="details">التفاصيل الكاملة</Tab>
        </TabsList>
        
        <TabPanels className="mt-4">
          <TabPanel value="overview">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Info Cards */}
              <div className="md:col-span-2 space-y-6">
                <Section title="الوصف الكامل" icon={<FileText className="w-5 h-5" />}>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {course.longDescription ? (
                      <div dangerouslySetInnerHTML={{ __html: course.longDescription }} />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">لا يوجد وصف مفصل</p>
                    )}
                  </div>
                </Section>
                
                {course.prerequisitesText && (
                  <Section title="المتطلبات المسبقة" icon={<Info className="w-5 h-5" />}>
                    <p className="text-gray-700 dark:text-gray-300">{course.prerequisitesText}</p>
                  </Section>
                )}
                
                {course.targetAudience && (
                  <Section title="الجمهور المستهدف" icon={<Users className="w-5 h-5" />}>
                    <p className="text-gray-700 dark:text-gray-300">{course.targetAudience}</p>
                  </Section>
                )}
                
                {course.learningOutcomes?.length > 0 && (
                  <Section title="مخرجات التعلم" icon={<Award className="w-5 h-5" />}>
                    <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                      {course.learningOutcomes.map((outcome: string, i: number) => (
                        <li key={i}>{outcome}</li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="space-y-4">
                <Card>
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">المستوى</p>
                      <p className="font-medium capitalize">{course.level?.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">اللغة</p>
                      <p className="font-medium">{course.language?.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">التصنيف</p>
                      <p className="font-medium">{course.categoryIds?.join(", ") || "غير محدد"}</p>
                    </div>
                    {course.estimatedDurationMins > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">المدة التقديرية</p>
                        <p className="font-medium">{Math.floor(course.estimatedDurationMins / 60)} ساعة {course.estimatedDurationMins % 60} دقيقة</p>
                      </div>
                    )}
                    {course.primaryInstructorId && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">المدرس الرئيسي</p>
                        <p className="font-medium">محدد</p>
                      </div>
                    )}
                  </div>
                </Card>
                
                {course.pricings?.length > 0 && (
                  <Card>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">التسعير</h4>
                      <div className="space-y-2">
                        {course.pricings.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <span className="capitalize">{p.type.toLowerCase()}</span>
                            <span className="font-bold text-lg">
                              {p.type === "FREE" ? "مجاني" : `${p.amount} ${p.currencyCode}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabPanel>
          
          <TabPanel value="curriculum">
            <Section title="المحتوى الدراسي" icon={<BookOpen className="w-5 h-5" />}>
              {course.sections?.length > 0 ? (
                <div className="space-y-4">
                  {course.sections.map((section: Chapter, sIndex: number) => (
                    <Card key={section.id} className="overflow-hidden">
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium">
                            {sIndex + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{section.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {section.lessons?.length || 0} درس • 
                              {Math.floor((section.lessons?.reduce((sum: number, l: Lesson) => sum + (l.durationSeconds || 0), 0) || 0) / 60)} دقيقة
                            </p>
                          </div>
                        </div>
                        {section.availableFrom && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3" />
                            متاح من {new Date(section.availableFrom).toLocaleDateString('ar-SA')}
                          </Badge>
                        )}
                      </div>
                      
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {section.lessons?.map((lesson: Lesson, lIndex: number) => (
                          <li key={lesson.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <span className="flex items-center justify-center w-7 h-7 text-sm font-medium text-gray-500 dark:text-gray-400">
                              {lIndex + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{lesson.title}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                                  {lessonTypeIcons[lesson.type] || <HelpCircle className="w-3 h-3" />}
                                  {lessonTypeLabels[lesson.type] || lesson.type}
                                </span>
                                {lesson.durationSeconds > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(lesson.durationSeconds / 60)} دقيقة
                                  </span>
                                )}
                                {lesson.isFreePreview && (
                                  <Badge variant="success" className="text-xs">
                                    <CheckCircle className="w-3 h-3" />
                                    معاينة مجانية
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<BookOpen className="w-12 h-12 text-gray-300" />}
                  title="لا يوجد محتوى بعد"
                  description="أضف فصولاً ودروساً من خطوة 'الفصول' و'الدروس'"
                />
              )}
            </Section>
          </TabPanel>
          
          <TabPanel value="details">
            <div className="grid gap-6 md:grid-cols-2">
              <Section title="معلومات الكورس" icon={<Info className="w-5 h-5" />}>
                <dl className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">المعرف</dt>
                    <dd className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{course.id}</dd>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">الرابط المختصر</dt>
                    <dd className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{course.slug}</dd>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">الحالة</dt>
                    <dd>
                      <Badge variant={course.status === "PUBLISHED" ? "success" : course.status === "DRAFT" ? "secondary" : "warning"}>
                        {course.status}
                      </Badge>
                    </dd>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">الإصدار</dt>
                    <dd className="font-mono text-sm">{course.version}</dd>
                  </div>
                </dl>
              </Section>
              
              <Section title="إعدادات النشر" icon={<Eye className="w-5 h-5" />}>
                <dl className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">مميز</dt>
                    <dd className="flex items-center gap-2">
                      {course.isFeatured ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span>{course.isFeatured ? "نعم" : "لا"}</span>
                    </dd>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">جديد</dt>
                    <dd className="flex items-center gap-2">
                      {course.isNew ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span>{course.isNew ? "نعم" : "لا"}</span>
                    </dd>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">رائج</dt>
                    <dd className="flex items-center gap-2">
                      {course.isTrending ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span>{course.isTrending ? "نعم" : "لا"}</span>
                    </dd>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">الحد الأقصى للطلاب</dt>
                    <dd>{course.maxStudents || "غير محدود"}</dd>
                  </div>
                </dl>
              </Section>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

const lessonTypeIcons: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-3 h-3" />,
  TEXT: <FileText className="w-3 h-3" />,
  AUDIO: <Music className="w-3 h-3" />,
  FILE: <File className="w-3 h-3" />,
  EXTERNAL_LINK: <ExternalLink className="w-3 h-3" />,
  INTERACTIVE_QUIZ: <HelpCircle className="w-3 h-3" />,
};

const lessonTypeLabels: Record<string, string> = {
  VIDEO: "فيديو",
  TEXT: "نص",
  AUDIO: "صوت",
  FILE: "ملف",
  EXTERNAL_LINK: "رابط",
  INTERACTIVE_QUIZ: "اختبار",
};

import { Music, File, XCircle } from "lucide-react";

export default PreviewStep;