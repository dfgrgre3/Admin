"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { courseBuilderApi } from "./api";
import type { CourseDraft, Chapter, Lesson, Teacher, TeacherAssignment, Exam, Assignment, Pricing, CertificateTemplate, Attachment } from "./types";

interface UseCourseBuilderOptions {
  courseId?: string;
  onAutoSave?: (data: Partial<CourseDraft>) => void;
  autoSaveDelay?: number;
}

interface UseCourseBuilderReturn {
  // Draft state
  draft: CourseDraft | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  
  // Actions
  loadDraft: (courseId: string) => Promise<void>;
  createDraft: (data: Partial<CourseDraft>) => Promise<CourseDraft | null>;
  updateDraft: (data: Partial<CourseDraft>) => Promise<void>;
  autoSave: (data: Partial<CourseDraft>) => Promise<void>;
  deleteDraft: () => Promise<void>;
  publishCourse: () => Promise<void>;
  unpublishCourse: () => Promise<void>;
  archiveCourse: () => Promise<void>;
  unarchiveCourse: () => Promise<void>;
  
  // Categories
  categories: any[];
  loadCategories: () => Promise<void>;
  
  // Levels
  levels: any[];
  loadLevels: () => Promise<void>;
  
  // Languages
  languages: any[];
  loadLanguages: () => Promise<void>;
  
  // Teachers
  teachers: Teacher[];
  courseTeachers: TeacherAssignment[];
  loadTeachers: () => Promise<void>;
  loadCourseTeachers: (courseId: string) => Promise<void>;
  assignTeacher: (instructorId: string, role: string) => Promise<void>;
  removeTeacher: (instructorId: string) => Promise<void>;
  
  // Chapters
  chapters: Chapter[];
  loadChapters: (courseId: string) => Promise<void>;
  createChapter: (data: any) => Promise<Chapter | null>;
  updateChapter: (chapterId: string, data: Partial<Chapter>) => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;
  reorderChapters: (chapterIds: string[]) => Promise<void>;
  
  // Lessons
  lessons: Lesson[];
  loadLessons: (sectionId: string) => Promise<void>;
  createLesson: (sectionId: string, data: Partial<Lesson>) => Promise<Lesson | null>;
  updateLesson: (lessonId: string, data: Partial<Lesson>) => Promise<void>;
  deleteLesson: (lessonId: string) => Promise<void>;
  duplicateLesson: (lessonId: string) => Promise<Lesson | null>;
  reorderLessons: (sectionId: string, lessonIds: string[]) => Promise<void>;
  
  // Videos
  uploadVideo: (lessonId: string, file: File, onProgress?: (progress: number) => void) => Promise<any>;
  deleteVideo: (lessonId: string) => Promise<void>;
  updateVideo: (lessonId: string, data: any) => Promise<any>;
  getVideo: (lessonId: string) => Promise<any>;
  getProcessingStatus: (videoId: string) => Promise<any>;
  
  // Files
  uploadFile: (lessonId: string, file: File) => Promise<Attachment | null>;
  deleteFile: (attachmentId: string) => Promise<void>;
  downloadFile: (attachmentId: string) => Promise<void>;
  
  // Exams
  exams: Exam[];
  loadExams: (courseId?: string) => Promise<void>;
  linkExam: (lessonId: string, examId: string) => Promise<void>;
  unlinkExam: (lessonId: string) => Promise<void>;
  
  // Assignments
  assignments: Assignment[];
  loadAssignments: (courseId?: string) => Promise<void>;
  linkAssignment: (lessonId: string, assignmentId: string) => Promise<void>;
  unlinkAssignment: (lessonId: string) => Promise<void>;
  
  // Certificates
  certificateTemplates: CertificateTemplate[];
  loadCertificateTemplates: () => Promise<void>;
  assignCertificateTemplate: (templateId: string) => Promise<void>;
  removeCertificateTemplate: () => Promise<void>;
  
  // Pricing
  pricing: Pricing[];
  loadPricing: (courseId: string) => Promise<void>;
  updatePricing: (data: Partial<Pricing>[]) => Promise<void>;
  
  // SEO
  loadSEO: (courseId: string) => Promise<any>;
  updateSEO: (data: any) => Promise<void>;
  
  // Preview
  loadPreview: (courseId: string) => Promise<any>;
  
  // Error handling
  error: Error | null;
  clearError: () => void;
}

export function useCourseBuilder(options: UseCourseBuilderOptions = {}): UseCourseBuilderReturn {
  const { courseId, onAutoSave, autoSaveDelay = 2000 } = options;
  
  const [draft, setDraft] = useState<CourseDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  // Levels
  const [levels, setLevels] = useState<any[]>([]);
  // Languages
  const [languages, setLanguages] = useState<any[]>([]);
  // Teachers
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courseTeachers, setCourseTeachers] = useState<TeacherAssignment[]>([]);
  // Chapters
  const [chapters, setChapters] = useState<Chapter[]>([]);
  // Lessons
  const [lessons, setLessons] = useState<Lesson[]>([]);
  // Exams
  const [exams, setExams] = useState<Exam[]>([]);
  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  // Certificates
  const [certificateTemplates, setCertificateTemplates] = useState<CertificateTemplate[]>([]);
  // Pricing
  const [pricing, setPricing] = useState<Pricing[]>([]);
  
  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentCourseIdRef = useRef(courseId);
  
  currentCourseIdRef.current = courseId;
  
  const clearError = useCallback(() => setError(null), []);
  
  const handleError = useCallback((err: unknown, defaultMessage: string) => {
    const error = err instanceof Error ? err : new Error(defaultMessage);
    setError(error);
    throw error;
  }, []);
  
  // ─── Draft Operations ──────────────────────────────────────────────────────
  
  const loadDraft = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await courseBuilderApi.getDraft(id);
      if (response.error) throw new Error(response.error);
      setDraft(response.data || null);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      handleError(err, "فشل تحميل مسودة الكورس");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);
  
  const createDraft = useCallback(async (data: Partial<CourseDraft>) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await courseBuilderApi.createDraft(data);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setDraft(response.data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل إنشاء مسودة الكورس");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);
  
  const updateDraft = useCallback(async (data: Partial<CourseDraft>) => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    setIsSaving(true);
    setError(null);
    try {
      const response = await courseBuilderApi.updateDraft(id, data);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setDraft(response.data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      handleError(err, "فشل تحديث مسودة الكورس");
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);
  
  const autoSave = useCallback(async (data: Partial<CourseDraft>) => {
    const id = currentCourseIdRef.current;
    if (!id) return;
    
    // Debounce auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const response = await courseBuilderApi.autoSaveDraft(id, data);
        if (!response.error && response.data) {
          setDraft(response.data);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          onAutoSave?.(data);
        }
      } catch {
        // Silently fail auto-save
      }
    }, autoSaveDelay);
  }, [autoSaveDelay, onAutoSave]);
  
  const deleteDraft = useCallback(async () => {
    const id = currentCourseIdRef.current;
    if (!id) return;
    
    setIsSaving(true);
    setError(null);
    try {
      const response = await courseBuilderApi.deleteDraft(id);
      if (response.error) throw new Error(response.error);
      setDraft(null);
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (err) {
      handleError(err, "فشل حذف مسودة الكورس");
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);
  
  // ─── Course Operations ─────────────────────────────────────────────────────
  
  const publishCourse = useCallback(async () => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    setIsSaving(true);
    setError(null);
    try {
      const response = await courseBuilderApi.publishCourse(id);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setDraft(response.data);
        setLastSaved(new Date());
      }
    } catch (err) {
      handleError(err, "فشل نشر الكورس");
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);
  
  const unpublishCourse = useCallback(async () => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    setIsSaving(true);
    setError(null);
    try {
      const response = await courseBuilderApi.unpublishCourse(id);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setDraft(response.data);
        setLastSaved(new Date());
      }
    } catch (err) {
      handleError(err, "فشل إلغاء نشر الكورس");
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);
  
  const archiveCourse = useCallback(async () => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    setIsSaving(true);
    setError(null);
    try {
      const response = await courseBuilderApi.archiveCourse(id);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setDraft(response.data);
        setLastSaved(new Date());
      }
    } catch (err) {
      handleError(err, "فشل أرشفة الكورس");
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);
  
  const unarchiveCourse = useCallback(async () => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    setIsSaving(true);
    setError(null);
    try {
      const response = await courseBuilderApi.unarchiveCourse(id);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setDraft(response.data);
        setLastSaved(new Date());
      }
    } catch (err) {
      handleError(err, "فشل استعادة الكورس من الأرشيف");
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);
  
  // ─── Categories ────────────────────────────────────────────────────────────
  
  const loadCategories = useCallback(async () => {
    try {
      const response = await courseBuilderApi.getCategories();
      if (response.error) throw new Error(response.error);
      setCategories(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل التصنيفات");
    }
  }, [handleError]);
  
  // ─── Levels ────────────────────────────────────────────────────────────────
  
  const loadLevels = useCallback(async () => {
    try {
      const response = await courseBuilderApi.getLevels();
      if (response.error) throw new Error(response.error);
      setLevels(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل المستويات");
    }
  }, [handleError]);
  
  // ─── Languages ─────────────────────────────────────────────────────────────
  
  const loadLanguages = useCallback(async () => {
    try {
      const response = await courseBuilderApi.getLanguages();
      if (response.error) throw new Error(response.error);
      setLanguages(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل اللغات");
    }
  }, [handleError]);
  
  // ─── Teachers ──────────────────────────────────────────────────────────────
  
  const loadTeachers = useCallback(async () => {
    try {
      const response = await courseBuilderApi.getTeachers();
      if (response.error) throw new Error(response.error);
      setTeachers(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل المعلمين");
    }
  }, [handleError]);
  
  const loadCourseTeachers = useCallback(async (id: string) => {
    try {
      const response = await courseBuilderApi.getCourseTeachers(id);
      if (response.error) throw new Error(response.error);
      setCourseTeachers(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل معلمي الكورس");
    }
  }, [handleError]);
  
  const assignTeacher = useCallback(async (instructorId: string, role: string) => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    try {
      const response = await courseBuilderApi.assignTeacher(id, instructorId, role);
      if (response.error) throw new Error(response.error);
      await loadCourseTeachers(id);
    } catch (err) {
      handleError(err, "فشل تعيين المدرس");
    }
  }, [handleError, loadCourseTeachers]);
  
  const removeTeacher = useCallback(async (instructorId: string) => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    try {
      const response = await courseBuilderApi.removeTeacher(id, instructorId);
      if (response.error) throw new Error(response.error);
      await loadCourseTeachers(id);
    } catch (err) {
      handleError(err, "فشل إزالة المدرس");
    }
  }, [handleError, loadCourseTeachers]);
  
  // ─── Chapters ──────────────────────────────────────────────────────────────
  
  const loadChapters = useCallback(async (id: string) => {
    try {
      const response = await courseBuilderApi.getChapters(id);
      if (response.error) throw new Error(response.error);
      setChapters(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل الفصول");
    }
  }, [handleError]);
  
  const createChapter = useCallback(async (data: any) => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    try {
      const response = await courseBuilderApi.createChapter(id, data);
      if (response.error) throw new Error(response.error);
      await loadChapters(id);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل إنشاء الفصل");
      return null;
    }
  }, [handleError, loadChapters]);
  
  const updateChapter = useCallback(async (chapterId: string, data: Partial<Chapter>) => {
    try {
      const response = await courseBuilderApi.updateChapter(chapterId, data);
      if (response.error) throw new Error(response.error);
      const id = currentCourseIdRef.current;
      if (id) await loadChapters(id);
    } catch (err) {
      handleError(err, "فشل تحديث الفصل");
    }
  }, [handleError, loadChapters]);
  
  const deleteChapter = useCallback(async (chapterId: string) => {
    try {
      const response = await courseBuilderApi.deleteChapter(chapterId);
      if (response.error) throw new Error(response.error);
      const id = currentCourseIdRef.current;
      if (id) await loadChapters(id);
    } catch (err) {
      handleError(err, "فشل حذف الفصل");
    }
  }, [handleError, loadChapters]);
  
  const reorderChapters = useCallback(async (chapterIds: string[]) => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    try {
      const response = await courseBuilderApi.reorderChapters(id, chapterIds);
      if (response.error) throw new Error(response.error);
      if (response.data) setChapters(response.data);
    } catch (err) {
      handleError(err, "فشل إعادة ترتيب الفصول");
    }
  }, [handleError]);
  
  // ─── Lessons ───────────────────────────────────────────────────────────────
  
  const loadLessons = useCallback(async (sectionId: string) => {
    try {
      const response = await courseBuilderApi.getLessons(sectionId);
      if (response.error) throw new Error(response.error);
      setLessons(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل الدروس");
    }
  }, [handleError]);
  
  const createLesson = useCallback(async (sectionId: string, data: Partial<Lesson>) => {
    try {
      const response = await courseBuilderApi.createLesson(sectionId, data);
      if (response.error) throw new Error(response.error);
      await loadLessons(sectionId);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل إنشاء الدرس");
      return null;
    }
  }, [handleError, loadLessons]);
  
  const updateLesson = useCallback(async (lessonId: string, data: Partial<Lesson>) => {
    try {
      const response = await courseBuilderApi.updateLesson(lessonId, data);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل تحديث الدرس");
    }
  }, [handleError]);
  
  const deleteLesson = useCallback(async (lessonId: string) => {
    try {
      const response = await courseBuilderApi.deleteLesson(lessonId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل حذف الدرس");
    }
  }, [handleError]);
  
  const duplicateLesson = useCallback(async (lessonId: string) => {
    try {
      const response = await courseBuilderApi.duplicateLesson(lessonId);
      if (response.error) throw new Error(response.error);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل تكرار الدرس");
      return null;
    }
  }, [handleError]);
  
  const reorderLessons = useCallback(async (sectionId: string, lessonIds: string[]) => {
    try {
      const response = await courseBuilderApi.reorderLessons(sectionId, lessonIds);
      if (response.error) throw new Error(response.error);
      if (response.data) setLessons(response.data);
    } catch (err) {
      handleError(err, "فشل إعادة ترتيب الدروس");
    }
  }, [handleError]);
  
  // ─── Videos ────────────────────────────────────────────────────────────────
  
  const uploadVideo = useCallback(async (lessonId: string, file: File, onProgress?: (progress: number) => void) => {
    try {
      const response = await courseBuilderApi.uploadVideo(lessonId, file, onProgress);
      if (response.error) throw new Error(response.error);
      const lesson = lessons.find(item => item.id === lessonId);
      if (lesson?.sectionId) await loadLessons(lesson.sectionId);
      return response.data;
    } catch (err) {
      handleError(err, "فشل رفع الفيديو");
      return null;
    }
  }, [handleError, lessons, loadLessons]);
  
  const deleteVideo = useCallback(async (lessonId: string) => {
    try {
      const response = await courseBuilderApi.deleteVideo(lessonId);
      if (response.error) throw new Error(response.error);
      const lesson = lessons.find(item => item.id === lessonId);
      if (lesson?.sectionId) await loadLessons(lesson.sectionId);
    } catch (err) {
      handleError(err, "فشل حذف الفيديو");
    }
  }, [handleError, lessons, loadLessons]);
  
  const updateVideo = useCallback(async (lessonId: string, data: any) => {
    try {
      const response = await courseBuilderApi.updateVideo(lessonId, data);
      if (response.error) throw new Error(response.error);
      return response.data;
    } catch (err) {
      handleError(err, "فشل تحديث الفيديو");
      return null;
    }
  }, [handleError]);
  
  const getVideo = useCallback(async (lessonId: string) => {
    try {
      const response = await courseBuilderApi.getVideo(lessonId);
      if (response.error) throw new Error(response.error);
      return response.data;
    } catch (err) {
      handleError(err, "فشل تحميل الفيديو");
      return null;
    }
  }, [handleError]);
  
  const getProcessingStatus = useCallback(async (videoId: string) => {
    try {
      const response = await courseBuilderApi.getProcessingStatus(videoId);
      if (response.error) throw new Error(response.error);
      return response.data;
    } catch (err) {
      handleError(err, "فشل تحميل حالة المعالجة");
      return null;
    }
  }, [handleError]);
  
  // ─── Files ─────────────────────────────────────────────────────────────────
  
  const uploadFile = useCallback(async (lessonId: string, file: File) => {
    try {
      const response = await courseBuilderApi.uploadFile(lessonId, file);
      if (response.error) throw new Error(response.error);
      const lesson = lessons.find(item => item.id === lessonId);
      if (lesson?.sectionId) await loadLessons(lesson.sectionId);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل رفع الملف");
      return null;
    }
  }, [handleError, lessons, loadLessons]);
  
  const deleteFile = useCallback(async (attachmentId: string) => {
    try {
      const lesson = lessons.find(item => item.attachments?.some(attachment => attachment.id === attachmentId));
      const response = await courseBuilderApi.deleteFile(attachmentId);
      if (response.error) throw new Error(response.error);
      if (lesson?.sectionId) await loadLessons(lesson.sectionId);
    } catch (err) {
      handleError(err, "فشل حذف الملف");
    }
  }, [handleError, lessons, loadLessons]);
  
  const downloadFile = useCallback(async (attachmentId: string) => {
    try {
      const blob = await courseBuilderApi.downloadFile(attachmentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      handleError(err, "فشل تحميل الملف");
    }
  }, [handleError]);
  
  // ─── Exams ─────────────────────────────────────────────────────────────────
  
  const loadExams = useCallback(async (courseId?: string) => {
    try {
      const response = await courseBuilderApi.getExams(courseId);
      if (response.error) throw new Error(response.error);
      setExams(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل الاختبارات");
    }
  }, [handleError]);
  
  const linkExam = useCallback(async (lessonId: string, examId: string) => {
    try {
      const response = await courseBuilderApi.linkExam(lessonId, examId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل ربط الاختبار");
    }
  }, [handleError]);
  
  const unlinkExam = useCallback(async (lessonId: string) => {
    try {
      const response = await courseBuilderApi.unlinkExam(lessonId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل فك ربط الاختبار");
    }
  }, [handleError]);
  
  // ─── Assignments ───────────────────────────────────────────────────────────
  
  const loadAssignments = useCallback(async (courseId?: string) => {
    try {
      const response = await courseBuilderApi.getAssignments(courseId);
      if (response.error) throw new Error(response.error);
      setAssignments(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل الواجبات");
    }
  }, [handleError]);
  
  const linkAssignment = useCallback(async (lessonId: string, assignmentId: string) => {
    try {
      const response = await courseBuilderApi.linkAssignment(lessonId, assignmentId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل ربط الواجب");
    }
  }, [handleError]);
  
  const unlinkAssignment = useCallback(async (lessonId: string) => {
    try {
      const response = await courseBuilderApi.unlinkAssignment(lessonId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل فك ربط الواجب");
    }
  }, [handleError]);
  
  // ─── Certificates ──────────────────────────────────────────────────────────
  
  const loadCertificateTemplates = useCallback(async () => {
    try {
      const response = await courseBuilderApi.getCertificateTemplates();
      if (response.error) throw new Error(response.error);
      setCertificateTemplates(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل قوالب الشهادات");
    }
  }, [handleError]);
  
  const assignCertificateTemplate = useCallback(async (templateId: string) => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    try {
      const response = await courseBuilderApi.assignCertificateTemplate(id, templateId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل تعيين قالب الشهادة");
    }
  }, [handleError]);
  
  const removeCertificateTemplate = useCallback(async () => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    try {
      const response = await courseBuilderApi.removeCertificateTemplate(id);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل إزالة قالب الشهادة");
    }
  }, [handleError]);
  
  // ─── Pricing ───────────────────────────────────────────────────────────────
  
  const loadPricing = useCallback(async (id: string) => {
    try {
      const response = await courseBuilderApi.getPricing(id);
      if (response.error) throw new Error(response.error);
      setPricing(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل التسعير");
    }
  }, [handleError]);
  
  const updatePricing = useCallback(async (data: Partial<Pricing>[]) => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    try {
      const response = await courseBuilderApi.updatePricing(id, data);
      if (response.error) throw new Error(response.error);
      if (response.data) setPricing(response.data);
    } catch (err) {
      handleError(err, "فشل تحديث التسعير");
    }
  }, [handleError]);
  
  // ─── SEO ───────────────────────────────────────────────────────────────────
  
  const loadSEO = useCallback(async (id: string) => {
    try {
      const response = await courseBuilderApi.getSEO(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    } catch (err) {
      handleError(err, "فشل تحميل إعدادات SEO");
      return null;
    }
  }, [handleError]);
  
  const updateSEO = useCallback(async (data: any) => {
    const id = currentCourseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");
    
    try {
      const response = await courseBuilderApi.updateSEO(id, data);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل تحديث إعدادات SEO");
    }
  }, [handleError]);
  
  // ─── Preview ───────────────────────────────────────────────────────────────
  
  const loadPreview = useCallback(async (id: string) => {
    try {
      const response = await courseBuilderApi.getCoursePreview(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    } catch (err) {
      handleError(err, "فشل تحميل المعاينة");
      return null;
    }
  }, [handleError]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);
  
  return {
    // Draft state
    draft,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    
    // Actions
    loadDraft,
    createDraft,
    updateDraft,
    autoSave,
    deleteDraft,
    publishCourse,
    unpublishCourse,
    archiveCourse,
    unarchiveCourse,
    
    // Categories
    categories,
    loadCategories,
    
    // Levels
    levels,
    loadLevels,
    
    // Languages
    languages,
    loadLanguages,
    
    // Teachers
    teachers,
    courseTeachers,
    loadTeachers,
    loadCourseTeachers,
    assignTeacher,
    removeTeacher,
    
    // Chapters
    chapters,
    loadChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    
    // Lessons
    lessons,
    loadLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    duplicateLesson,
    reorderLessons,
    
    // Videos
    uploadVideo,
    deleteVideo,
    updateVideo,
    getVideo,
    getProcessingStatus,
    
    // Files
    uploadFile,
    deleteFile,
    downloadFile,
    
    // Exams
    exams,
    loadExams,
    linkExam,
    unlinkExam,
    
    // Assignments
    assignments,
    loadAssignments,
    linkAssignment,
    unlinkAssignment,
    
    // Certificates
    certificateTemplates,
    loadCertificateTemplates,
    assignCertificateTemplate,
    removeCertificateTemplate,
    
    // Pricing
    pricing,
    loadPricing,
    updatePricing,
    
    // SEO
    loadSEO,
    updateSEO,
    
    // Preview
    loadPreview,
    
    // Error
    error,
    clearError,
  };
}