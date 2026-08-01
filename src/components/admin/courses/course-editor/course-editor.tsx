"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/api-client";
import { apiRoutes } from "@/lib/api/routes";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { Form } from "@/components/ui/form";
import { Tabs } from "@/components/ui/tabs";

import {
  courseSchema,
  TABS,
  type CourseEditorProps,
  type CourseFormValues,
  type CurriculumStats,
  type UploadedVideoMetadata,
} from "./types";
import { CourseEditorHeader } from "./course-editor-header";
import { CourseEditorSidebar } from "./course-editor-sidebar";
import { GeneralTab } from "./general-tab";
import { DetailsTab } from "./details-tab";
import { MediaTab } from "./media-tab";
import { SeoTab } from "./seo-tab";

export function CourseEditor({
  initialData,
  courseId,
  categories = [],
  teachers = [],
  allCourses = [],
}: CourseEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("general");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [curriculumStats, setCurriculumStats] = React.useState<CurriculumStats | null>(null);
  const [isCurriculumLoading, setIsCurriculumLoading] = React.useState(false);
  const [uploadedTrailerMeta, setUploadedTrailerMeta] =
    React.useState<UploadedVideoMetadata | null>(null);

  const toMultiline = React.useCallback((value?: string[] | string | null) => {
    if (Array.isArray(value)) {
      return value.join("\n");
    }

    return value || "";
  }, []);

  const toList = React.useCallback((value?: string | null) => {
    return (value || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }, []);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      nameAr: initialData?.nameAr || "",
      code: initialData?.code || "",
      price: initialData?.price || 0,
      level:
        (initialData?.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") ||
        "INTERMEDIATE",
      instructorName: initialData?.instructorName || "",
      instructorId: initialData?.instructorId || "",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
      simpleDescription: initialData?.simpleDescription || "",
      isActive: initialData?.isActive ?? true,
      isPublished: initialData?.isPublished ?? false,
      durationHours: initialData?.durationHours || 0,
      requirements: initialData?.requirements || "",
      learningObjectives: initialData?.learningObjectives || "",
      thumbnailUrl: initialData?.thumbnailUrl || "",
      trailerUrl: initialData?.trailerUrl || "",
      trailerDurationMinutes: initialData?.trailerDurationMinutes || 0,
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
      slug: initialData?.slug || "",
      isFeatured: initialData?.isFeatured ?? false,
      language: initialData?.language || "ar",
      coursePrerequisites: toMultiline(initialData?.coursePrerequisites),
      targetAudience: toMultiline(initialData?.targetAudience),
      whatYouLearn:
        toMultiline(initialData?.whatYouLearn) ||
        toMultiline(initialData?.learningObjectives),
    },
  });

  // ─── Fetch curriculum stats ──────────────────────────────────────────────
  React.useEffect(() => {
    if (!courseId) {
      setCurriculumStats(null);
      return;
    }

    let isMounted = true;

    const fetchCurriculumStats = async () => {
      setIsCurriculumLoading(true);
      let stats: CurriculumStats | null = null;
      try {
        const result = await apiClient.get<any>(`/admin/courses/${courseId}/curriculum`);
        stats = result.data?.stats || result.stats || null;
      } catch {
        stats = null;
      }
      if (isMounted) {
        setCurriculumStats(stats);
        setIsCurriculumLoading(false);
      }
    };

    void fetchCurriculumStats();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // ─── Form submit ─────────────────────────────────────────────────────────
  const onSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      const isEdit = !!courseId;
      const payload = {
        ...(isEdit ? { id: initialData?.id || courseId } : {}),
        ...values,
        requirements: values.requirements || "",
        learningObjectives: values.learningObjectives || "",
        coursePrerequisites: toList(
          values.coursePrerequisites || values.requirements,
        ),
        targetAudience: toList(values.targetAudience),
        whatYouLearn: toList(
          values.whatYouLearn || values.learningObjectives,
        ),
      };
      const result = await (isEdit
        ? apiClient.patch<any>(`/admin/courses`, payload)
        : apiClient.post<any>(`/admin/courses`, payload));

      if (!result) {
        throw new Error("فشل حفظ الدورة");
      }

      toast.success(
        isEdit ? "تم تحديث الدورة بنجاح" : "تم إنشاء الدورة بنجاح",
      );
      const savedCourse = result?.data?.course || result?.course || values;
      form.reset({
        ...(savedCourse as CourseFormValues),
        coursePrerequisites: toMultiline(savedCourse.coursePrerequisites),
        targetAudience: toMultiline(savedCourse.targetAudience),
        whatYouLearn: toMultiline(savedCourse.whatYouLearn),
        simpleDescription: toMultiline(savedCourse.simpleDescription),
      });
      router.refresh();

      const createdCourseId = !isEdit && (result?.data?.course?.id || result?.id);
      if (createdCourseId) {
        router.push(`/admin/courses/${createdCourseId}/curriculum`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "فشل حفظ الدورة");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Tab navigation ──────────────────────────────────────────────────────
  const nextTab = (current: string) => {
    const index = TABS.indexOf(current as any);
    if (index < TABS.length - 1) {
      setActiveTab(TABS[index + 1]!);
    }
  };

  const prevTab = (current: string) => {
    const index = TABS.indexOf(current as any);
    if (index > 0) {
      setActiveTab(TABS[index - 1]!);
    }
  };

  // ─── Trailer video helpers ───────────────────────────────────────────────
  const trailerUrl = form.watch("trailerUrl");
  const trailerDurationMinutes = form.watch("trailerDurationMinutes");
  useUnsavedChanges(form.formState.isDirty);
  const { isDirectVideo, youtubeEmbedUrl } = React.useMemo(() => {
    const isDirectVideo =
      !!trailerUrl &&
      (/^\/uploads\//.test(trailerUrl) ||
        /\.(mp4|webm|ogg|mov|avi|mkv|mpeg)(\?.*)?$/i.test(trailerUrl));
    const youtubeMatch = trailerUrl?.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/i,
    );
    const youtubeEmbedUrl = youtubeMatch
      ? `https://www.youtube.com/embed/${youtubeMatch[1]}`
      : null;
    return { isDirectVideo, youtubeEmbedUrl };
  }, [trailerUrl]);

  // ─── AI generation ───────────────────────────────────────────────────────
  const generateWithAI = async (field: "description" | "seoDescription") => {
    // Gather ALL course data for comprehensive AI analysis
    const courseData = {
      nameAr: form.getValues("nameAr"),
      name: form.getValues("name"),
      code: form.getValues("code"),
      level: form.getValues("level"),
      categoryId: form.getValues("categoryId"),
      instructorName: form.getValues("instructorName"),
      durationHours: form.getValues("durationHours"),
      price: form.getValues("price"),
      simpleDescription: form.getValues("simpleDescription"),
      requirements: form.getValues("requirements"),
      learningObjectives: form.getValues("learningObjectives"),
      coursePrerequisites: form.getValues("coursePrerequisites"),
      targetAudience: form.getValues("targetAudience"),
      whatYouLearn: form.getValues("whatYouLearn"),
      language: form.getValues("language"),
    };

    if (!courseData.nameAr && !courseData.name) {
      toast.error("يرجى إدخال اسم الدورة أولاً");
      return;
    }

    const toastId = toast.loading("جاري تحليل بيانات الدورة وتوليد الوصف...");
    try {
      let prompt = "";

      if (field === "description") {
        // Build comprehensive context from ALL available course data
        const contextParts = [
          `عنوان الدورة: ${courseData.nameAr || courseData.name}`,
          courseData.name && courseData.nameAr ? `الاسم بالإنجليزية: ${courseData.name}` : null,
          courseData.code ? `كود الدورة: ${courseData.code}` : null,
          courseData.level ? `المستوى: ${courseData.level === "BEGINNER" ? "مبتدئ" : courseData.level === "INTERMEDIATE" ? "متوسط" : "متقدم"}` : null,
          courseData.durationHours ? `مدة الدورة: ${courseData.durationHours} ساعة` : null,
          courseData.price !== undefined && courseData.price !== null ? `السعر: ${courseData.price}` : null,
          courseData.instructorName ? `المدرب: ${courseData.instructorName}` : null,
          courseData.language ? `اللغة: ${courseData.language === "ar" ? "العربية" : "English"}` : null,
        ].filter(Boolean);

        const contextText = contextParts.join("\n");

        if (courseData.simpleDescription) {
          // Enhanced prompt with full course context
          prompt = `أنت خبير في كتابة أوصاف الدورات التعليمية الاحترافية. قم بتحليل جميع بيانات الدورة التالية ثم اكتب وصفاً تفصيلياً شاملاً وجذاباً:

${contextText}

الوصف المختصر المقدم: ${courseData.simpleDescription}

${courseData.requirements ? `المتطلبات: ${courseData.requirements}` : ""}
${courseData.learningObjectives ? `أهداف التعلم: ${courseData.learningObjectives}` : ""}
${courseData.targetAudience ? `الجمهور المستهدف: ${courseData.targetAudience}` : ""}
${courseData.whatYouLearn ? `ماذا ستتعلم: ${courseData.whatYouLearn}` : ""}

اكتب وصفاً تفصيلياً احترافياً يتضمن:
1. مقدمة جذابة ومشجعة للتسجيل
2. نظرة عامة شاملة عن محتوى الدورة
3. الفوائد الرئيسية وما سيحققه المتعلم
4. الجمهور المستهدف المناسب لهذه الدورة
5. لماذا تختار هذه الدورة تحديداً

اجعل الوصف:
- احترافياً ومقنعاً
- منظم بشكل واضح مع عناوين فرعية
- مشجعاً للطلاب على التسجيل
- شاملاً لجميع الجوانب المهمة
- مناسباً للغة ${courseData.language === "en" ? "الإنجليزية" : "العربية"}`;
        } else {
          // Generate from comprehensive course data
          prompt = `أنت خبير في كتابة أوصاف الدورات التعليمية الاحترافية. قم بتحليل بيانات الدورة التالية ثم اكتب وصفاً تفصيلياً شاملاً وجذاباً:

${contextText}

${courseData.requirements ? `المتطلبات: ${courseData.requirements}` : ""}
${courseData.learningObjectives ? `أهداف التعلم: ${courseData.learningObjectives}` : ""}
${courseData.targetAudience ? `الجمهور المستهدف: ${courseData.targetAudience}` : ""}
${courseData.whatYouLearn ? `ماذا ستتعلم: ${courseData.whatYouLearn}` : ""}

اكتب وصفاً تفصيلياً احترافياً يتضمن:
1. مقدمة جذابة ومشجعة للتسجيل
2. نظرة عامة شاملة عن محتوى الدورة
3. الفوائد الرئيسية وما سيحققه المتعلم
4. الجمهور المستهدف المناسب لهذه الدورة
5. لماذا تختار هذه الدورة تحديداً

اجعل الوصف:
- احترافياً ومقنعاً
- منظم بشكل واضح مع عناوين فرعية
- مشجعاً للطلاب على التسجيل
- شاملاً لجميع الجوانب المهمة
- مناسباً للغة ${courseData.language === "en" ? "الإنجليزية" : "العربية"}`;
        }
      } else {
        // SEO description - concise and optimized
        const seoContext = [
          courseData.nameAr || courseData.name,
          courseData.level ? `مستوى ${courseData.level === "BEGINNER" ? "مبتدئ" : courseData.level === "INTERMEDIATE" ? "متوسط" : "متقدم"}` : null,
          courseData.durationHours ? `${courseData.durationHours} ساعة` : null,
        ].filter(Boolean).join(" - ");

        prompt = `اكتب وصف SEO احترافي ومختصر (150-160 حرف بالضبط) لدورة تعليمية.

العنوان: ${courseData.nameAr || courseData.name}
${courseData.simpleDescription ? `الوصف المختصر: ${courseData.simpleDescription}` : ""}

المعلومات الأساسية:
${seoContext}

الوصف يجب أن:
- يكون بين 150-160 حرف بالضبط
- يحتوي على كلمات مفتاحية مهمة
- يكون جذاباً ومشجعاً للنقر
- يلخص قيمة الدورة بشكل واضح
- يكون باللغة ${courseData.language === "en" ? "الإنجليزية" : "العربية"}`;
      }

      const response = await apiClient.fetch(apiRoutes.ai.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const result = await response.json();
      if (result.reply) {
        form.setValue(field, result.reply);
        toast.success("تم توليد المحتوى بنجاح", { id: toastId });
      } else if (!response.ok) {
        toast.error(result.error || "فشل في توليد المحتوى", { id: toastId });
      } else {
        toast.error("لم يتم استلام رد من الذكاء الاصطناعي", { id: toastId });
      }
    } catch {
      toast.error("فشل الاتصال بمساعد الذكاء الاصطناعي", { id: toastId });
    }
  };

  const handleExpandSimpleDescription = async () => {
    await generateWithAI("description");
  };

  // ─── AI analysis for course data ─────────────────────────────────────────
  const analyzeCourseWithAI = async () => {
    const courseData = {
      nameAr: form.getValues("nameAr"),
      name: form.getValues("name"),
      code: form.getValues("code"),
      level: form.getValues("level"),
      categoryId: form.getValues("categoryId"),
      instructorName: form.getValues("instructorName"),
      durationHours: form.getValues("durationHours"),
      price: form.getValues("price"),
      simpleDescription: form.getValues("simpleDescription"),
      requirements: form.getValues("requirements"),
      learningObjectives: form.getValues("learningObjectives"),
      coursePrerequisites: form.getValues("coursePrerequisites"),
      targetAudience: form.getValues("targetAudience"),
      whatYouLearn: form.getValues("whatYouLearn"),
      language: form.getValues("language"),
    };

    if (!courseData.nameAr && !courseData.name) {
      toast.error("يرجى إدخال اسم الدورة أولاً");
      return;
    }

    const toastId = toast.loading("جاري تحليل بيانات الدورة بالذكاء الاصطناعي...");
    try {
      const prompt = `أنت مستشار تعليمي خبير. قم بتحليل بيانات الدورة التالية وقدم تقييماً شاملاً مع اقتراحات للتحسين:

${Object.entries(courseData)
  .filter(([_, v]) => v && String(v).trim())
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

قدم تحليلاً يتضمن:
1. تقييم شامل لجودة بيانات الدورة
2. نقاط القوة والضعف
3. اقتراحات لتحسين الوصف والمحتوى
4. توصيات لجذب المزيد من الطلاب
5. أي معلومات ناقصة يجب إضافتها

اجعل التحليل احترافياً وعملياً.`;

      const response = await apiClient.fetch(apiRoutes.ai.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const result = await response.json();
      if (result.reply) {
        toast.success("تم التحليل بنجاح", { id: toastId });
        alert(result.reply); // You can replace this with a proper modal
      } else if (!response.ok) {
        toast.error(result.error || "فشل في التحليل", { id: toastId });
      } else {
        toast.error("لم يتم استلام رد من الذكاء الاصطناعي", { id: toastId });
      }
    } catch {
      toast.error("فشل الاتصال بمساعد الذكاء الاصطناعي", { id: toastId });
    }
  };

  // Watched fields for tab completion indicators
  const watchName = form.watch("name");
  const watchNameAr = form.watch("nameAr");
  const watchInstructorId = form.watch("instructorId");
  const watchThumbnailUrl = form.watch("thumbnailUrl");
  const watchTrailerUrl = form.watch("trailerUrl");
  const watchSeoTitle = form.watch("seoTitle");
  const watchSeoDescription = form.watch("seoDescription");

  const completedTabs = React.useMemo(() => {
    const tabs: string[] = [];
    if (watchName && watchNameAr) tabs.push("general");
    if (watchInstructorId) tabs.push("details");
    if (watchThumbnailUrl && watchTrailerUrl) tabs.push("media");
    if (watchSeoTitle && watchSeoDescription) tabs.push("seo");
    return tabs;
  }, [
    watchName,
    watchNameAr,
    watchInstructorId,
    watchThumbnailUrl,
    watchTrailerUrl,
    watchSeoTitle,
    watchSeoDescription,
  ]);

  const control = form.control;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        dir="rtl"
      >
        <CourseEditorHeader
          courseId={courseId}
          nameAr={form.watch("nameAr")}
          isPublished={form.watch("isPublished")}
          isSubmitting={isSubmitting}
          onBack={() => router.back()}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row gap-8">
            <CourseEditorSidebar
              courseId={courseId}
              thumbnailUrl={form.watch("thumbnailUrl")}
              trailerUrl={form.watch("trailerUrl")}
              description={form.watch("description")}
              isCurriculumLoading={isCurriculumLoading}
              chaptersCount={curriculumStats?.chaptersCount ?? 0}
              lessonsCount={curriculumStats?.lessonsCount ?? 0}
              rating={(initialData as any)?.rating}
              reviewsCount={(initialData as any)?._count?.reviews}
              onNavigate={(path) => router.push(path)}
              completedTabs={completedTabs as any}
            />

            <div className="flex-1">
              <GeneralTab
                control={control}
                categories={categories}
                onNext={() => nextTab("general")}
                onGenerateWithAI={generateWithAI}
                onExpandSimpleDescription={handleExpandSimpleDescription}
              />

              <DetailsTab
                control={control}
                teachers={teachers}
                courseId={courseId}
                allCourses={allCourses}
                onNext={() => nextTab("details")}
                onPrev={() => prevTab("details")}
              />

              <MediaTab
                control={control}
                watch={form.watch}
                setValue={form.setValue}
                trailerUrl={trailerUrl}
                isDirectVideo={isDirectVideo}
                youtubeEmbedUrl={youtubeEmbedUrl}
                uploadedTrailerMeta={uploadedTrailerMeta}
                setUploadedTrailerMeta={setUploadedTrailerMeta}
                trailerDurationMinutes={trailerDurationMinutes}
                onNext={() => nextTab("media")}
                onPrev={() => prevTab("media")}
              />

              <SeoTab
                control={control}
                watch={form.watch}
                isSubmitting={isSubmitting}
                onPrev={() => prevTab("seo")}
              />
            </div>
          </div>
        </Tabs>
      </form>
    </Form>
  );
}
