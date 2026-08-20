"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { 
  Upload, 
  Video, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Maximize,
  Minimize,
} from "lucide-react";
import { useCourseBuilder } from "../hooks";
import type { Lesson } from "../types";
import { 
  Section, 
  Button, 
  Badge, 
  Progress, 
  Card,
  Skeleton,
  EmptyState,
  Alert,
  Modal,
} from "../ui";

interface VideosStepProps {
  draft: any;
  chapters: any[];
  lessons: Lesson[];
  onChange: (data: Partial<any>) => void;
  isDirty: boolean;
}

export const VideosStep: React.FC<VideosStepProps> = ({ 
  draft, 
  chapters, 
  lessons, 
  onChange, 
  isDirty 
}) => {
  const {
    uploadVideo,
    deleteVideo,
    updateVideo,
    getVideo,
    getProcessingStatus,
    isLoading,
  } = useCourseBuilder({ courseId: draft?.id });
  
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [processingStatus, setProcessingStatus] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Filter lessons that support video (VIDEO type)
  const videoLessons = lessons.filter(l => l.type === "VIDEO");
  
  const handleUpload = useCallback(async (lessonId: string, file: File) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    setIsUploading(true);
    setUploadProgress(prev => ({ ...prev, [lessonId]: 0 }));

    try {
      const result = await uploadVideo(lesson.sectionId, lessonId, file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [lessonId]: progress }));
      });

      if (result) {
        onChange({
          ...draft,
          sections: draft.sections?.map((s: any) => ({
            ...s,
            lessons: s.lessons?.map((l: any) =>
              l.id === lessonId ? { ...l, mediaUrl: result.videoUrl } : l
            )
          }))
        });
      }
    } catch (err) {
      console.error("Video upload failed:", err);
      alert(err instanceof Error ? err.message : "فشل رفع الفيديو. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
      setUploadProgress(prev => ({ ...prev, [lessonId]: 0 }));
    }
  }, [uploadVideo, lessons, draft, onChange]);

  const handleDelete = useCallback(async (lessonId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفيديو؟")) return;
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    try {
      await deleteVideo(lesson.sectionId, lessonId);
      onChange({ ...draft });
    } catch (err) {
      console.error("Video delete failed:", err);
      alert(err instanceof Error ? err.message : "فشل حذف الفيديو.");
    }
  }, [deleteVideo, lessons, draft, onChange]);
  
  const handlePreview = useCallback((videoUrl: string) => {
    setShowPreview(videoUrl);
  }, []);
  
  const handleVisibilityChange = useCallback(async (lessonId: string, visibility: string) => {
    try {
      await updateVideo(lessonId, { visibility });
      onChange({ ...draft });
    } catch (err) {
      console.error("Visibility change failed:", err);
    }
  }, [updateVideo, draft, onChange]);
  
  const checkProcessingStatus = useCallback(async (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson?.mediaUrl) {
      // In a real implementation, you'd get video ID from the media URL
      // For now, we'll skip this
    }
  }, [lessons]);
  
  return (
    <div className="space-y-6">
      <Section title="إدارة الفيديوهات" description="رفع واستبدال وحذف فيديوهات الدروس" icon={<Video className="w-5 h-5" />}>
        {isDirty && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>لديك تغييرات غير محفوظة. سيتم الحفظ تلقائياً بعد التوقف عن الكتابة.</span>
          </Alert>
        )}
        
        {videoLessons.length === 0 ? (
          <EmptyState
            icon={<Video className="w-12 h-12 text-gray-300" />}
            title="لا توجد دروس فيديو"
            description="أضف دروساً من نوع 'فيديو' من خطوة 'الدروس' لتمكين إدارة الفيديوهات"
          />
        ) : (
          <div className="space-y-4">
            {videoLessons.map((lesson, index) => (
              <VideoLessonCard
                key={lesson.id}
                lesson={lesson}
                index={index}
                uploadProgress={uploadProgress[lesson.id] || 0}
                processingStatus={processingStatus[lesson.id]}
                isUploading={isUploading}
                onUpload={handleUpload}
                onDelete={handleDelete}
                onPreview={handlePreview}
                onVisibilityChange={handleVisibilityChange}
              />
            ))}
          </div>
        )}
      </Section>
      
      {/* Video Preview Modal */}
      {showPreview && (
        <Modal 
          isOpen={!!showPreview} 
          onClose={() => setShowPreview(null)}
          title="معاينة الفيديو"
          size="xl"
        >
          <video 
            src={showPreview} 
            controls 
            className="w-full rounded-lg"
            style={{ maxHeight: "70vh" }}
          />
        </Modal>
      )}
    </div>
  );
};

interface VideoLessonCardProps {
  lesson: Lesson;
  index: number;
  uploadProgress: number;
  processingStatus: any;
  isUploading: boolean;
  onUpload: (lessonId: string, file: File) => void;
  onDelete: (lessonId: string) => void;
  onPreview: (url: string) => void;
  onVisibilityChange: (lessonId: string, visibility: string) => void;
}

const VideoLessonCard: React.FC<VideoLessonCardProps> = ({
  lesson,
  index,
  uploadProgress,
  processingStatus,
  isUploading,
  onUpload,
  onDelete,
  onPreview,
  onVisibilityChange,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const hasVideo = !!lesson.mediaUrl;
  const isProcessing = processingStatus?.status === "processing";
  const isCompleted = processingStatus?.status === "completed";
  const hasError = processingStatus?.status === "failed";
  
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
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      onUpload(lesson.id, file);
    }
  }, [lesson.id, onUpload]);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      onUpload(lesson.id, file);
    }
    e.target.value = "";
  }, [lesson.id, onUpload]);
  
  return (
    <Card 
      className={`${dragActive ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20" : ""} transition-all`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="font-medium text-primary-600 dark:text-primary-400">{index + 1}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">{lesson.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                نوع الدرس: <span className="capitalize">{lesson.type.toLowerCase().replace('_', ' ')}</span>
                {lesson.durationSeconds > 0 && (
                  <> · المدة: {Math.floor(lesson.durationSeconds / 60)} دقيقة</>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasVideo && (
              <Badge variant={lesson.isFreePreview ? "success" : "outline"} className="gap-1">
                <CheckCircle className="w-3 h-3" />
                جاهز
              </Badge>
            )}
            {!hasVideo && (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="w-3 h-3" />
                لا يوجد فيديو
              </Badge>
            )}
          </div>
        </div>
        
        {/* Video Player / Upload Zone */}
        <div className="relative">
          {hasVideo && !uploadProgress && (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-900 relative group">
              <video 
                src={lesson.mediaUrl ?? undefined} 
                className="w-full h-full object-cover"
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onPreview(lesson.mediaUrl!)}
                    className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                    aria-label="معاينة الفيديو"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowReplace(true)}
                    className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                    aria-label="استبدال الفيديو"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(lesson.id)}
                    className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors text-red-600"
                    aria-label="حذف الفيديو"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!hasVideo || showReplace || uploadProgress > 0 ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                  : "border-gray-300 dark:border-gray-600 hover:border-primary-500"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id={`video-upload-${lesson.id}`}
              />
              
              {uploadProgress > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <Video className="w-12 h-12 text-primary-500" />
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">جاري رفع الفيديو...</p>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {uploadProgress}% مكتمل
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Video className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {hasVideo ? "اسحب وأفل فيديو جديد أو اضغط للاختيار" : "اسحب وأفل الفيديو هنا أو اضغط للاختيار"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    التنسيقات المدعومة: MP4, WebM, MOV · الحد الأقصى: 2GB
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    icon={<Upload className="w-4 h-4" />}
                  >
                    اختيار ملف
                  </Button>
                </div>
              )}
              
              {showReplace && !uploadProgress && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setShowReplace(false)}
                >
                  إلغاء الاستبدال
                </Button>
              )}
            </div>
          ) : null}
        </div>
        
        {/* Video Settings */}
        {hasVideo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرؤية</label>
              <select
                defaultValue="PRIVATE"
                onChange={e => onVisibilityChange(lesson.id, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="PRIVATE">خاص (للطلاب المسجلين فقط)</option>
                <option value="UNLISTED">غير مدرج (بالرابط المباشر)</option>
                <option value="PUBLIC">عام</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدة</label>
              <div className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 bg-gray-50 dark:bg-gray-900/50">
                {lesson.durationSeconds > 0 
                  ? `${Math.floor(lesson.durationSeconds / 60)}:${(lesson.durationSeconds % 60).toString().padStart(2, '0')}`
                  : "غير محددة"
                }
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">حالة المعالجة</label>
              <Badge 
                variant={
                  isProcessing ? "warning" : 
                  isCompleted ? "success" : 
                  hasError ? "destructive" : "secondary"
                }
                className="w-full justify-center gap-1"
              >
                {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                {isProcessing && "قيد المعالجة"}
                {isCompleted && <CheckCircle className="w-3 h-3" />}
                {isCompleted && "جاهز"}
                {hasError && <AlertCircle className="w-3 h-3" />}
                {hasError && "فشل"}
                {!isProcessing && !isCompleted && !hasError && <Clock className="w-3 h-3" />}
                {!isProcessing && !isCompleted && !hasError && "في الانتظار"}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};