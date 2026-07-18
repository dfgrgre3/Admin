/**
 * أنواع البيانات الموحدة للذكاء الاصطناعي
 * Unified AI Types
 */

// ─── مزود الذكاء الاصطناعي ───────────────────────────────
export type AIProvider = 'openai' | 'gemini' | 'claude' | 'deepseek' | 'auto';

export interface AIProviderConfig {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

// ─── أدوار الرسائل ────────────────────────────────────────
export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: string;
  conversationId: string;
  role: AIMessageRole;
  content: string;
  tokensUsed?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── المحادثات ────────────────────────────────────────────
export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  summary?: string;
  isActive: boolean;
  messages?: AIMessage[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── إجراءات AI المدعومة ──────────────────────────────────
export type AIActionType =
  | 'copilot'
  | 'generate_content'
  | 'review_content'
  | 'execute_action'
  | 'agent_command'
  | 'agent_execute'
  | 'chat'
  | 'suggest'
  | 'grade'
  | 'forecast'
  | 'analyze_risk';

// ─── أنواع المحتوى المولد ─────────────────────────────────
export type AIContentType =
  | 'exam_blueprint'
  | 'curriculum_outline'
  | 'article_draft'
  | 'article'
  | 'update_suggestion'
  | 'lesson_summary'
  | 'learning_path';

// ─── الطلبات والاستجابات ──────────────────────────────────
export interface AIRequestBase {
  action: AIActionType;
  provider?: AIProvider;
  model?: string;
}

export interface AICopilotRequest extends AIRequestBase {
  action: 'copilot';
  prompt: string;
  context?: Record<string, unknown>;
}

export interface AIGenerateContentRequest extends AIRequestBase {
  action: 'generate_content';
  contentType: AIContentType;
  title: string;
  prompt: string;
  subjectId?: string | null;
}

export interface AIReviewContentRequest extends AIRequestBase {
  action: 'review_content';
  id: string;
  decision: 'approve' | 'reject';
}

export interface AIExecuteActionRequest extends AIRequestBase {
  action: 'execute_action';
  type: string;
  params: Record<string, unknown>;
}

export interface AIChatRequest extends AIRequestBase {
  action: 'chat';
  message: string;
  conversationId?: string;
}

export type AIRequest =
  | AICopilotRequest
  | AIGenerateContentRequest
  | AIReviewContentRequest
  | AIExecuteActionRequest
  | AIChatRequest;

export interface AIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface AIKnowledgeSource {
  id: string;
  type: 'subject' | 'topic' | 'lesson' | 'book' | 'blog_post' | string;
  title: string;
  snippet: string;
}

export interface AICopilotResponse {
  message: string;
  tokensUsed?: number;
  sources?: AIKnowledgeSource[];
}

export interface AIGenerateContentResponse {
  item: {
    id: string;
    title: string;
    type: string;
    preview: string;
  };
  message: string;
}

// ─── بيانات لوحة التحكم AI ────────────────────────────────
export interface Subject {
  id: string;
  name: string;
}

export interface ReviewItem {
  id: string;
  title: string;
  type: string;
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  author: string;
  subject: string;
  preview: string;
}

export type RiskLevel = 'CRITICAL' | 'WARNING' | 'NOTICE';

export interface RiskStudent {
  userId: string;
  name: string;
  email: string;
  riskLevel: RiskLevel;
  reason: string;
  recommendation: string;
}

export interface GradingItem {
  id: string;
  studentName: string;
  score: string;
  answer: string;
  feedback: string | null;
  status: 'PENDING' | 'RESOLVED';
}

export interface ForecastItem {
  userId: string;
  name: string;
  currentScore: number;
  predictedFinalScore: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AiSummary {
  highRiskCount: number;
  reviewPendingCount: number;
  pendingGradingCount: number;
  aiBriefing?: string;
  totalUsers?: number;
  activeUsers?: number;
}

export interface AiDashboardData {
  success: boolean;
  subjects: Subject[];
  reviewQueue: ReviewItem[];
  riskStudents: RiskStudent[];
  gradingQueue: GradingItem[];
  forecast: ForecastItem[];
  summary: AiSummary;
}

// ─── إحصائيات المخاطر (للـ AiCommandCenter) ──────────────
export interface RiskStudentSimple {
  id: string;
  name: string;
  email: string;
  gradeLevel: string | null;
  riskScore: number;
  reasons: string[];
  latestAverage: number | null;
  studyMinutesLast7Days: number;
  daysSinceLastLogin: number | null;
}

export interface AdminAiPayload {
  riskStudents: RiskStudentSimple[];
  subjects: Subject[];
  summary: {
    highRiskCount: number;
  };
}

export type AdminAgentActionType =
  | 'review_dashboard'
  | 'review_users'
  | 'review_courses'
  | 'review_exams'
  | 'create_notification'
  | 'generate_content'
  | 'suggest_fixes'
  | 'execute_safe_action'
  | 'prepare_dangerous_action';

export interface AdminAgentPlanStep {
  title: string;
  description: string;
  action: AdminAgentActionType;
  requiresConfirmation: boolean;
  params?: Record<string, unknown>;
}

export interface AdminAgentFinding {
  area: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

export interface AdminAgentCommandContext {
  dashboard?: Record<string, unknown>;
  page?: string;
  locale?: string;
}

export interface AdminAgentCommandResponse {
  commandId: string;
  action: AdminAgentActionType;
  status: 'planned' | 'completed' | 'blocked';
  requiresConfirmation: boolean;
  message: string;
  plan: AdminAgentPlanStep[];
  findings: AdminAgentFinding[];
  result?: Record<string, unknown>;
}

export interface AdminAgentExecuteResponse extends AdminAgentCommandResponse {
  status: 'completed' | 'blocked';
}