"use client";

import React, { useState, useCallback, useEffect } from "react";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit2, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  Video,
  FileText,
  Music,
  File,
  ExternalLink,
  HelpCircle,
  BookOpen,
  Clock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCourseBuilder } from "../hooks";
import { lessonSchema, type Lesson, type Chapter, type LessonFormData } from "../types";


const lessonTypeIcons: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-4 h-4" />,
  TEXT: <FileText className="w-4 h-4" />,
  AUDIO: <Music className="w-4 h-4" />,
  FILE: <File className="w-4 h-4" />,
  EXTERNAL_LINK: <ExternalLink className="w-4 h-4" />,
  INTERACTIVE_QUIZ: <HelpCircle className="w-4 h-4" />,
};

const lessonTypeLabels: Record<string, string> = {
  VIDEO: "فيديو",
  TEXT: "نص/مقال",
  AUDIO: "صوت",
  FILE: "ملف",
  EXTERNAL_LINK: "رابط خارجي",
  INTERACTIVE_QUIZ: "اختبار تفاعلي",
};

const LessonCard: React.FC<{ 
  lesson: Lesson; 
  index: number;
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (ids: string[]) => void;
  isDragging?: boolean;
}> = ({ lesson, index, onEdit, onDelete, onDuplicate, onReorder, isDragging }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all ${
        isDragging ? "opacity-50 ring-2 ring-primary-500" : ""
      }`}
    >
      <div 
        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="text-gray-400 cursor-grab active:cursor-grabbing" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium text-sm">
              {index + 1}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {lessonTypeIcons[lesson.type] || <HelpCircle className="w-3 h-3" />}
              {lessonTypeLabels[lesson.type] || lesson.type}
            </span>
            <h4 className="font-medium text-gray-900 dark:text-white truncate">{lesson.title}</h4>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {lesson.durationSeconds > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.floor(lesson.durationSeconds / 60)} دقيقة
              </span>
            )}
            {lesson.isFreePreview && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <CheckCircle className="w-3 h-3" />
                معاينة مجانية
              </span>
            )}
            {lesson.availabilityType === "ENROLLMENT_RELATIVE" && lesson.dripDelayDays && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                <Clock className="w-3 h-3" />
                تنقيط بعد {lesson.dripDelayDays} يوم
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(lesson.id); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors" aria-label="تكرار الدرس" title="تكرار">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(lesson); }} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors" aria-label="تعديل الدرس" title="تعديل">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(lesson.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" aria-label="حذف الدرس" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 space-y-2 bg-gray-50/50 dark:bg-gray-900/30">
          {lesson.content && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
              {lesson.content}
            </div>
          )}
          {lesson.mediaUrl && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">الوسائط: </span>
              <a href={lesson.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                عرض الرابط
              </a>
            </div>
          )}
          {lesson.attachments?.length > 0 && (
            <div>
              <span className="font-medium text-sm text-gray-700 dark:text-gray-300">المرفقات ({lesson.attachments.length}):</span>
              <ul className="mt-1 space-y-1">
                {lesson.attachments.map(att => (
                  <li key={att.id} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <File className="w-3.5 h-3.5" />
                    <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate flex-1">
                      {att.title}
                    </a>
                    {att.fileSize && (
                      <span className="text-xs text-gray-400">({(att.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LessonForm: React.FC<{
  lesson?: Lesson | null;
  chapterId: string;
  lessonTypes: string[];
  onSubmit: (data: LessonFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ lesson, chapterId, lessonTypes, onSubmit, onCancel, isLoading }) => {
  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || "",
      type: lesson?.type || "VIDEO",
      content: lesson?.content || null,
      mediaUrl: lesson?.mediaUrl || null,
      durationSeconds: lesson?.durationSeconds ?? 0,
      isFreePreview: lesson?.isFreePreview ?? false,
      orderIndex: lesson?.orderIndex ?? 0,
      availabilityType:
        lesson?.availabilityType === "ENROLLMENT_RELATIVE"
          ? "ENROLLMENT_RELATIVE"
          : "CALENDAR_DATE",
      availableFrom: lesson?.availableFrom || null,
      dripDelayDays: lesson?.dripDelayDays ?? null,
    },
  });
  
  const handleSubmit = (data: LessonFormData) => {

    onSubmit({
      ...data,
      orderIndex: Number(data.orderIndex),
      durationSeconds: Number(data.durationSeconds),
      dripDelayDays: data.dripDelayDays ? Number(data.dripDelayDays) : null,
      availableFrom: data.availableFrom || null,
    });
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان الدرس *</label>
        <input
          {...form.register("title")}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="مثال: المتغيرات وأنواع البيانات"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الدرس *</label>
        <select
          {...form.register("type")}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {lessonTypes.map(type => (
            <option key={type} value={type}>
              {lessonTypeLabels[type] || type}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المحتوى (نص/HTML)</label>
        <textarea
          {...form.register("content")}
          rows={5}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
          placeholder="محتوى الدرس النصي..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط الوسائط (فيديو/ملف/رابط خارجي)</label>
        <input
          {...form.register("mediaUrl")}
          type="url"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="https://example.com/video.mp4"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدة (بالثواني)</label>
          <input
            type="number"
            {...form.register("durationSeconds", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الترتيب</label>
          <input
            type="number"
            {...form.register("orderIndex", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            min="0"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          {...form.register("isFreePreview")}
          id="isFreePreview"
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="isFreePreview" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          درس معاينة مجانية (يمكن الوصول إليه بدون تسجيل)
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع التوفر</label>
          <select
            {...form.register("availabilityType")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="CALENDAR_DATE">تاريخ محدد</option>
            <option value="ENROLLMENT_RELATIVE">نسبي للتسجيل</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {form.watch("availabilityType") === "CALENDAR_DATE" ? "تاريخ التوفر" : "تأخير التنقيط (أيام)"}
          </label>
          {form.watch("availabilityType") === "CALENDAR_DATE" ? (
            <input
              type="datetime-local"
              {...form.register("availableFrom")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <input
              type="number"
              {...form.register("dripDelayDays", { valueAsNumber: true })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              min="0"
            />
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          إلغاء
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {lesson ? "تحديث" : "إضافة"}
        </button>
      </div>
    </form>
  );
};

export const LessonsStep: React.FC<{ 
  draft: any; 
  chapters: Chapter[];
  selectedChapterId: string;
  onChapterChange: (id: string) => void;
  onChange: (data: Partial<any>) => void;
  isDirty: boolean;
}> = ({ draft, chapters, selectedChapterId, onChapterChange, onChange, isDirty }) => {
  const { 
    lessons, 
    loadLessons, 
    createLesson, 
    updateLesson, 
    deleteLesson, 
    duplicateLesson, 
    reorderLessons,
    isLoading,
  } = useCourseBuilder({ courseId: draft?.id });
  
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  
  const selectedChapter = chapters.find(c => c.id === selectedChapterId);
  
  useEffect(() => {
    if (selectedChapterId) loadLessons(selectedChapterId);
  }, [selectedChapterId, loadLessons]);
  
  const handleCreate = useCallback(async (data: LessonFormData) => {
    if (!selectedChapterId) return;
    const newLesson = await createLesson(selectedChapterId, data);
    if (newLesson) {
      setShowForm(false);
      onChange({ ...draft });
    }
  }, [selectedChapterId, createLesson, draft, onChange]);
  
  const handleUpdate = useCallback(async (data: LessonFormData) => {

    if (editingLesson) {
      await updateLesson(editingLesson.id, data);
      setEditingLesson(null);
      setShowForm(false);
      onChange({ ...draft });
    }
  }, [editingLesson, updateLesson, draft, onChange]);
  
  const handleDelete = useCallback(async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الدرس؟")) {
      await deleteLesson(id);
      onChange({ ...draft });
    }
  }, [deleteLesson, draft, onChange]);
  
  const handleDuplicate = useCallback(async (id: string) => {
    if (!selectedChapterId) return;
    const newLesson = await duplicateLesson(id);
    if (newLesson) {
      onChange({ ...draft });
    }
  }, [selectedChapterId, duplicateLesson, draft, onChange]);
  
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId && selectedChapterId) {
      const ids = lessons.map(l => l.id);
      const fromIndex = ids.indexOf(draggedId);
      const toIndex = ids.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) {
        setDraggedId(null);
        return;
      }
      const newIds = [...ids];
      const [removed] = newIds.splice(fromIndex, 1);
      if (removed) {
        newIds.splice(toIndex, 0, removed);
        reorderLessons(selectedChapterId, newIds);
        onChange({ ...draft });
      }
    }

    setDraggedId(null);
  }, [draggedId, lessons, selectedChapterId, reorderLessons, onChange, draft]);
  
  const lessonTypes = ["VIDEO", "TEXT", "AUDIO", "FILE", "EXTERNAL_LINK", "INTERACTIVE_QUIZ"];
  
  if (!selectedChapterId) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">اختر فصلاً أولاً</h3>
        <p className="text-gray-500 dark:text-gray-400">اختر فصلاً من القائمة الجانبية لإدارة دروسه</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الدروس</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">الفصل: {selectedChapter?.title}</p>
        </div>
        <button
          onClick={() => { setEditingLesson(null); setShowForm(true); }}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة درس
        </button>
      </div>
      
      <div className="flex items-center gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الفصل:</label>
        <select
          value={selectedChapterId}
          onChange={e => onChapterChange(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {chapters.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>
      
      {isDirty && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-800 dark:text-yellow-200">لديك تغييرات غير محفوظة. سيتم الحفظ تلقائياً بعد التوقف عن الكتابة.</span>
        </div>
      )}
      
      <div className="space-y-3" role="list" aria-label="قائمة الدروس">
        {lessons.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا توجد دروس في هذا الفصل</h3>
            <p className="text-gray-500 dark:text-gray-400">ابدأ بإضافة الدرس الأول</p>
          </div>
        ) : (
          lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              onEdit={setEditingLesson}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onReorder={(ids) => selectedChapterId && reorderLessons(selectedChapterId, ids)}
              isDragging={draggedId === lesson.id}
            />
          ))
        )}
      </div>
      
      {(showForm || editingLesson) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingLesson ? "تعديل الدرس" : "إضافة درس جديد"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingLesson(null); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <LessonForm
              lesson={editingLesson}
              chapterId={selectedChapterId}
              lessonTypes={lessonTypes}
              onSubmit={editingLesson ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditingLesson(null); }}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsStep;