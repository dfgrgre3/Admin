"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit2, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCourseBuilder } from "../hooks";
import { chapterSchema, type Chapter } from "../types";
import { Button, Card, Badge, Skeleton, Alert } from "../ui";

const ChapterCard: React.FC<{ 
  chapter: Chapter; 
  index: number;
  onEdit: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
}> = ({ chapter, index, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <Card className="overflow-hidden">
      <div 
        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="text-gray-400 cursor-grab active:cursor-grabbing" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium">
              {index + 1}
            </span>
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{chapter.title}</h4>
            {chapter.availableFrom && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                متاح من {new Date(chapter.availableFrom).toLocaleDateString('ar-SA')}
              </span>
            )}
            {chapter.dripDelayDays && chapter.dripDelayDays > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                تنقيط بعد {chapter.dripDelayDays} يوم
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {chapter.lessons?.length || 0} درس
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          <button onClick={(e) => { e.stopPropagation(); onEdit(chapter); }} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors" aria-label="تعديل الفصل">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" aria-label="حذف الفصل">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-3">
          {chapter.lessons?.length > 0 ? (
            <ul className="space-y-2" role="list">
              {chapter.lessons.map((lesson, lessonIndex) => (
                <li key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <span className="flex items-center justify-center w-7 h-7 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {lessonIndex + 1}
                  </span>
                  <span className="flex-1 font-medium text-gray-900 dark:text-white truncate">{lesson.title}</span>
                  <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full capitalize">
                    {lesson.type.toLowerCase().replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">لا توجد دروس في هذا الفصل</p>
          )}
        </div>
      )}
    </Card>
  );
};

const ChapterForm: React.FC<{
  chapter?: Chapter | null;
  onSubmit: (data: z.infer<typeof chapterSchema>) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ chapter, onSubmit, onCancel, isLoading }) => {
  const form = useForm<z.infer<typeof chapterSchema>>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: chapter?.title || "",
      orderIndex: chapter?.orderIndex || 0,
    },
  });
  
  const handleSubmit = (data: z.infer<typeof chapterSchema>) => {
    onSubmit(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان الفصل *</label>
        <input
          {...form.register("title")}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="مثال: مقدمة في البرمجة"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {chapter ? "تحديث" : "إضافة"}
        </Button>
      </div>
    </form>
  );
};

interface ChaptersStepProps {
  draft: any;
  onChange: (data: Partial<any>) => void;
}

export const ChaptersStep: React.FC<ChaptersStepProps> = ({ draft, onChange }) => {
  const { 
    chapters, 
    loadChapters, 
    createChapter, 
    updateChapter, 
    deleteChapter, 
    isLoading,
  } = useCourseBuilder({ courseId: draft?.id });
  
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    if (draft?.id) loadChapters(draft?.id);
  }, [draft?.id, loadChapters]);
  
  const handleCreate = useCallback(async (data: z.infer<typeof chapterSchema>) => {
    if (!draft?.id) return;
    const newChapter = await createChapter(data);
    if (newChapter) {
      setShowForm(false);
      onChange({ sections: [...(draft?.sections || []), newChapter] });
    }
  }, [draft?.id, createChapter, draft?.sections, onChange]);
  
  const handleUpdate = useCallback(async (data: z.infer<typeof chapterSchema>) => {
    if (editingChapter) {
      await updateChapter(editingChapter.id, data);
      setEditingChapter(null);
      setShowForm(false);
    }
  }, [editingChapter, updateChapter]);
  
  const handleDelete = useCallback(async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الفصل؟ سيتم حذف جميع الدروس بداخله.")) {
      await deleteChapter(id);
    }
  }, [deleteChapter]);
  
  if (isLoading && chapters.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الفصول</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إنشاء وتعديل وحذف وترتيب فصول الكورس</p>
        </div>
        <Button
          onClick={() => { setEditingChapter(null); setShowForm(true); }}
        >
          <Plus className="w-4 h-4" />
          إضافة فصل
        </Button>
      </div>
      
      <div className="space-y-4">
        {chapters.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا توجد فصول بعد</h3>
            <p className="text-gray-500 dark:text-gray-400">ابدأ بإنشاء الفصل الأول للكورس</p>
          </div>
        ) : (
          chapters.map((chapter, index) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              index={index}
              onEdit={setEditingChapter}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
      
      {(showForm || editingChapter) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingChapter ? "تعديل الفصل" : "إضافة فصل جديد"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingChapter(null); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ChapterForm
              chapter={editingChapter}
              onSubmit={editingChapter ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditingChapter(null); }}
              isLoading={isLoading}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChaptersStep;