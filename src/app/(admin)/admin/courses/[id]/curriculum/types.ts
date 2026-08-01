export type LessonType = "VIDEO" | "TEXT" | "AUDIO" | "FILE" | "EXTERNAL_LINK" | "INTERACTIVE_QUIZ";

export type InteractiveQuestionType = "multiple_choice" | "true_false" | "short_answer";

export type LessonAttachment = {
  id: string;
  name: string;
  url: string;
  type: string;
};

export type InteractiveQuestion = {
  id: string;
  question: string;
  type: InteractiveQuestionType;
  options?: string[];
  correctAnswer?: string;
  groupId?: string;
  timePosition?: number;
};

export type Lesson = {
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

export type Chapter = {
  id: string;
  name: string;
  order: number;
  subTopics: Lesson[];
};

export type CourseSummary = {
  id: string;
  name: string;
  nameAr?: string | null;
};
