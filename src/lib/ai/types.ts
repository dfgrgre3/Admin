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

// ─── المساعدون الذكيون (AI Assistants) ─────────────────────
export type AssistantType =
  | 'copilot'
  | 'content_studio'
  | 'tutor'
  | 'moderator'
  | 'grader'
  | 'forecast';

export type AssistantStatus = 'active' | 'idle' | 'disabled' | 'training';

export interface AssistantCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  usageCount: number;
  successRate: number;
}

export interface AssistantUsagePoint {
  date: string;
  calls: number;
  tokens: number;
  successRate: number;
}

export interface Assistant {
  id: string;
  type: AssistantType;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  status: AssistantStatus;
  model: string;
  provider: AIProvider;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  capabilities: AssistantCapability[];
  usageHistory: AssistantUsagePoint[];
  totalCalls: number;
  totalTokens: number;
  averageLatencyMs: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantOverview {
  totalAssistants: number;
  activeAssistants: number;
  totalCallsToday: number;
  totalCallsThisWeek: number;
  totalTokensThisWeek: number;
  averageSuccessRate: number;
  topPerformer: Assistant | null;
  needsAttention: Assistant[];
}

// ─── مراجعة المحتوى (Content Review Queue) ─────────────────
export type ContentReviewStatus =
  | 'pending_review'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'needs_revision';

export type ContentReviewPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AIContentReviewItem {
  id: string;
  title: string;
  type: string;
  status: ContentReviewStatus;
  priority: ContentReviewPriority;
  preview: string;
  fullContent: string;
  author: { id: string; name: string; email: string };
  subject: string;
  aiScore: number;
  aiFlags: string[];
  aiSuggestion: string;
  reviewer: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ContentReviewStats {
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  needsRevision: number;
  averageAiScore: number;
  urgentCount: number;
}

// ─── سجلات الذكاء الاصطناعي (AI Logs) ─────────────────────
export type AILogStatus = 'success' | 'error' | 'warning' | 'info';

export type AILogAction =
  | 'copilot'
  | 'generate_content'
  | 'review_content'
  | 'execute_action'
  | 'agent_command'
  | 'agent_execute'
  | 'chat'
  | 'moderation'
  | 'grading'
  | 'forecast';

export interface AILogEntry {
  id: string;
  action: AILogAction;
  status: AILogStatus;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  modelUsed: string;
  durationMs: number;
  errorMessage?: string;
  ip: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AILogStats {
  totalLogs: number;
  successRate: number;
  averageDurationMs: number;
  totalTokensUsed: number;
  errorsToday: number;
  callsByAction: Record<string, number>;
  callsByModel: Record<string, number>;
  timelineByDay: Array<{ date: string; success: number; error: number; warning: number }>;
}

// ─── الرقابة الذكية (Smart Moderation) ──────────────────────
export type ModerationCaseStatus =
  | 'pending'
  | 'auto_approved'
  | 'auto_rejected'
  | 'escalated'
  | 'human_reviewing'
  | 'resolved';

export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ModerationReason =
  | 'spam'
  | 'profanity'
  | 'hate_speech'
  | 'sexual_content'
  | 'violence'
  | 'personal_info'
  | 'misinformation'
  | 'cheating'
  | 'off_topic'
  | 'plagiarism'
  | 'other';

export interface ModerationCase {
  id: string;
  contentType: 'comment' | 'post' | 'message' | 'profile' | 'submission' | 'review';
  contentId: string;
  contentPreview: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  reason: ModerationReason;
  severity: ModerationSeverity;
  confidence: number;
  status: ModerationCaseStatus;
  aiExplanation: string;
  flaggedKeywords: string[];
  reviewerId: string | null;
  reviewerName: string | null;
  resolution: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ModerationRule {
  id: string;
  name: string;
  description: string;
  reason: ModerationReason;
  pattern: string;
  severity: ModerationSeverity;
  action: 'auto_approve' | 'auto_reject' | 'flag_for_review' | 'escalate';
  enabled: boolean;
  matchCount: number;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationStats {
  pendingCases: number;
  resolvedToday: number;
  autoApprovedToday: number;
  autoRejectedToday: number;
  escalatedCases: number;
  averageResponseTimeMs: number;
  topReasons: Array<{ reason: ModerationReason; count: number }>;
  falsePositiveRate: number;
}