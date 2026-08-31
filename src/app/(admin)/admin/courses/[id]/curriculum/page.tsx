"use client";

import { adminFetch } from "@/lib/api/admin-api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Edit,
  FileText,
  GripVertical,
  Layers,
  Paperclip,
  Plus,
  PlusCircle,
  Save,
  Trash2,
  Video,
  X,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AdminUpload } from "@/components/admin/ui/admin-upload";
import { COURSE_PUBLIC_CACHE_PATHS } from "@/lib/public-cache/admin-cache-paths";
import { requestPublicCacheRevalidation } from "@/lib/public-cache/revalidate-public";
import { apiRoutes } from "@/lib/api/routes";

type LessonAttachment = {
  id: string;
  title: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
};

type LessonType = "VIDEO" | "ARTICLE" | "QUIZ" | "FILE" | "ASSIGNMENT";

type InteractiveQuestion = {
  id: string;
  lessonId: string;
  timePosition: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string | null;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | 'link' | null;
  linkUrl?: string | null;
  groupId?: string | null;
  groupOrder?: number;
  isActive: boolean;
};

type Lesson = {
  id: string;
  name: string;
  order: number;
  type: LessonType;
  videoUrl?: string | null;
  duration?: number;
  durationMinutes?: number;
  isFree?: boolean;
  description?: string | null;
  attachments?: LessonAttachment[];
  examId?: string | null;
  interactiveQuestions?: InteractiveQuestion[];
};

type Chapter = {
  id: string;
  name: string;
  order: number;
  subTopics: Lesson[];
};

type CourseSummary = {
  id: string;
  name: string;
  nameAr?: string | null;
};

function normalizeLesson(lesson: any, index: number): Lesson {
  const duration = Number(lesson.duration ?? lesson.durationMinutes) || 0;

  return {
    id: lesson.id,
    name: lesson.name || lesson.title || "درس جديد",
    order: Number(lesson.order ?? index),
    type: (lesson.type || "VIDEO") as LessonType,
    videoUrl: lesson.videoUrl || "",
    duration,
    durationMinutes: duration,
    isFree: Boolean(lesson.isFree),
    description: lesson.description || "",
    attachments: lesson.attachments || [],
    examId: lesson.examId || null,
    interactiveQuestions: lesson.interactiveQuestions || [],
  };
}

function normalizeChapter(chapter: any, index: number): Chapter {
  return {
    id: chapter.id,
    name: chapter.name || chapter.title || `الفصل ${index + 1}`,
    order: Number(chapter.order ?? index),
    subTopics: (chapter.subTopics || chapter.lessons || []).map(normalizeLesson),
  };
}

function serializeCurriculum(chapters: Chapter[]) {
  return chapters.map((chapter, chapterIndex) => ({
    id: chapter.id,
    name: chapter.name,
    title: chapter.name,
    order: chapterIndex,
    subTopics: chapter.subTopics.map((lesson, lessonIndex) => {
      const durationMinutes = Number(lesson.duration ?? lesson.durationMinutes) || 0;

      return {
        id: lesson.id,
        name: lesson.name,
        title: lesson.name,
        order: lessonIndex,
        type: lesson.type,
        videoUrl: lesson.videoUrl || "",
        duration: durationMinutes,
        durationMinutes,
        isFree: Boolean(lesson.isFree),
        description: lesson.description || "",
        attachments: lesson.attachments || [],
        examId: lesson.examId || null,
      };
    }),
  }));
}

function calculateCurriculumStats(chapters: Chapter[]) {
  const lessonsCount = chapters.reduce((sum, chapter) => sum + chapter.subTopics.length, 0);
  const totalDurationMinutes = chapters.reduce(
    (sum, chapter) => sum + chapter.subTopics.reduce((lessonSum, lesson) => lessonSum + (lesson.duration || lesson.durationMinutes || 0), 0),
    0
  );

  return {
    chaptersCount: chapters.length,
    lessonsCount,
    totalDurationMinutes,
    totalDurationHours: Math.ceil(totalDurationMinutes / 60),
  };
}

// Helper functions to reduce function nesting levels in state updates
const reorderLessonsInChapters = (
  chapters: Chapter[],
  chapterId: string,
  activeId: string,
  overId: string
): Chapter[] => {
  return chapters.map((chapter) => {
    if (chapter.id !== chapterId) return chapter;
    const oldIndex = chapter.subTopics.findIndex((item) => item.id === activeId);
    const newIndex = chapter.subTopics.findIndex((item) => item.id === overId);
    return { ...chapter, subTopics: arrayMove(chapter.subTopics, oldIndex, newIndex) };
  });
};

const updateLessonInChapters = (
  chapters: Chapter[],
  chapterId: string,
  updatedLesson: Lesson
): Chapter[] => {
  return chapters.map((chapter) => {
    if (chapter.id !== chapterId) return chapter;
    return {
      ...chapter,
      subTopics: chapter.subTopics.map((lesson) =>
        lesson.id === updatedLesson.id ? updatedLesson : lesson
      ),
    };
  });
};

const removeLessonFromChapters = (
  chapters: Chapter[],
  chapterId: string,
  lessonId: string
): Chapter[] => {
  return chapters.map((chapter) =>
    chapter.id === chapterId
      ? { ...chapter, subTopics: chapter.subTopics.filter((lesson) => lesson.id !== lessonId) }
      : chapter
  );
};

const addLessonToChapters = (chapters: Chapter[], chapterId: string): Chapter[] => {
  return chapters.map((chapter) => {
    if (chapter.id !== chapterId) return chapter;
    return {
      ...chapter,
      subTopics: [
        ...chapter.subTopics,
        {
          id: `new-lesson-${Date.now()}`,
          name: "درس جديد",
          order: chapter.subTopics.length,
          type: "VIDEO",
          videoUrl: "",
          duration: 0,
          durationMinutes: 0,
          isFree: false,
          description: "",
          attachments: [],
          examId: null,
        },
      ],
    };
  });
};

function InteractiveQuestionCard({
  question,
  index,
  onUpdate,
  onDelete,
}: {
  question: InteractiveQuestion;
  index: number;
  onUpdate: (updates: Partial<InteractiveQuestion>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);

  const handleSave = () => {
    onUpdate(editedQuestion);
    setIsEditing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase">وقت الظهور (ثانية)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={editedQuestion.timePosition}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, timePosition: Number(e.target.value) })}
                  className="h-10 rounded-lg text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 rounded-lg text-xs font-bold"
                  onClick={() => {
                    // Try to find video in multiple ways
                    let video = document.querySelector('video') as HTMLVideoElement;
                    if (!video) {
                      // Try to find video in iframes or other containers
                      const videos = document.getElementsByTagName('video');
                      if (videos.length > 0) {
                        video = videos[0] as HTMLVideoElement;
                      }
                    }

                    // Debug logging
                    console.log('Video detection:', {
                      found: !!video,
                      readyState: video?.readyState,
                      currentTime: video?.currentTime,
                      src: video?.src,
                      videoElements: document.getElementsByTagName('video').length
                    });

                    if (video) {
                      // Check if video is loaded or just get current time anyway
                      if (video.readyState >= 2) {
                        setEditedQuestion({ ...editedQuestion, timePosition: Math.floor(video.currentTime) });
                        toast.success(`تم تعيين الوقت: ${Math.floor(video.currentTime)} ثانية`);
                      } else {
                        // Video exists but not loaded yet, try to get time anyway
                        const time = video.currentTime;
                        if (time > 0 || video.src) {
                          setEditedQuestion({ ...editedQuestion, timePosition: Math.floor(time) });
                          toast.success(`تم تعيين الوقت: ${Math.floor(time)} ثانية`);
                        } else {
                          toast.error("الفيديو موجود لكن لم يتم تحميله بعد. يرجى تشغيل الفيديو أولاً أو إدخال الوقت يدوياً.");
                        }
                      }
                    } else {
                      // Check if there's an iframe with video (YouTube, Vimeo, etc.)
                      const iframes = document.getElementsByTagName('iframe');
                      if (iframes.length > 0) {
                        toast.error(`تم العثور على ${iframes.length} iframe. هذه الميزة تعمل مع فيديوهات HTML5 فقط. يرجى إدخال الوقت يدوياً.`);
                      } else {
                        toast.error("لم يتم العثور على فيديو في الصفحة. يرجى إدخال الوقت يدوياً.");
                      }
                    }
                  }}
                >
                  <Video className="h-4 w-4 ml-1" />
                  من الفيديو
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase">الإجابة الصحيحة</Label>
              <Select
                value={editedQuestion.correctOptionIndex.toString()}
                onValueChange={(value) => setEditedQuestion({ ...editedQuestion, correctOptionIndex: Number(value) })}
              >
                <SelectTrigger className="h-10 rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {editedQuestion.options.map((_, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      الخيار {idx + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase">السؤال</Label>
            <Input
              value={editedQuestion.question}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
              className="h-10 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-2">
            {editedQuestion.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-black">{idx + 1}</Badge>
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...editedQuestion.options];
                    newOptions[idx] = e.target.value;
                    setEditedQuestion({ ...editedQuestion, options: newOptions });
                  }}
                  className="h-10 rounded-lg text-sm flex-1"
                  placeholder={`الخيار ${idx + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase">الشرح (اختياري)</Label>
            <Input
              value={editedQuestion.explanation || ""}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
              className="h-10 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase">نوع الوسائط (اختياري)</Label>
            <Select
              value={editedQuestion.mediaType || "none"}
              onValueChange={(value) => setEditedQuestion({ ...editedQuestion, mediaType: value === "none" ? null : value as any })}
            >
              <SelectTrigger className="h-10 rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون وسائط</SelectItem>
                <SelectItem value="image">صورة</SelectItem>
                <SelectItem value="video">فيديو</SelectItem>
                <SelectItem value="link">رابط خارجي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editedQuestion.mediaType === "image" && (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase">صورة السؤال</Label>
              <Input
                value={editedQuestion.mediaUrl || ""}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, mediaUrl: e.target.value })}
                className="h-10 rounded-lg text-sm"
                placeholder="https://..."
              />
              <AdminUpload
                accept="image/*"
                label="رفع صورة من الجهاز"
                onUploadComplete={(url) => setEditedQuestion({ ...editedQuestion, mediaUrl: url })}
              />
            </div>
          )}

          {editedQuestion.mediaType === "video" && (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase">فيديو السؤال</Label>
              <Input
                value={editedQuestion.mediaUrl || ""}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, mediaUrl: e.target.value })}
                className="h-10 rounded-lg text-sm"
                placeholder="https://..."
              />
              <AdminUpload
                accept="video/*"
                label="رفع فيديو من الجهاز"
                onUploadComplete={(url) => setEditedQuestion({ ...editedQuestion, mediaUrl: url })}
              />
            </div>
          )}

          {editedQuestion.mediaType === "link" && (
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase">رابط خارجي</Label>
              <Input
                value={editedQuestion.linkUrl || ""}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, linkUrl: e.target.value })}
                className="h-10 rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="flex-1 rounded-lg text-xs font-bold">
              حفظ
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="rounded-lg text-xs font-bold">
              إلغاء
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-primary/10 text-primary text-[10px] font-black">
                  {formatTime(question.timePosition)}
                </Badge>
                <Badge variant={question.isActive ? "default" : "secondary"} className="text-[10px] font-black">
                  {question.isActive ? "نشط" : "معطل"}
                </Badge>
              </div>
              <p className="text-sm font-bold">{question.question}</p>
              {question.mediaType && (
                <Badge variant="outline" className="text-[9px] font-black mt-1 flex items-center gap-1">
                  {question.mediaType === 'image' && <ImageIcon className="h-3 w-3" />}
                  {question.mediaType === 'video' && <Video className="h-3 w-3" />}
                  {question.mediaType === 'link' && <LinkIcon className="h-3 w-3" />}
                  {question.mediaType === 'image' ? 'صورة' : question.mediaType === 'video' ? 'فيديو' : 'رابط'}
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="space-y-1 mr-2 border-r-2 border-zinc-100 pr-3 dark:border-zinc-800">
            {question.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <Badge variant={idx === question.correctOptionIndex ? "default" : "outline"} className="text-[9px] font-black">
                  {idx === question.correctOptionIndex ? "✓" : idx + 1}
                </Badge>
                <span className={cn("font-medium", idx === question.correctOptionIndex ? "text-primary" : "text-zinc-600")}>
                  {option}
                </span>
              </div>
            ))}
          </div>
          {question.explanation && (
            <p className="text-[11px] text-zinc-500 italic mt-2">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

function NewQuestionForm({ onSubmit }: { onSubmit: (question: Omit<InteractiveQuestion, "id" | "lessonId">) => void }) {
  const [timePosition, setTimePosition] = useState(0);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'link' | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const handleSubmit = () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) {
      toast.error("يرجى إدخال السؤال وخيارين على الأقل");
      return;
    }

    onSubmit({
      timePosition,
      question,
      options: options.filter(o => o.trim()),
      correctOptionIndex,
      explanation: explanation || null,
      mediaType,
      mediaUrl: mediaUrl || null,
      linkUrl: linkUrl || null,
      isActive: true,
    });

    setTimePosition(0);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIndex(0);
    setExplanation("");
    setMediaType(null);
    setMediaUrl("");
    setLinkUrl("");
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase">وقت الظهور (ثانية)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={timePosition}
              onChange={(e) => setTimePosition(Number(e.target.value))}
              className="h-10 rounded-lg text-sm flex-1"
              placeholder="مثال: 30"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 px-3 rounded-lg text-xs font-bold"
              onClick={() => {
                // Try to find video in multiple ways
                let video = document.querySelector('video') as HTMLVideoElement;
                if (!video) {
                  // Try to find video in iframes or other containers
                  const videos = document.getElementsByTagName('video');
                  if (videos.length > 0) {
                    video = videos[0] as HTMLVideoElement;
                  }
                }
                if (video) {
                  // Check if video is loaded or just get current time anyway
                  if (video.readyState >= 2) {
                    setTimePosition(Math.floor(video.currentTime));
                    toast.success(`تم تعيين الوقت: ${Math.floor(video.currentTime)} ثانية`);
                  } else {
                    // Video exists but not loaded yet, try to get time anyway
                    const time = video.currentTime;
                    if (time > 0 || video.src) {
                      setTimePosition(Math.floor(time));
                      toast.success(`تم تعيين الوقت: ${Math.floor(time)} ثانية`);
                    } else {
                      toast.error("الفيديو موجود لكن لم يتم تحميله بعد. يرجى تشغيل الفيديو أولاً أو إدخال الوقت يدوياً.");
                    }
                  }
                } else {
                  toast.error("لم يتم العثور على فيديو في الصفحة. يرجى إدخال الوقت يدوياً.");
                }
              }}
            >
              <Video className="h-4 w-4 ml-1" />
              من الفيديو
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase">الإجابة الصحيحة</Label>
          <Select
            value={correctOptionIndex.toString()}
            onValueChange={(value) => setCorrectOptionIndex(Number(value))}
          >
            <SelectTrigger className="h-10 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((_, idx) => (
                <SelectItem key={idx} value={idx.toString()} disabled={!options[idx]?.trim()}>
                  الخيار {idx + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] font-black uppercase">السؤال</Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="h-10 rounded-lg text-sm"
          placeholder="اكتب السؤال هنا..."
        />
      </div>
      <div className="space-y-2">
        {options.map((option, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Badge variant={idx === correctOptionIndex ? "default" : "outline"} className="text-[10px] font-black">
              {idx + 1}
            </Badge>
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[idx] = e.target.value;
                setOptions(newOptions);
              }}
              className="h-10 rounded-lg text-sm flex-1"
              placeholder={`الخيار ${idx + 1}`}
            />
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] font-black uppercase">الشرح (اختياري)</Label>
        <Input
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="h-10 rounded-lg text-sm"
          placeholder="شرح الإجابة الصحيحة..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase">نوع الوسائط (اختياري)</Label>
        <Select
          value={mediaType || "none"}
          onValueChange={(value) => setMediaType(value === "none" ? null : value as any)}
        >
          <SelectTrigger className="h-10 rounded-lg text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون وسائط</SelectItem>
            <SelectItem value="image">صورة</SelectItem>
            <SelectItem value="video">فيديو</SelectItem>
            <SelectItem value="link">رابط خارجي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mediaType === "image" && (
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase">صورة السؤال</Label>
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="h-10 rounded-lg text-sm"
            placeholder="https://..."
          />
          <AdminUpload
            accept="image/*"
            label="رفع صورة من الجهاز"
            onUploadComplete={(url) => setMediaUrl(url)}
          />
        </div>
      )}

      {mediaType === "video" && (
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase">فيديو السؤال</Label>
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="h-10 rounded-lg text-sm"
            placeholder="https://..."
          />
          <AdminUpload
            accept="video/*"
            label="رفع فيديو من الجهاز"
            onUploadComplete={(url) => setMediaUrl(url)}
          />
        </div>
      )}

      {mediaType === "link" && (
        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase">رابط خارجي</Label>
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="h-10 rounded-lg text-sm"
            placeholder="https://..."
          />
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full h-10 rounded-lg text-xs font-bold uppercase">
        <Plus className="ml-2 h-4 w-4" />
        إضافة السؤال
      </Button>
    </div>
  );
}

function SortableLesson({
  lesson,
  onDelete,
  onEdit,
  onManageQuestions,
}: {
  lesson: Lesson;
  onDelete: (id: string) => void;
  onEdit: (lesson: Lesson) => void;
  onManageQuestions?: (lesson: Lesson) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-zinc-400 transition-colors hover:text-primary">
        <GripVertical className="h-4 w-4" />
      </div>
      {lesson.type === "VIDEO" ? (
        <Video className="h-4 w-4 text-blue-500" />
      ) : (
        <FileText className="h-4 w-4 text-emerald-500" />
      )}
      <div className="flex-1">
        <div className="text-sm font-bold">{lesson.name}</div>
        <div className="text-[10px] font-medium text-zinc-500">
          {lesson.duration || lesson.durationMinutes || 0} دقيقة
        </div>
      </div>
      {lesson.isFree && (
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[9px] text-emerald-500">مجاني</Badge>
      )}
      {lesson.type === "VIDEO" && lesson.interactiveQuestions && lesson.interactiveQuestions.length > 0 && (
        <Badge className="border-blue-500/20 bg-blue-500/10 text-[9px] text-blue-500">
          {lesson.interactiveQuestions.length} أسئلة
        </Badge>
      )}
      <div className="flex items-center gap-1">
        {lesson.type === "VIDEO" && onManageQuestions && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-500" onClick={() => onManageQuestions(lesson)} title="إدارة الأسئلة التفاعلية">
            <FileText className="h-3.5 w-3.5" />
          </Button>
        )}
        {lesson.type === "VIDEO" && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => onEdit(lesson)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(lesson.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SortableChapter({
  chapter,
  onDeleteChapter,
  onAddLesson,
  onDeleteLesson,
  onReorderLessons,
  onEditChapter,
  onEditLesson,
  onManageQuestions,
}: {
  chapter: Chapter;
  onDeleteChapter: (id: string) => void;
  onAddLesson: (chapterId: string) => void;
  onDeleteLesson: (chapterId: string, lessonId: string) => void;
  onReorderLessons: (chapterId: string, event: DragEndEvent) => void;
  onEditChapter: (chapter: Chapter) => void;
  onEditLesson: (lesson: Lesson, chapterId: string) => void;
  onManageQuestions?: (lesson: Lesson) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      <Card className={cn("transition-all dark:border-zinc-800", expanded ? "bg-zinc-50/50 dark:bg-zinc-900/50" : "")}>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex flex-1 items-center gap-3">
            <div {...attributes} {...listeners} className="cursor-grab p-2 text-zinc-400 hover:text-primary">
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex flex-1 cursor-pointer items-center gap-3" onClick={() => setExpanded((value) => !value)}>
              {expanded ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
              <div>
                <h3 className="text-sm font-black tracking-widest">{chapter.name}</h3>
                <p className="text-[10px] font-bold text-zinc-500">{chapter.subTopics.length} دروس</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditChapter(chapter)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg text-[10px] font-black" onClick={() => onAddLesson(chapter.id)}>
              <PlusCircle className="h-3.5 w-3.5" />
              إضافة درس
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDeleteChapter(chapter.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {expanded && (
        <div className="mr-6 space-y-3 border-r-2 border-zinc-100 pb-6 pr-12 pl-4 dark:border-zinc-800">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => onReorderLessons(chapter.id, event)}>
            <SortableContext items={chapter.subTopics.map((lesson) => lesson.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {chapter.subTopics.map((lesson) => (
                  <SortableLesson
                    key={lesson.id}
                    lesson={lesson}
                    onDelete={(lessonId) => onDeleteLesson(chapter.id, lessonId)}
                    onEdit={(currentLesson) => onEditLesson(currentLesson, chapter.id)}
                    onManageQuestions={onManageQuestions}
                  />
                ))}
                {chapter.subTopics.length === 0 && (
                  <div className="rounded-2xl border-2 border-dashed border-zinc-100 p-8 text-center dark:border-zinc-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">لا توجد دروس داخل هذا الفصل بعد</p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

export default function CourseCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingChapter, setEditingChapter] = useState<{ id: string; name: string } | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson; chapterId: string } | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [interactiveQuestionsDialog, setInteractiveQuestionsDialog] = useState<{ lessonId: string; lessonName: string } | null>(null);
  const [interactiveQuestions, setInteractiveQuestions] = useState<InteractiveQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChaptersCount, setAiChaptersCount] = useState("5");
  const [aiLevel, setAiLevel] = useState("INTERMEDIATE");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPreviewChapters, setAiPreviewChapters] = useState<any[] | null>(null);

  const parseAiResponse = (reply: string): any[] => {
    let cleanText = reply.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();
    try {
      const data = JSON.parse(cleanText);
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.error("Failed to parse JSON directly", e);
    }
    const arrayMatch = cleanText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      try {
        const data = JSON.parse(arrayMatch[0]);
        if (Array.isArray(data)) {
          return data;
        }
      } catch (e) {
        console.error("Failed to parse matched JSON array", e);
      }
    }
    throw new Error("لم نتمكن من تحليل رد الذكاء الاصطناعي كـ JSON صالح");
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("يرجى إدخال موضوع أو هدف الدورة التدريبية");
      return;
    }
    setIsAiGenerating(true);
    try {
      const prompt = `أنت خبير تعليمي ومنهجي. قم بإنشاء هيكل منهج دراسي باللغة العربية لدورة تعليمية بعنوان "${course?.nameAr || course?.name || ""}" وموضوعها/أهدافها: "${aiPrompt}".
المستوى المطلوب: ${aiLevel === "BEGINNER" ? "مبتدئ" : aiLevel === "ADVANCED" ? "متقدم" : "متوسط"}
عدد الفصول المطلوبة: ${aiChaptersCount}

يجب أن تقوم بإرجاع النتيجة كـ JSON حصرياً وبدون أي كلام جانبي قبله أو بعده، وبدون أي نص آخر، بصيغة مصفوفة من الفصول (Chapters) وكل فصل يحتوي على مصفوفة من الدروس (lessons).
كل فصل (Chapter) يحتوي على الحقول التالية:
- name: اسم الفصل باللغة العربية
- lessons: مصفوفة من الدروس

كل درس (lesson) يحتوي على الحقول التالية:
- name: اسم الدرس باللغة العربية
- type: نوع الدرس، ويجب أن يكون أحد القيم التالية حصرياً: "VIDEO" أو "ARTICLE" أو "QUIZ" أو "FILE" أو "ASSIGNMENT"
- duration: مدة الدرس بالدقائق كقيمة رقمية (مثلاً 15 أو 30)
- description: وصف مختصر جداً للدرس

صيغة الـ JSON المطلوبة للرد هي:
[
  {
    "name": "اسم الفصل الأول",
    "lessons": [
      {
        "name": "اسم الدرس الأول",
        "type": "VIDEO",
        "duration": 20,
        "description": "وصف الدرس"
      }
    ]
  }
]`;

      const response = await fetch(apiRoutes.ai.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const result = await response.json();
      if (!result.reply) {
        throw new Error("لم نحصل على إجابة من الذكاء الاصطناعي");
      }
      
      const parsed = parseAiResponse(result.reply);
      setAiPreviewChapters(parsed);
      toast.success("تم توليد مقترح المنهج الدراسي بنجاح! يرجى مراجعته واعتماده.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyAiCurriculum = () => {
    if (!aiPreviewChapters) return;
    
    const formattedChapters: Chapter[] = aiPreviewChapters.map((ch, chIdx) => {
      const chapterId = `new-ch-${Date.now()}-${chIdx}`;
      const subTopics: Lesson[] = (ch.lessons || ch.subTopics || []).map((l: any, lIdx: number) => ({
        id: `new-l-${Date.now()}-${chIdx}-${lIdx}`,
        name: l.name || "درس جديد",
        order: lIdx,
        type: (l.type || "VIDEO") as LessonType,
        videoUrl: "",
        duration: Number(l.duration ?? l.durationMinutes) || 10,
        durationMinutes: Number(l.duration ?? l.durationMinutes) || 10,
        isFree: false,
        description: l.description || "",
        attachments: [],
        examId: null,
      }));

      return {
        id: chapterId,
        name: ch.name || `الفصل ${chIdx + 1}`,
        order: chIdx,
        subTopics,
      };
    });

    setChapters(formattedChapters);
    setAiPreviewChapters(null);
    setAiDialogOpen(false);
    toast.success("تم تطبيق المنهج بنجاح! لا تنسى الضغط على 'حفظ التغييرات'.");
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await adminFetch(`${apiRoutes.admin.exams}?subjectId=${courseId}`);
        const result = await response.json();
        if (response.ok) {
          setExams(result.data?.exams || result.exams || result.items || []);
        }
      } catch (error) {
        console.error("Failed to load exams:", error);
      }
    };
    fetchExams();
  }, [courseId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const curriculumStats = calculateCurriculumStats(chapters);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const response = await adminFetch(apiRoutes.admin.courseCurriculum(courseId));
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || "فشل تحميل المنهج");
        }

        setCourse(result.data?.course || null);
        setChapters((result.data?.curriculum || result.data?.topics || []).map(normalizeChapter));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "فشل تحميل المنهج");
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [courseId]);

  const handleDragEndChapter = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChapters((current) => {
        const oldIndex = current.findIndex((item) => item.id === active.id);
        const newIndex = current.findIndex((item) => item.id === over.id);
        return arrayMove(current, oldIndex, newIndex);
      });
    }
  };

  const handleReorderLessons = (chapterId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChapters((current) => reorderLessonsInChapters(current, chapterId, active.id as string, over.id as string));
    }
  };

  const addChapter = () => {
    setChapters((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        name: "فصل دراسي جديد",
        order: current.length,
        subTopics: [],
      },
    ]);
  };

  const deleteChapter = (id: string) => {
    setChapters((current) => current.filter((chapter) => chapter.id !== id));
  };

  const addLesson = (chapterId: string) => {
    const newLesson: Lesson = {
      id: `new-lesson-${Date.now()}`,
      name: "درس جديد",
      order: 0,
      type: "VIDEO",
      videoUrl: "",
      duration: 0,
      durationMinutes: 0,
      isFree: false,
      description: "",
      attachments: [],
      examId: null,
    };
    setChapters((current) =>
      current.map((chapter) => {
        if (chapter.id !== chapterId) return chapter;
        return {
          ...chapter,
          subTopics: [
            ...chapter.subTopics,
            { ...newLesson, order: chapter.subTopics.length },
          ],
        };
      })
    );
    setEditingLesson({ lesson: newLesson, chapterId });
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    setChapters((current) => removeLessonFromChapters(current, chapterId, lessonId));
  };

  const handleSaveChapter = () => {
    if (!editingChapter) return;
    setChapters((current) =>
      current.map((chapter) => (chapter.id === editingChapter.id ? { ...chapter, name: editingChapter.name } : chapter))
    );
    setEditingChapter(null);
  };

  const handleSaveLesson = () => {
    if (!editingLesson) return;
    setChapters((current) => updateLessonInChapters(current, editingLesson.chapterId, editingLesson.lesson));
    setEditingLesson(null);
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setEditingLesson((prev) =>
      prev
        ? {
            ...prev,
            lesson: {
              ...prev.lesson,
              attachments: prev.lesson.attachments?.filter((a) => a.id !== attachmentId),
            },
          }
        : null
    );
  };

  const fetchInteractiveQuestions = async (lessonId: string) => {
    setLoadingQuestions(true);
    try {
      const response = await adminFetch(`/admin/courses/lessons/${lessonId}/interactive-questions`);
      const result = await response.json();
      if (response.ok) {
        setInteractiveQuestions(result.data || result || []);
      } else {
        setInteractiveQuestions([]);
      }
    } catch (error) {
      console.error("Failed to fetch interactive questions:", error);
      setInteractiveQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOpenInteractiveQuestions = (lesson: Lesson) => {
    setInteractiveQuestionsDialog({ lessonId: lesson.id, lessonName: lesson.name });
    // Don't hit the API for lessons that haven't been saved yet (new-xxx IDs).
    // They have no DB record so the backend returns 500.
    if (!lesson.id.startsWith("new-")) {
      fetchInteractiveQuestions(lesson.id);
    } else {
      setInteractiveQuestions([]);
    }
  };

  const handleCreateInteractiveQuestion = async (question: Omit<InteractiveQuestion, "id" | "lessonId">) => {
    try {
      const response = await adminFetch(`/admin/courses/lessons/${interactiveQuestionsDialog?.lessonId}/interactive-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: interactiveQuestionsDialog?.lessonId,
          groupId: selectedGroupId,
          groupOrder: selectedGroupId ? (interactiveQuestions.filter(q => q.groupId === selectedGroupId).length) : 0,
          ...question,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("تم إضافة السؤال بنجاح");
        fetchInteractiveQuestions(interactiveQuestionsDialog?.lessonId!);
        setSelectedGroupId(null);
      } else {
        toast.error(result.error || "فشل إضافة السؤال");
      }
    } catch (error) {
      toast.error("فشل إضافة السؤال");
    }
  };

  const handleUpdateInteractiveQuestion = async (id: string, updates: Partial<InteractiveQuestion>) => {
    try {
      const response = await adminFetch("/admin/interactive-questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (response.ok) {
        toast.success("تم تحديث السؤال بنجاح");
        fetchInteractiveQuestions(interactiveQuestionsDialog?.lessonId!);
      } else {
        const result = await response.json();
        toast.error(result.error || "فشل تحديث السؤال");
      }
    } catch (error) {
      toast.error("فشل تحديث السؤال");
    }
  };

  const handleDeleteInteractiveQuestion = async (id: string) => {
    try {
      const response = await adminFetch(`/admin/interactive-questions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("تم حذف السؤال بنجاح");
        fetchInteractiveQuestions(interactiveQuestionsDialog?.lessonId!);
      } else {
        const result = await response.json();
        toast.error(result.error || "فشل حذف السؤال");
      }
    } catch (error) {
      toast.error("فشل حذف السؤال");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const curriculum = serializeCurriculum(chapters);
      const response = await adminFetch(apiRoutes.admin.courseCurriculum(courseId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculum }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "فشل حفظ المنهج");
      }

      setChapters((result.data?.curriculum || result.data?.topics || curriculum).map(normalizeChapter));
      await requestPublicCacheRevalidation(COURSE_PUBLIC_CACHE_PATHS);
      toast.success("تم حفظ منهج الدورة بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ المنهج");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl space-y-8 p-4 pb-40 lg:p-10" dir="rtl">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent" onClick={() => router.push("/admin/courses")}>
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للدورات
          </Button>
          <h1 className="text-4xl font-black tracking-tight">منهج الدورة التعليمية</h1>
          <p className="text-sm font-bold text-zinc-500">
            {course?.nameAr || course?.name || "الدورة"} - إدارة الفصول والدروس والمحتوى
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-right dark:border-zinc-800 dark:bg-zinc-900 md:block">
            <p className="text-[10px] font-black text-zinc-500">إجمالي المحتوى</p>
            <p className="text-sm font-black">
              {curriculumStats.lessonsCount} درس • {curriculumStats.totalDurationMinutes} دقيقة • {curriculumStats.totalDurationHours} ساعة
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="h-11 rounded-xl px-8 text-[10px] font-black uppercase">
            {isSaving ? <div className="ml-2 h-4 w-4 animate-spin rounded-full border-t-2 border-white" /> : <Save className="ml-2 h-4 w-4" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">هيكل المنهج</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => {
              setAiDialogOpen(true);
              setAiPreviewChapters(null);
              setAiPrompt("");
            }} variant="outline" className="h-10 rounded-xl px-5 text-[10px] font-bold uppercase gap-2 border-primary/20 text-primary hover:bg-primary/5">
              <Sparkles className="h-4 w-4" />
              توليد بالذكاء الاصطناعي
            </Button>
            <Button onClick={addChapter} variant="outline" className="h-10 rounded-xl px-5 text-[10px] font-bold uppercase">
              <Plus className="ml-2 h-4 w-4" />
              إضافة فصل
            </Button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndChapter}>
          <SortableContext items={chapters.map((chapter) => chapter.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
              {chapters.map((chapter) => (
                <SortableChapter
                  key={chapter.id}
                  chapter={chapter}
                  onDeleteChapter={deleteChapter}
                  onAddLesson={addLesson}
                  onDeleteLesson={deleteLesson}
                  onReorderLessons={handleReorderLessons}
                  onEditChapter={(currentChapter) => setEditingChapter({ id: currentChapter.id, name: currentChapter.name })}
                  onEditLesson={(lesson, chapterId) => setEditingLesson({ lesson: { ...lesson }, chapterId })}
                  onManageQuestions={handleOpenInteractiveQuestions}
                />
              ))}
              {chapters.length === 0 && (
                <div className="rounded-[2rem] border-2 border-dashed border-zinc-100 bg-zinc-50/30 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900/10">
                  <Layers className="mx-auto mb-6 h-16 w-16 text-zinc-300 opacity-20 dark:text-zinc-800" />
                  <h3 className="mb-2 text-lg font-bold text-zinc-400">لم يتم إنشاء أي فصول بعد</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ابدأ بإضافة فصل جديد ثم أضف الدروس داخله</p>
                  <Button onClick={addChapter} className="mt-8 h-11 rounded-xl px-8 text-[10px] font-black uppercase">
                    إنشاء أول فصل
                  </Button>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <Dialog open={!!editingChapter} onOpenChange={(open) => !open && setEditingChapter(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">تعديل الفصل</DialogTitle>
            <DialogDescription className="text-xs font-bold text-zinc-500">حدّث الاسم الظاهر للطلاب</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label className="text-[10px] font-black uppercase">اسم الفصل</Label>
            <Input
              value={editingChapter?.name || ""}
              onChange={(event) => setEditingChapter((current) => (current ? { ...current, name: event.target.value } : null))}
              className="h-12 rounded-xl text-sm font-bold"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveChapter} className="h-12 w-full rounded-xl text-xs font-black uppercase">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingLesson} onOpenChange={(open) => !open && setEditingLesson(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">تعديل الدرس</DialogTitle>
            <DialogDescription className="text-xs font-bold text-zinc-500">أدخل بيانات الدرس والمحتوى المرتبط به</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">اسم الدرس</Label>
              <Input
                value={editingLesson?.lesson.name || ""}
                onChange={(event) =>
                  setEditingLesson((current) =>
                    current ? { ...current, lesson: { ...current.lesson, name: event.target.value } } : null
                  )
                }
                className="h-12 rounded-xl text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">نوع الدرس</Label>
                <Select
                  value={editingLesson?.lesson.type || ""}
                  onValueChange={(value: LessonType) =>
                    setEditingLesson((current) =>
                      current ? { ...current, lesson: { ...current.lesson, type: value } } : null
                    )
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIDEO">فيديو</SelectItem>
                    <SelectItem value="ARTICLE">مقال</SelectItem>
                    <SelectItem value="QUIZ">اختبار</SelectItem>
                    <SelectItem value="FILE">ملف</SelectItem>
                    <SelectItem value="ASSIGNMENT">واجب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">المدة بالدقائق</Label>
                <Input
                  type="number"
                  value={editingLesson?.lesson.duration ?? editingLesson?.lesson.durationMinutes ?? 0}
                  onChange={(event) =>
                    setEditingLesson((current) => {
                      if (!current) return null;
                      const duration = Number(event.target.value) || 0;
                      return {
                        ...current,
                        lesson: {
                          ...current.lesson,
                          duration,
                          durationMinutes: duration,
                        },
                      };
                    })
                  }
                  className="h-12 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            {editingLesson?.lesson.type === "QUIZ" ? (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">اختر الاختبار المُرتبط</Label>
                <Select
                  value={editingLesson?.lesson.examId || "none"}
                  onValueChange={(value) =>
                    setEditingLesson((current) =>
                      current
                        ? {
                            ...current,
                            lesson: {
                              ...current.lesson,
                              examId: value === "none" ? null : value,
                            },
                          }
                        : null
                    )
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl text-sm font-bold">
                    <SelectValue placeholder="اختر اختباراً..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون اختبار</SelectItem>
                    {exams.map((exam: any) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase">المحتوى الأساسي (رابط أو ملف)</Label>
                <Input
                  value={editingLesson?.lesson.videoUrl || ""}
                  onChange={(event) =>
                    setEditingLesson((current) =>
                      current ? { ...current, lesson: { ...current.lesson, videoUrl: event.target.value } } : null
                    )
                  }
                  className="h-12 rounded-xl text-sm font-bold"
                  placeholder="https://..."
                />
                {(editingLesson?.lesson.type === "VIDEO" || editingLesson?.lesson.type === "FILE") && (
                  <AdminUpload
                    accept={editingLesson?.lesson.type === "VIDEO" ? "video/*" : "*/*"}
                    label={editingLesson?.lesson.type === "VIDEO" ? "رفع فيديو الدرس" : "رفع ملف الدرس"}
                    maxSize={100 * 1024} // 100GB support
                    onUploadComplete={(url: string, metadata) => {
                      setEditingLesson((current) =>
                        current
                          ? {
                              ...current,
                              lesson: {
                                ...current.lesson,
                                videoUrl: url,
                                duration:
                                  metadata?.durationMinutes && metadata.durationMinutes > 0
                                    ? metadata.durationMinutes
                                    : current.lesson.duration,
                              },
                            }
                          : null
                      );
                    }}
                  />
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase">المرفقات الإضافية</Label>
                <Badge variant="outline" className="text-[9px] font-black opacity-50">
                  {editingLesson?.lesson.attachments?.length || 0} مرفقات
                </Badge>
              </div>
              
              <div className="space-y-2">
                {editingLesson?.lesson.attachments?.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-800">
                      <Paperclip className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-[11px] font-bold">{attachment.title}</p>
                      <p className="text-[9px] text-zinc-400 uppercase font-medium">
                        {(attachment.fileSize ? (attachment.fileSize / (1024 * 1024)).toFixed(2) + " MB" : "Unknown Size")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <AdminUpload
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                  label="إضافة مرفق جديد"
                  onUploadComplete={(url, metadata) => {
                    setEditingLesson(prev => {
                      if (!prev) return null;
                      const newAttachment: LessonAttachment = {
                        id: `new-att-${Date.now()}`,
                        title: metadata?.fileName || "مرفق جديد",
                        fileUrl: url,
                        fileType: metadata?.fileType,
                        fileSize: metadata?.fileSize,
                      };
                      return {
                        ...prev,
                        lesson: {
                          ...prev.lesson,
                          attachments: [...(prev.lesson.attachments || []), newAttachment]
                        }
                      };
                    });
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">وصف الدرس</Label>
              <Input
                value={editingLesson?.lesson.description || ""}
                onChange={(event) =>
                  setEditingLesson((current) =>
                    current ? { ...current, lesson: { ...current.lesson, description: event.target.value } } : null
                  )
                }
                className="h-12 rounded-xl text-sm font-bold"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <Label className="text-sm font-bold">درس مجاني</Label>
                <p className="text-[10px] text-zinc-500">يظهر كمعاينة قبل الاشتراك</p>
              </div>
              <Switch
                checked={editingLesson?.lesson.isFree || false}
                onCheckedChange={(checked) =>
                  setEditingLesson((current) =>
                    current ? { ...current, lesson: { ...current.lesson, isFree: checked } } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-2 dark:bg-zinc-950">
            <Button onClick={handleSaveLesson} className="h-12 w-full rounded-xl text-xs font-black uppercase">
              حفظ بيانات الدرس
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              توليد المنهج بالذكاء الاصطناعي
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-zinc-500">
              قم بإدخال تفاصيل الدورة التعليمية وسيقوم الذكاء الاصطناعي ببناء الهيكل الأمثل للفصول والدروس تلقائيًا.
            </DialogDescription>
          </DialogHeader>

          {!aiPreviewChapters ? (
            <div className="space-y-4 py-4 text-right">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">أهداف أو موضوع الدورة بالتفصيل</Label>
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="مثال: دورة كاملة لشرح الجبر وحل نماذج الامتحانات للثانوية العامة"
                  className="h-12 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">عدد الفصول المطلوبة</Label>
                  <Select value={aiChaptersCount} onValueChange={setAiChaptersCount}>
                    <SelectTrigger className="h-12 rounded-xl text-sm font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 فصول</SelectItem>
                      <SelectItem value="5">5 فصول</SelectItem>
                      <SelectItem value="8">8 فصول</SelectItem>
                      <SelectItem value="10">10 فصول</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">المستوى التعليمي</Label>
                  <Select value={aiLevel} onValueChange={setAiLevel}>
                    <SelectTrigger className="h-12 rounded-xl text-sm font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">مبتدئ</SelectItem>
                      <SelectItem value="INTERMEDIATE">متوسط</SelectItem>
                      <SelectItem value="ADVANCED">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleAiGenerate}
                disabled={isAiGenerating}
                className="h-12 w-full rounded-xl text-xs font-black uppercase gap-2 mt-4"
              >
                {isAiGenerating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-white" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                إنشاء مقترح المنهج
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-4 text-right">
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs font-bold text-primary">
                  تم توليد هيكل المنهج بنجاح. يرجى مراجعته أدناه قبل تطبيقه على الدورة. سيؤدي التطبيق إلى استبدال المنهج الحالي.
                </p>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {aiPreviewChapters.map((ch, idx) => (
                  <div key={idx} className="rounded-xl border border-zinc-200 p-3 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <h4 className="text-sm font-black text-foreground mb-2">الفصل {idx + 1}: {ch.name}</h4>
                    <div className="space-y-1.5 mr-3 border-r-2 border-zinc-200 pr-3">
                      {(ch.lessons || []).map((l: any, lIdx: number) => (
                        <div key={lIdx} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-muted-foreground">{l.name} ({l.duration} د)</span>
                          <Badge variant="outline" className="text-[9px] scale-90">{l.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleApplyAiCurriculum} className="h-12 flex-1 rounded-xl text-xs font-black uppercase">
                  اعتماد المنهج وتطبيقه
                </Button>
                <Button variant="outline" onClick={() => setAiPreviewChapters(null)} className="h-12 px-6 rounded-xl text-xs font-bold">
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!interactiveQuestionsDialog} onOpenChange={(open) => !open && setInteractiveQuestionsDialog(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              الأسئلة التفاعلية للفيديو
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-zinc-500">
              {interactiveQuestionsDialog?.lessonName} - أضف أسئلة تظهر أثناء تشغيل الفيديو ويجب على الطالب الإجابة عليها للمتابعة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loadingQuestions ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {interactiveQuestions.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-zinc-100 bg-zinc-50/30 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900/10">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-zinc-300 opacity-20 dark:text-zinc-800" />
                      <p className="text-sm font-bold text-zinc-400">لا توجد أسئلة تفاعلية بعد</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">أضف سؤالاً جديداً لبدء الاستخدام</p>
                    </div>
                  ) : (
                    <>
                      {/* Group questions by time position */}
                      {(() => {
                        const grouped = interactiveQuestions.reduce((acc, q) => {
                          const key = q.timePosition;
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(q);
                          return acc;
                        }, {} as Record<number, InteractiveQuestion[]>);

                        return Object.entries(grouped)
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([time, questions]) => (
                            <div key={time} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-primary/10 text-primary text-[10px] font-black">
                                  {formatTime(Number(time))}
                                </Badge>
                                {questions.length > 1 && (
                                  <Badge variant="outline" className="text-[9px] font-black">
                                    {questions.length} أسئلة
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] font-bold"
                                  onClick={() => setSelectedGroupId(questions[0]?.groupId || `group-${time}`)}
                                >
                                  <Plus className="h-3 w-3 ml-1" />
                                  إضافة سؤال
                                </Button>
                              </div>
                              <div className="space-y-2 mr-4">
                                {questions
                                  .sort((a, b) => (a.groupOrder || 0) - (b.groupOrder || 0))
                                  .map((question) => (
                                    <InteractiveQuestionCard
                                      key={question.id}
                                      question={question}
                                      index={interactiveQuestions.indexOf(question)}
                                      onUpdate={(updates) => handleUpdateInteractiveQuestion(question.id, updates)}
                                      onDelete={() => handleDeleteInteractiveQuestion(question.id)}
                                    />
                                  ))}
                              </div>
                            </div>
                          ));
                      })()}
                    </>
                  )}
                </div>

                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <h4 className="text-sm font-bold mb-3">
                    {selectedGroupId ? "إضافة سؤال للمجموعة" : "إضافة سؤال جديد"}
                  </h4>
                  {selectedGroupId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mb-3 text-xs"
                      onClick={() => setSelectedGroupId(null)}
                    >
                      <X className="h-3 w-3 ml-1" />
                      إلغاء المجموعة
                    </Button>
                  )}
                  <NewQuestionForm onSubmit={handleCreateInteractiveQuestion} />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
