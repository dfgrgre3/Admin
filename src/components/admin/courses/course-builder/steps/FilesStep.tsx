"use client";

import React, { useState, useCallback, useRef } from "react";
import { 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileSpreadsheet,
  FileCode,
  FileType,
  Loader2,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { useCourseBuilder } from "../hooks";
import type { Lesson, Attachment } from "../types";
import { 
  Section, 
  Button, 
  Badge, 
  Card,
  EmptyState,
  Alert,
  Tooltip,
} from "../ui";

interface FilesStepProps {
  draft: any;
  lessons: Lesson[];
  onChange: (data: Partial<any>) => void;
  isDirty: boolean;
  selectedChapterId?: string;
  onRefreshLessons?: (chapterId: string) => Promise<void> | void;
}

export const FilesStep: React.FC<FilesStepProps> = ({
  draft,
  lessons,
  onChange,
  isDirty,
  selectedChapterId,
  onRefreshLessons,
}) => {
  const {
    uploadFile,
    deleteFile,
    isLoading,
    error,
    clearError,
  } = useCourseBuilder({ courseId: draft?.id });

  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});

  // Filter lessons that have attachments
  const lessonsWithAttachments = lessons.filter(l => l.attachments && l.attachments.length > 0);
  const allLessons = lessons.filter(l => l.type !== "VIDEO" || true); // All lessons can have attachments

  const refreshLessons = useCallback(async () => {
    if (selectedChapterId && onRefreshLessons) {
      await onRefreshLessons(selectedChapterId);
    }
  }, [selectedChapterId, onRefreshLessons]);

  const handleUpload = useCallback(async (lessonId: string, file: File) => {
    if (!draft?.id || !selectedChapterId) return;
    setUploadingLessonId(lessonId);
    try {
      const attachment = await uploadFile(draft.id, selectedChapterId, lessonId, file);
      if (!attachment) throw new Error("Upload failed");
      await refreshLessons();
    } catch (err) {
      console.error("File upload failed:", err);
      alert(err instanceof Error ? err.message : "فشل رفع الملف. يرجى المحاولة مرة أخرى.");
    } finally {
      setUploadingLessonId(null);
    }
  }, [uploadFile, refreshLessons, draft?.id, selectedChapterId]);

  const handleDelete = useCallback(async (lessonId: string, attachmentId: string) => {
    if (!draft?.id || !selectedChapterId) return;
    if (!confirm("هل أنت متأكد من حذف هذا الملف؟")) return;

    try {
      await deleteFile(draft.id, selectedChapterId, lessonId, attachmentId);
      await refreshLessons();
    } catch (err) {
      console.error("File delete failed:", err);
      alert("فشل حذف الملف.");
    }
  }, [deleteFile, refreshLessons, draft?.id, selectedChapterId]);

  const handleDownload = useCallback((fileUrl: string) => {
    if (typeof window === "undefined" || !fileUrl) return;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }, []);
  
  const getFileIcon = (fileType?: string | null) => {
    if (!fileType) return <FileText className="w-5 h-5" />;
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return <FileType className="w-5 h-5 text-red-500" />;
    if (type.includes("image")) return <FileImage className="w-5 h-5 text-green-500" />;
    if (type.includes("video")) return <FileVideo className="w-5 h-5 text-purple-500" />;
    if (type.includes("audio")) return <FileAudio className="w-5 h-5 text-orange-500" />;
    if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (type.includes("code") || type.includes("javascript") || type.includes("python")) return <FileCode className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5" />;
  };
  
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "غير معروف";
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent, lessonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleUpload(lessonId, file));
  }, [handleUpload]);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => handleUpload(lessonId, file));
    e.target.value = "";
  }, [handleUpload]);
  
  return (
    <div className="space-y-6">
      <Section title="الملفات والمرفقات" description="رفع وتحميل وحذف الملفات المرفقة بالدروس" icon={<Paperclip className="w-5 h-5" />}>
        {error && (
          <Alert variant="destructive" onClose={clearError} className="mb-4">
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
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اختر الدرس</label>
          <select
            value={selectedLessonId}
            onChange={e => setSelectedLessonId(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">-- اختر درساً لإدارة مرفقاته --</option>
            {allLessons.map(lesson => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title} ({lessonTypeLabels[lesson.type] || lesson.type})
              </option>
            ))}
          </select>
        </div>
        
        {selectedLessonId ? (
          <FileLessonCard
            lesson={allLessons.find(l => l.id === selectedLessonId)!}
            uploading={uploadingLessonId === selectedLessonId}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onDrag={handleDrag}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            getFileIcon={getFileIcon}
            formatFileSize={formatFileSize}
            fileInputRefs={fileInputRefs}
          />
        ) : (
          <EmptyState
            icon={<Paperclip className="w-12 h-12 text-gray-300" />}
            title="اختر درساً للبدء"
            description="حدد درساً من القائمة أعلاه لإدارة ملفاته المرفقة"
          />
        )}
      </Section>
    </div>
  );
};

const lessonTypeLabels: Record<string, string> = {
  VIDEO: "فيديو",
  TEXT: "نص/مقال",
  AUDIO: "صوت",
  FILE: "ملف",
  EXTERNAL_LINK: "رابط خارجي",
  INTERACTIVE_QUIZ: "اختبار تفاعلي",
};

interface FileLessonCardProps {
  lesson: Lesson;
  uploading: boolean;
  onUpload: (lessonId: string, file: File) => void;
  onDelete: (lessonId: string, attachmentId: string) => void;
  onDownload: (fileUrl: string) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, lessonId: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => void;
  getFileIcon: (fileType?: string | null) => React.ReactNode;
  formatFileSize: (bytes?: number | null) => string;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement>>;
}

const FileLessonCard: React.FC<FileLessonCardProps> = ({
  lesson,
  uploading,
  onUpload,
  onDelete,
  onDownload,
  onDrag,
  onDrop,
  onFileSelect,
  getFileIcon,
  formatFileSize,
  fileInputRefs,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [expandedAttachments, setExpandedAttachments] = useState<Set<string>>(new Set());
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    onDrop(e, lesson.id);
  }, [lesson.id, onDrop]);
  
  const toggleExpand = (attachmentId: string) => {
    setExpandedAttachments(prev => {
      const next = new Set(prev);
      if (next.has(attachmentId)) {
        next.delete(attachmentId);
      } else {
        next.add(attachmentId);
      }
      return next;
    });
  };
  
  return (
    <Card className={`${dragActive ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20" : ""} transition-all`}>
      <div className="p-4 space-y-4">
        {/* Lesson Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lessonTypeLabels[lesson.type] || lesson.type} · 
                {lesson.attachments?.length || 0} ملف{lesson.attachments?.length !== 1 ? "ات" : ""}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {lesson.attachments?.length && (
              <Badge variant="outline">
                {lesson.attachments.length} ملف{lesson.attachments.length !== 1 ? "ات" : ""}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
              : "border-gray-300 dark:border-gray-600 hover:border-primary-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={el => { if (el) fileInputRefs.current[lesson.id] = el; }}
            type="file"
            multiple
            onChange={e => onFileSelect(e, lesson.id)}
            className="hidden"
            id={`file-upload-${lesson.id}`}
          />
          
          {uploading ? (
            <div className="flex items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">جاري رفع الملفات...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">يرجى الانتظار</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Paperclip className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400">
                اسحب وأفل الملفات هنا أو اضغط للاختيار
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                جميع أنواع الملفات مدعومة · يمكنك رفع عدة ملفات في آن واحد
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRefs.current[lesson.id]?.click()}
                disabled={uploading}
                icon={<Upload className="w-4 h-4" />}
              >
                اختيار ملفات
              </Button>
            </div>
          )}
        </div>
        
        {/* Attachments List */}
        {lesson.attachments && lesson.attachments.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">المرفقات ({lesson.attachments.length})</h5>
            <ul className="space-y-2" role="list">
              {lesson.attachments.map(attachment => (
                <li key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-gray-200 dark:bg-gray-800">
                    {getFileIcon(attachment.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{attachment.title}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                       <span>{formatFileSize(attachment.fileSize)}</span>
                       {attachment.fileType && <><span className="text-gray-400">·</span><span>{attachment.fileType}</span></>}
                       <span className="text-gray-400">·</span>
                       <span>{new Date(attachment.createdAt).toLocaleDateString('ar-SA')}</span>
                     </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip content="تحميل">
                      <button
                        onClick={() => onDownload(attachment.fileUrl)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        aria-label="تحميل الملف"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    <Tooltip content="حذف">
                      <button
                        onClick={() => onDelete(lesson.id, attachment.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        aria-label="حذف الملف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};