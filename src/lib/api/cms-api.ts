import { adminApi } from "./admin-api";

export interface CurriculumItem {
  id: string;
  title: string;
  kind: string;
  orderIndex: number;
  dripMode: string;
  dripAt?: string;
  dripAfterDays: number;
  isPublished: boolean;
  videoUrl?: string;
  children?: CurriculumItem[];
}

export interface BankQuestion {
  id: string;
  subjectId: string;
  topic?: string;
  difficulty: string;
  type: string;
  text: string;
  options?: string[];
  explanation?: string;
  points: number;
  usageCount: number;
  createdAt: string;
}

export interface LiveSession {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  provider: string;
  joinUrl?: string;
  startUrl?: string;
  hostEmail: string;
  scheduledAt: string;
  durationMin: number;
  status: string;
  createdAt: string;
}

export const cmsApi = {
  getCurriculum: (subjectId: string) =>
    adminApi.get<CurriculumItem[]>(`/subjects/${subjectId}/curriculum-tree`),
  createCurriculumItem: (subjectId: string, body: Partial<CurriculumItem>) =>
    adminApi.post<CurriculumItem>(`/subjects/${subjectId}/curriculum-tree`, body),

  listBankQuestions: (params?: { subjectId?: string; topic?: string; difficulty?: string; type?: string }) =>
    adminApi.get<BankQuestion[]>("/bank-questions", params),
  createBankQuestion: (body: Partial<BankQuestion>) =>
    adminApi.post<BankQuestion>("/bank-questions", body),

  listLiveSessions: (subjectId?: string) =>
    adminApi.get<LiveSession[]>("/live-sessions", subjectId ? { subjectId } : undefined),
  createLiveSession: (body: Partial<LiveSession>) =>
    adminApi.post<LiveSession>("/live-sessions", body),

  generateExam: (blueprintId: string) =>
    adminApi.post(`/blueprints/${blueprintId}/generate`, {}),
};

export const QUESTION_TYPES = [
  { value: "MCQ", label: "اختياري" },
  { value: "TRUE_FALSE", label: "صح/خطأ" },
  { value: "ESSAY", label: "مقالي" },
  { value: "FILL_BLANK", label: "ملء فراغ" },
  { value: "MATCHING", label: "توصيل" },
  { value: "MULTI_SELECT", label: "اختيار متعدد" },
  { value: "ORDERING", label: "ترتيب" },
  { value: "NUMERIC", label: "رقمي" },
  { value: "DRAG_DROP", label: "سحب وإفلات" },
  { value: "AUDIO", label: "سماعي" },
  { value: "VIDEO", label: "مرئي" },
  { value: "CODE", label: "برمجي" },
  { value: "LIKERT", label: "مقياس" },
  { value: "SHORT_ANSWER", label: "إجابة قصيرة" },
  { value: "FILE_UPLOAD", label: "رفع ملف" },
];

export const DRIP_MODES = [
  { value: "IMMEDIATE", label: "فوراً" },
  { value: "SCHEDULED", label: "تاريخ محدد" },
  { value: "RELATIVE", label: "بعد أيام من التسجيل" },
];
