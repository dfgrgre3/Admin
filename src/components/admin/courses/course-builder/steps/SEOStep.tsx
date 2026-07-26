"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Globe, 
  Link,
  Info,
  Save,
} from "lucide-react";
import { useCourseBuilder } from "../hooks";
import { seoSchema, type SEOFormData } from "../types";
import { Section, Input, Textarea, Alert, Button } from "../ui";

interface SEOStepProps {
  draft: any;
  onChange: (data: Partial<any>) => void;
  isDirty: boolean;
}

export const SEOStep: React.FC<SEOStepProps> = ({ 
  draft, 
  onChange, 
  isDirty 
}) => {
  const { loadSEO, updateSEO, isLoading, error, clearError } = useCourseBuilder({ courseId: draft?.id });
  
  const form = useForm<SEOFormData>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      seoTitle: draft?.seoTitle || "",
      seoDescription: draft?.seoDescription || "",
      seoKeywords: draft?.seoKeywords || [],
      canonicalUrl: draft?.canonicalUrl || "",
    },
    mode: "onChange",
  });
  
  useEffect(() => {
    if (draft?.id) {
      loadSEO(draft.id).then(data => {
        if (data) {
          form.reset({
            seoTitle: data.seoTitle || draft.seoTitle || "",
            seoDescription: data.seoDescription || draft.seoDescription || "",
            seoKeywords: data.seoKeywords || draft.seoKeywords || [],
            canonicalUrl: data.canonicalUrl || draft.canonicalUrl || "",
          });
        }
      });
    }
  }, [draft?.id, loadSEO, form, draft]);
  
  const onSubmit = useCallback(async (data: SEOFormData) => {
    if (!draft?.id) return;
    try {
      await updateSEO(data);
      onChange({ ...draft, ...data });
    } catch (err) {
      console.error("Failed to update SEO:", err);
    }
  }, [draft?.id, updateSEO, onChange, draft]);
  
  const seoTitle = form.watch("seoTitle");
  const seoDescription = form.watch("seoDescription");
  const seoKeywords = form.watch("seoKeywords");
  
  const titleLength = seoTitle?.length || 0;
  const descLength = seoDescription?.length || 0;
  const titleOptimal = titleLength > 0 && titleLength <= 60;
  const descOptimal = descLength > 0 && descLength <= 160;
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive" onClose={clearError}>
          <AlertCircle className="w-4 h-4" />
          <span>{error.message}</span>
        </Alert>
      )}
      
      {isDirty && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="w-4 h-4" />
          <span>لديك تغييرات غير محفوظة. سيتم الحفظ تلقائياً بعد التوقف عن الكتابة.</span>
        </Alert>
      )}
      
      <Section title="إعدادات محركات البحث (SEO)" description="تحسين ظهور الكورس في نتائج البحث" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-6">
          {/* SEO Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
              <span>عنوان الصفحة (SEO Title)</span>
              <span className={`text-xs font-mono ${titleOptimal ? "text-green-600" : titleLength > 60 ? "text-red-600" : "text-gray-500"}`}>
                {titleLength}/60
              </span>
            </label>
            <Input
              {...form.register("seoTitle")}
              placeholder="عنوان محسّن لمحركات البحث (مثال: تعلم البرمجة بلغة بايثون - كورس شامل للمبتدئين)"
              error={form.formState.errors.seoTitle?.message}
              maxLength={60}
            />
            <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${titleOptimal ? "bg-green-500" : titleLength > 60 ? "bg-red-500" : "bg-primary-500"}`}
                style={{ width: `${Math.min(titleLength / 60, 1) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {titleOptimal ? "✓ طول مثالي" : titleLength > 60 ? "⚠ طويل جداً - سيتم قطعه في نتائج البحث" : "أضف عنواناً محسناً"}
            </p>
          </div>
          
          {/* SEO Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
              <span>وصف الصفحة (Meta Description)</span>
              <span className={`text-xs font-mono ${descOptimal ? "text-green-600" : descLength > 160 ? "text-red-600" : "text-gray-500"}`}>
                {descLength}/160
              </span>
            </label>
            <Textarea
              {...form.register("seoDescription")}
              rows={3}
              placeholder="وصف جذاب يظهر في نتائج البحث (مثال: تعلم أساسيات البرمجة بلغة بايثون مع أمثلة عملية ومشاريع حقيقية. مناسب للمبتدئين تماماً.)"
              error={form.formState.errors.seoDescription?.message}
              maxLength={160}
            />
            <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${descOptimal ? "bg-green-500" : descLength > 160 ? "bg-red-500" : "bg-primary-500"}`}
                style={{ width: `${Math.min(descLength / 160, 1) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {descOptimal ? "✓ طول مثالي" : descLength > 160 ? "⚠ طويل جداً - سيتم قطعه في نتائج البحث" : "أضف وصفاً محسناً"}
            </p>
          </div>
          
          {/* SEO Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الكلمات المفتاحية (Meta Keywords)
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 min-h-[44px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                {(seoKeywords || []).map((keyword, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => {
                        const newKeywords = (seoKeywords || []).filter((_, i) => i !== index);
                        form.setValue("seoKeywords", newKeywords);
                      }}
                      className="hover:text-primary-900 dark:hover:text-primary-100"
                    >
                      <span className="w-4 h-4 flex items-center justify-center">×</span>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="أضف كلمة مفتاحية واضغط Enter"
                  className="flex-1 min-w-[150px] px-2 py-1 text-sm border-none outline-none bg-transparent"
                  onKeyDown={e => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      e.preventDefault();
                      form.setValue("seoKeywords", [...(seoKeywords || []), e.currentTarget.value.trim()]);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">اضغط Enter بعد كل كلمة مفتاحية</p>
            </div>
            {form.formState.errors.seoKeywords && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.seoKeywords.message}</p>
            )}
          </div>
          
          {/* Canonical URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              الرابط الكنوني (Canonical URL)
              <Info className="w-4 h-4 text-gray-400" aria-label="الرابط الرسمي للكورس لتجنب المحتوى المكرر" />
            </label>
            <Input
              {...form.register("canonicalUrl")}
              type="url"
              placeholder="https://example.com/courses/python-fundamentals"
              error={form.formState.errors.canonicalUrl?.message}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              الرابط الرسمي للكورس. اتركه فارغاً لاستخدام الرابط الحالي تلقائياً.
            </p>
          </div>
          
          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              معاينة نتيجة البحث
            </h4>
            <div className="font-sans text-sm">
              <div className="text-green-600 dark:text-green-400 mb-1">example.com › courses › python-fundamentals</div>
              <div className="text-blue-600 dark:text-blue-400 font-medium mb-1" style={{ maxWidth: "600px" }}>
                {seoTitle || "عنوان الكورس سيظهر هنا..."}
              </div>
              <div className="text-gray-600 dark:text-gray-300 line-clamp-2" style={{ maxWidth: "600px" }}>
                {seoDescription || "وصف الكورس سيظهر هنا..."}
              </div>
            </div>
          </div>
        </div>
      </Section>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} icon={<Save className="w-4 h-4" />}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "حفظ إعدادات SEO"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SEOStep;