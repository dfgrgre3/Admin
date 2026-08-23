"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  AlertCircle, 
  Save, 
  ArrowLeft,
  Menu,
  X,
  BookOpen,
  UserPlus,
  Layers,
  Video,
  FileText,
  DollarSign,
  Award,
  Globe,
  Eye,
  Send,
} from "lucide-react";
import { useCourseBuilder } from "./hooks";
import type { CourseDraft, BuilderStep, Chapter } from "./types";
import { BUILDER_STEPS } from "./types";

// Import all step components
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { TeachersStep } from "./steps/TeachersStep";
import { ChaptersStep } from "./steps/ChaptersStep";
import { LessonsStep } from "./steps/LessonsStep";
import { VideosStep } from "./steps/VideosStep";
import { FilesStep } from "./steps/FilesStep";
import { ExamsStep } from "./steps/ExamsStep";
import { AssignmentsStep } from "./steps/AssignmentsStep";
import { PricingStep } from "./steps/PricingStep";
import { CertificatesStep } from "./steps/CertificatesStep";
import { SEOStep } from "./steps/SEOStep";
import { PreviewStep } from "./steps/PreviewStep";
import { PublishStep } from "./steps/PublishStep";
import { Button, Alert, Skeleton } from "./ui";

interface CourseBuilderWizardProps {
  courseId?: string;
}

export const CourseBuilderWizard: React.FC<CourseBuilderWizardProps> = ({ courseId }) => {
  const router = useRouter();
  const isNew = !courseId;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [draft, setDraft] = useState<CourseDraft | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showMobileSteps, setShowMobileSteps] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  
  const {
    loadDraft,
    createDraft,
    updateDraft,
    autoSave,
    publishCourse,
    deleteDraft,
    chapters,
    lessons,
    loadCategories,
    loadLevels,
    loadLanguages,
    loadTeachers,
    loadCourseTeachers,
    loadChapters,
    loadLessons,
    loadPricing,
    loadCertificateTemplates,
    loadExams,
    loadAssignments,
    isLoading,
    error,
    clearError,
  } = useCourseBuilder({ 
    courseId: courseId || undefined,
    onAutoSave: () => {
      setLastSaved(new Date());
      setIsDirty(false);
    },
    autoSaveDelay: 3000,
  });
  
  const currentStep = BUILDER_STEPS[currentStepIndex]?.id as BuilderStep;
  
  // Step Components map
  const StepComponents: Record<BuilderStep, React.FC<any>> = {
    "basic-info": BasicInfoStep,
    "teachers": TeachersStep,
    "chapters": ChaptersStep,
    "lessons": LessonsStep,
    "videos": VideosStep,
    "files": FilesStep,
    "exams": ExamsStep,
    "assignments": AssignmentsStep,
    "pricing": PricingStep,
    "certificates": CertificatesStep,
    "seo": SEOStep,
    "preview": PreviewStep,
    "publish": PublishStep,
  };
  
  const StepComponent = StepComponents[currentStep];
  
  // Load initial data
  useEffect(() => {
    if (isNew) {
      createDraft({ status: "DRAFT" }).then(newDraft => {
        if (newDraft) {
          setDraft(newDraft);
          router.replace(`/admin/courses/builder/${newDraft.id}`);
        }
      });
    } else {
      loadDraft(courseId).then(() => {});
    }
    
    // Load reference data
    loadCategories();
    loadLevels();
    loadLanguages();
    loadTeachers();
    loadCertificateTemplates();
    if (!isNew) {
      loadCourseTeachers(courseId);
      loadChapters(courseId);
      loadPricing(courseId);
      loadExams(courseId);
      loadAssignments(courseId);
    }
  }, [courseId, isNew, loadDraft, createDraft, loadCategories, loadLevels, loadLanguages, loadTeachers, loadCourseTeachers, loadChapters, loadPricing, loadCertificateTemplates, loadExams, loadAssignments, router]);

  useEffect(() => {
    if (selectedChapterId) {
      loadLessons(selectedChapterId);
    }
  }, [selectedChapterId, loadLessons]);

  useEffect(() => {
    const firstChapter = chapters[0];
    if (!selectedChapterId && firstChapter) {
      setSelectedChapterId(firstChapter.id);
    }
  }, [chapters, selectedChapterId]);
  
  const handleChange = useCallback((data: Partial<CourseDraft>) => {
    setDraft(prev => prev ? { ...prev, ...data } : data as CourseDraft);
    setIsDirty(true);
  }, []);
  
  const handleSave = useCallback(async () => {
    if (!draft?.id) return;
    
    setIsSaving(true);
    try {
      await updateDraft(draft);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, [draft, updateDraft]);
  
  const handlePublish = useCallback(async () => {
    if (!draft?.id) return;
    
    try {
      await publishCourse();
    } catch (err) {
      console.error("Publish failed:", err);
    }
  }, [draft?.id, publishCourse]);
  
  const handleNext = useCallback(() => {
    if (currentStepIndex < BUILDER_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex]);
  
  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);
  
  const handleStepClick = useCallback((index: number) => {
    setCurrentStepIndex(index);
    setShowMobileSteps(false);
  }, []);
  
  const getStepStatus = useCallback((index: number) => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "pending";
  }, [currentStepIndex]);
  
  // Loading state
  if (isLoading && !draft && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setShowMobileSteps(!showMobileSteps)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showMobileSteps ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-semibold text-gray-900 dark:text-white truncate">
              {draft?.title || "منشئ الكورسات"}
            </h1>
          </div>
          <div className="w-10" />
        </div>
        
        {/* Mobile Step Indicator */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {BUILDER_STEPS.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    status === "completed" 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                      : status === "current" 
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {status === "completed" ? <Check className="w-3.5 h-3.5" /> : <span>{index + 1}</span>}
                  {step.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar - Step Navigation */}
        <aside className={`${showMobileSteps ? "translate-x-0" : "-translate-x-full"} fixed lg:static inset-y-0 left-0 z-30 w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">منشئ الكورسات</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isNew ? "كورس جديد" : (draft?.title || "...").substring(0, 20)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMobileSteps(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Steps List */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="خطوات منشئ الكورس">
            {BUILDER_STEPS.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${
                    status === "completed"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30" 
                      : status === "current"
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    status === "completed"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                      : status === "current"
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                  }`}>
                    {status === "completed" ? <Check className="w-5 h-5" /> : <span className="text-sm font-medium">{index + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-medium truncate">{step.title}</p>
                    <p className="text-xs truncate">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>
          
          {/* Footer - Save Status */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                isSaving ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600" :
                isDirty ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" :
                "bg-green-100 dark:bg-green-900/30 text-green-600"
              }`}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isDirty ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isSaving ? "جاري الحفظ..." : isDirty ? "غير محفوظ" : "محفوظ"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lastSaved ? `آخر حفظ: ${lastSaved.toLocaleTimeString('ar-SA')}` : "لم يتم الحفظ بعد"}
                </p>
              </div>
              {isDirty && !isSaving && (
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  حفظ
                </Button>
              )}
            </div>
          </div>
        </aside>
        
        {/* Mobile Overlay */}
        {showMobileSteps && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setShowMobileSteps(false)}
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/admin/courses")}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {draft?.title || (isNew ? "كورس جديد" : "جاري التحميل...")}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      خطوة {currentStepIndex + 1} من {BUILDER_STEPS.length}: {BUILDER_STEPS[currentStepIndex]?.title}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {error && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error.message}</span>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSave}
                    disabled={isSaving || !isDirty}
                  >
                    <Save className="w-4 h-4" />
                    حفظ المسودة
                  </Button>
                </div>
              </div>
            </div>
          </header>
          
          {/* Step Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {error && (
              <Alert variant="destructive" onClose={clearError} className="mb-4">
                {error.message}
              </Alert>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
              {StepComponent && (
                <StepComponent
                  draft={draft}
                  onChange={handleChange}
                  isDirty={isDirty}
                  chapters={chapters}
                  lessons={lessons}
                  selectedChapterId={selectedChapterId}
                  onChapterChange={setSelectedChapterId}
                  onRefreshLessons={loadLessons}
                  onPublish={handlePublish}
                />
              )}
            </div>
            
            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                السابق
              </Button>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleNext}
                  disabled={currentStepIndex === BUILDER_STEPS.length - 1}
                >
                  {currentStepIndex === BUILDER_STEPS.length - 1 ? "نشر الكورس" : "التالي"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseBuilderWizard;