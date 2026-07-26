"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Upload, 
  Image, 
  Video,
  Loader2,
  AlertCircle,
  XCircle,
  BookOpen,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourseBuilder } from "../hooks";
import type { CourseCategory, CourseLevelOption, LanguageOption } from "../types";
import { basicInfoSchema, type BasicInfoFormData } from "../types";
import { apiRoutes } from "@/lib/api/routes";
import { apiClient } from "@/lib/api/api-client";

export const BasicInfoStep: React.FC<{ 
  draft: any; 
  onChange: (data: Partial<any>) => void;
  isDirty: boolean;
}> = ({ draft, onChange, isDirty }) => {
  const { categories, levels, languages, loadCategories, loadLevels, loadLanguages, error, clearError } = useCourseBuilder();
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(draft?.coverImageUrl || null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [promoVideoUrl, setPromoVideoUrl] = useState<string | null>(draft?.promoVideoUrl || null);
  const [promoUploading, setPromoUploading] = useState(false);
  
  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: draft?.title || "",
      slug: draft?.slug || "",
      shortDescription: draft?.shortDescription || "",
      longDescription: draft?.longDescription || "",
      categoryIds: draft?.categoryIds || [],
      level: draft?.level || "BEGINNER",
      language: draft?.language || "ar",
      estimatedDurationMins: draft?.estimatedDurationMins || 0,
      coverImageUrl: draft?.coverImageUrl || "",
      promoVideoUrl: draft?.promoVideoUrl || "",
    },
    mode: "onChange",
  });
  
  useEffect(() => {
    loadCategories();
    loadLevels();
    loadLanguages();
  }, [loadCategories, loadLevels, loadLanguages]);
  
  useEffect(() => {
    if (draft) {
      form.reset({
        title: draft.title || "",
        slug: draft.slug || "",
        shortDescription: draft.shortDescription || "",
        longDescription: draft.longDescription || "",
        categoryIds: draft.categoryIds || [],
        level: draft.level || "BEGINNER",
        language: draft.language || "ar",
        estimatedDurationMins: draft.estimatedDurationMins || 0,
        coverImageUrl: draft.coverImageUrl || "",
        promoVideoUrl: draft.promoVideoUrl || "",
      });
      setCoverImageUrl(draft.coverImageUrl || null);
      setPromoVideoUrl(draft.promoVideoUrl || null);
    }
  }, [draft, form]);
  
  const onSubmit = (data: BasicInfoFormData) => {
    const updateData = {
      ...data,
      coverImageUrl: coverImageUrl || data.coverImageUrl,
      promoVideoUrl: promoVideoUrl || data.promoVideoUrl,
    };
    onChange(updateData);
  };
  
  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cover");
      
      const response = await apiClient.fetch(`${apiRoutes.admin.courses}/upload/image`, {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      setCoverImageUrl(result.data.url);
      form.setValue("coverImageUrl", result.data.url);
      onChange({ coverImageUrl: result.data.url });
    } catch (err) {
      console.error("Cover upload failed:", err);
      alert("فشل رفع صورة الغلاف");
    } finally {
      setCoverUploading(false);
    }
  };
  
  const handlePromoUpload = async (file: File) => {
    setPromoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "promo");
      
      const response = await apiClient.fetch(`${apiRoutes.admin.courses}/upload/video`, {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      setPromoVideoUrl(result.data.url);
      form.setValue("promoVideoUrl", result.data.url);
      onChange({ promoVideoUrl: result.data.url });
    } catch (err) {
      console.error("Promo video upload failed:", err);
      alert("فشل رفع الفيديو الترويجي");
    } finally {
      setPromoUploading(false);
    }
  };
  
  const handleFileDrop = (e: React.DragEvent, type: "cover" | "promo") => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    if (type === "cover" && file.type.startsWith("image/")) {
      handleCoverUpload(file);
    } else if (type === "promo" && file.type.startsWith("video/")) {
      handlePromoUpload(file);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "promo") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (type === "cover" && file.type.startsWith("image/")) {
      handleCoverUpload(file);
    } else if (type === "promo" && file.type.startsWith("video/")) {
      handlePromoUpload(file);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 dark:text-red-300">{error.message}</p>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}
      
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">معلومات الكورس الأساسية</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">أدخل المعلومات الأساسية للكورس</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                عنوان الكورس <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                {...form.register("title")}
                id="title"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="مثال: أساسيات البرمجة بلغة بايثون"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                الرابط المختصر (Slug) <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                {...form.register("slug")}
                id="slug"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="python-fundamentals"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">أحرف إنجليزية صغيرة، أرقام، وشرطات فقط</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">الوصف المختصر</label>
            <textarea
              {...form.register("shortDescription")}
              id="shortDescription"
              rows={2}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="وصف مختصر يظهر في بطاقات الكورسات..."
            />
          </div>
          
          <div>
            <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">الوصف التفصيلي</label>
            <textarea
              {...form.register("longDescription")}
              id="longDescription"
              rows={5}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="وصف مفصل لمحتوى الكورس، ما سيتعلمه الطالب، المتطلبات المسبقة..."
            />
          </div>
        </div>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">التصنيف والمستوى</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">حدد تصنيف الكورس ومستوى الصعوبة</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="categoryIds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                التصنيفات <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                {...form.register("categoryIds")}
                id="categoryIds"
                multiple
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {categories.map((opt: any) => (
                  <option key={opt.id} value={opt.id}>{opt.name || opt.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                المستوى <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                {...form.register("level")}
                id="level"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {levels.map((l: any) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                اللغة <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                {...form.register("language")}
                id="language"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {languages.map((l: LanguageOption) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="estimatedDurationMins" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">المدة التقديرية (بالدقائق)</label>
            <input
              type="number"
              min="0"
              {...form.register("estimatedDurationMins", { valueAsNumber: true })}
              id="estimatedDurationMins"
               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
             />
           </div>
         </div>
       </section>
       
       <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
         <div className="flex items-start gap-3">
           <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
             <Image className="w-5 h-5" />
           </div>
           <div>
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">صورة الغلاف والفيديو الترويجي</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">ارفع صورة الغلاف والفيديو الترويجي للكورس</p>
           </div>
         </div>
         <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">صورة الغلاف</label>
             <div
               onDragOver={(e) => handleFileDrop(e, "cover")}
               onDrop={(e) => handleFileDrop(e, "cover")}
               className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
             >
               {coverImageUrl ? (
                 <div className="relative inline-block">
                   <img src={coverImageUrl} alt="Cover" className="max-h-48 rounded-lg" />
                   <button
                     type="button"
                     onClick={() => { setCoverImageUrl(null); form.setValue("coverImageUrl", ""); }}
                     className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                   >
                     <XCircle className="w-4 h-4" />
                   </button>
                 </div>
               ) : (
                 <div className="space-y-2">
                   <Image className="w-12 h-12 mx-auto text-gray-400" />
                   <p className="text-sm text-gray-500">اسحب الصورة هنا أو انقر للاختيار</p>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => handleFileInput(e, "cover")}
                     className="hidden"
                     id="cover-upload"
                   />
                   <label htmlFor="cover-upload" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700">
                     {coverUploading ? "جاري الرفع..." : "اختر صورة"}
                   </label>
                 </div>
               )}
             </div>
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">الفيديو الترويجي</label>
             <div
               onDragOver={(e) => handleFileDrop(e, "promo")}
               onDrop={(e) => handleFileDrop(e, "promo")}
               className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
             >
               {promoVideoUrl ? (
                 <div className="relative inline-block">
                   <video src={promoVideoUrl} controls className="max-h-48 rounded-lg" />
                   <button
                     type="button"
                     onClick={() => { setPromoVideoUrl(null); form.setValue("promoVideoUrl", ""); }}
                     className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                   >
                     <XCircle className="w-4 h-4" />
                   </button>
                 </div>
               ) : (
                 <div className="space-y-2">
                   <Video className="w-12 h-12 mx-auto text-gray-400" />
                   <p className="text-sm text-gray-500">اسحب الفيديو هنا أو انقر للاختيار</p>
                   <input
                     type="file"
                     accept="video/*"
                     onChange={(e) => handleFileInput(e, "promo")}
                     className="hidden"
                     id="promo-upload"
                   />
                   <label htmlFor="promo-upload" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700">
                     {promoUploading ? "جاري الرفع..." : "اختر فيديو"}
                   </label>
                 </div>
               )}
             </div>
           </div>
         </div>
       </section>
       
       <div className="flex justify-end">
         <button
           type="submit"
           className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           حفظ والمتابعة
         </button>
       </div>
      </form>
    );
  };
