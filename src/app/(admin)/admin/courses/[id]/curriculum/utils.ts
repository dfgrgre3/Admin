import type { Lesson, Chapter } from "./types";

export function normalizeLesson(lesson: any, index: number): Lesson {
  const duration = Number(lesson.duration ?? lesson.durationMinutes) || 0;

  return {
    id: lesson.id,
    name: lesson.name || lesson.title || "درس جديد",
    order: Number(lesson.order ?? index),
    type: (lesson.type || "VIDEO") as any,
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

export function normalizeChapter(chapter: any, index: number): Chapter {
  return {
    id: chapter.id,
    name: chapter.name || chapter.title || `الفصل ${index + 1}`,
    order: Number(chapter.order ?? index),
    subTopics: (chapter.subTopics || chapter.lessons || []).map(normalizeLesson),
  };
}
