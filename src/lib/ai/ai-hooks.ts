/**
 * Hooks موحدة للذكاء الاصطناعي
 * Unified AI Hooks - للاستخدام في كل مكونات React
 */
'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { aiClient } from './ai-client';
import { adminFetch } from '@/lib/api/admin-api';
import type {
  AICopilotResponse,
  AIGenerateContentResponse,
  AIResponse,
  AiDashboardData,
  AdminAiPayload,
  AIContentType,
  AdminAgentCommandContext,
  AdminAgentCommandResponse,
  AdminAgentExecuteResponse,
  Assistant,
  AssistantOverview,
  AIContentReviewItem,
  ContentReviewStats,
  ContentReviewStatus,
  AILogEntry,
  AILogStats,
  ModerationCase,
  ModerationStats,
  ModerationRule,
  ModerationCaseStatus,
} from './types';

// ─── مفاتيح Cache موحدة ──────────────────────────────────
// (انظر aiKeys الموحّد في نهاية الملف — يحتوي جميع المفاتيح المركزية)

// ─── Hook: بيانات لوحة التحكم AI ─────────────────────────

/**
 * جلب بيانات لوحة التحكم الكاملة للذكاء الاصطناعي
 * يُستخدم في صفحة AI Hub (admin/ai)
 */
export function useAIDashboard(options?: UseQueryOptions<AiDashboardData>) {
  return useQuery<AiDashboardData>({
    queryKey: aiKeys.dashboard,
    queryFn: () => aiClient.getDashboardData(),
    staleTime: 30_000,
    retry: 2,
    ...options,
  });
}

// ─── Hook: بيانات AI المبسطة ────────────────────────────

/**
 * جلب بيانات AI المبسطة (للمكونات الخفيفة)
 * يُستخدم في AiCommandCenter
 */
export function useAISimplifiedData(options?: UseQueryOptions<AdminAiPayload>) {
  return useQuery<AdminAiPayload>({
    queryKey: aiKeys.simplified,
    queryFn: () => aiClient.getSimplifiedData(),
    staleTime: 30_000,
    retry: 2,
    ...options,
  });
}

// ─── Hook: المساعد الذكي (Copilot) ─────────────────────

/**
 * إرسال استفسار إلى المساعد الذكي
 */
export function useAICopilot(options?: UseMutationOptions<AICopilotResponse, Error, { prompt: string; context?: Record<string, unknown> }>) {
  return useMutation<AICopilotResponse, Error, { prompt: string; context?: Record<string, unknown> }>({
    mutationFn: ({ prompt, context }) => aiClient.copilot(prompt, context),
    ...options,
  });
}

// ─── Hook: توليد المحتوى ───────────────────────────────

/**
 * توليد محتوى تعليمي باستخدام AI
 */
export function useAIGenerateContent(options?: UseMutationOptions<
  AIGenerateContentResponse,
  Error,
  { contentType: AIContentType; title: string; prompt: string; subjectId?: string | null }
>) {
  const queryClient = useQueryClient();

  return useMutation<
    AIGenerateContentResponse,
    Error,
    { contentType: AIContentType; title: string; prompt: string; subjectId?: string | null }
  >({
    mutationFn: (params) => aiClient.generateContent(params),
    // onSettled (not onSuccess) so a consumer-supplied onSuccess via ...options
    // doesn't shadow and skip the dashboard cache invalidation.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.dashboard });
    },
    ...options,
  });
}

// ─── Hook: مراجعة المحتوى ─────────────────────────────

/**
 * اعتماد أو رفض محتوى مولّد
 */
export function useAIReviewContent(options?: UseMutationOptions<AIResponse, Error, { id: string; decision: 'approve' | 'reject' }>) {
  const queryClient = useQueryClient();

  return useMutation<AIResponse, Error, { id: string; decision: 'approve' | 'reject' }>({
    mutationFn: ({ id, decision }) => aiClient.reviewContent(id, decision),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.dashboard });
    },
    ...options,
  });
}

// ─── Hook: تنفيذ إجراء ─────────────────────────────────

/**
 * تنفيذ إجراء ذكي (مثل إرسال تنبيهات، توليد خطط مراجعة)
 */
export function useAIExecuteAction(options?: UseMutationOptions<AIResponse, Error, { type: string; params: Record<string, unknown> }>) {
  const queryClient = useQueryClient();

  return useMutation<AIResponse, Error, { type: string; params: Record<string, unknown> }>({
    mutationFn: ({ type, params }) => aiClient.executeAction(type, params),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.dashboard });
    },
    ...options,
  });
}

export function useAIAdminAgent(options?: UseMutationOptions<AdminAgentCommandResponse, Error, { command: string; context?: AdminAgentCommandContext }>) {
  return useMutation<AdminAgentCommandResponse, Error, { command: string; context?: AdminAgentCommandContext }>({
    mutationFn: ({ command, context }) => aiClient.runAgentCommand(command, context),
    ...options,
  });
}

export function useAIAdminAgentExecute(options?: UseMutationOptions<AdminAgentExecuteResponse, Error, { commandId: string; confirmed: boolean }>) {
  const queryClient = useQueryClient();

  return useMutation<AdminAgentExecuteResponse, Error, { commandId: string; confirmed: boolean }>({
    mutationFn: ({ commandId, confirmed }) => aiClient.executeAgentCommand(commandId, confirmed),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: aiKeys.simplified });
    },
    ...options,
  });
}

// ─── Hook: التحليل الذكي الشامل لبيانات المشروع ──────────

export interface AIDataAnalysisResult {
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  recommendations?: string[];
  riskLevel?: string;
  insights?: Array<{ area: string; label: string; value: string; severity: string }>;
  weakSubjects?: Array<{ id: string; title: string; completionRate: number; enrolledCount: number; rating: number }>;
  focus?: string;
  cached?: boolean;
  modelPowered?: boolean;
  snapshot?: Record<string, unknown>;
}

/**
 * تحليل ذكي شامل لبيانات المشروع (تنبؤ التسرب، نقاط الضعف، التوصيات).
 * يربط الذكاء الاصطناعي بكامل بيانات المنصة الحقيقية.
 */
export function useAIDataAnalysis(options?: UseQueryOptions<AIDataAnalysisResult>) {
  return useQuery<AIDataAnalysisResult>({
    queryKey: ['ai', 'data-analysis'],
    queryFn: async () => {
      const response = await adminFetch('/admin/ai/analyze');
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'فشل تحليل بيانات المشروع');
      }
      return (json.data || json) as AIDataAnalysisResult;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}

/**
 * إعادة توليد التحليل الذكي (تجاوز الكاش)
 */
export function useAIDataAnalysisRefresh(options?: UseMutationOptions<AIDataAnalysisResult, Error, { focus?: string }>) {
  const queryClient = useQueryClient();
  return useMutation<AIDataAnalysisResult, Error, { focus?: string }>({
    mutationFn: async ({ focus }) => {
      const response = await adminFetch('/admin/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus: focus || '', refresh: true }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'فشل توليد التحليل');
      }
      return (json.data || json) as AIDataAnalysisResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'data-analysis'] });
    },
    ...options,
  });
}

// ─── التصدير الموحد ──────────────────────────────────────

export const aiKeys = {
  all: ['ai'] as const,
  dashboard: ['ai', 'dashboard'] as const,
  simplified: ['ai', 'simplified'] as const,
  suggestions: (context?: string) => ['ai', 'suggestions', context] as const,
  tips: ['ai', 'tips'] as const,
  recommendations: ['ai', 'recommendations'] as const,
  chat: (conversationId?: string) => ['ai', 'chat', conversationId] as const,
  agent: ['ai', 'agent'] as const,
  assistants: ['ai', 'assistants'] as const,
  assistant: (id: string) => ['ai', 'assistants', id] as const,
  contentReview: (params?: Record<string, unknown>) => ['ai', 'content-review', params] as const,
  aiLogs: (params?: Record<string, unknown>) => ['ai', 'logs', params] as const,
  moderation: (params?: Record<string, unknown>) => ['ai', 'moderation', params] as const,
  moderationRules: ['ai', 'moderation', 'rules'] as const,
} as const;

// ─── Hooks: المساعدون الذكيون (Assistants) ────────────────

export function useAIAssistants(options?: UseQueryOptions<{ assistants: Assistant[]; overview: AssistantOverview }>) {
  return useQuery<{ assistants: Assistant[]; overview: AssistantOverview }>({
    queryKey: aiKeys.assistants,
    queryFn: () => aiClient.getAssistants(),
    staleTime: 60_000,
    retry: 2,
    ...options,
  });
}

export function useAIAssistant(id: string, options?: UseQueryOptions<Assistant>) {
  return useQuery<Assistant>({
    queryKey: aiKeys.assistant(id),
    queryFn: () => aiClient.getAssistant(id),
    enabled: !!id,
    staleTime: 60_000,
    retry: 1,
    ...options,
  });
}

export function useAIUpdateAssistant(options?: UseMutationOptions<AIResponse, Error, { id: string; payload: Partial<Assistant> }>) {
  const queryClient = useQueryClient();
  return useMutation<AIResponse, Error, { id: string; payload: Partial<Assistant> }>({
    mutationFn: ({ id, payload }) => aiClient.updateAssistant(id, payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'assistants'] });
    },
    ...options,
  });
}

export function useAIToggleAssistant(options?: UseMutationOptions<AIResponse, Error, { id: string; status: string }>) {
  const queryClient = useQueryClient();
  return useMutation<AIResponse, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) => aiClient.toggleAssistantStatus(id, status),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'assistants'] });
    },
    ...options,
  });
}

export function useAITestAssistant(options?: UseMutationOptions<{ response: string; durationMs: number }, Error, { id: string; prompt: string }>) {
  return useMutation<{ response: string; durationMs: number }, Error, { id: string; prompt: string }>({
    mutationFn: ({ id, prompt }) => aiClient.testAssistant(id, prompt),
    ...options,
  });
}

// ─── Hooks: مراجعة المحتوى (Content Review) ──────────────

export function useAIContentReview(
  params?: { status?: ContentReviewStatus; search?: string; page?: number; pageSize?: number },
  options?: UseQueryOptions<{ items: AIContentReviewItem[]; stats: ContentReviewStats; total: number }>
) {
  return useQuery<{ items: AIContentReviewItem[]; stats: ContentReviewStats; total: number }>({
    queryKey: aiKeys.contentReview(params as Record<string, unknown>),
    queryFn: () => aiClient.getContentReviewQueue(params),
    staleTime: 30_000,
    retry: 2,
    ...options,
  });
}

export function useAIReviewItem(id: string, options?: UseQueryOptions<AIContentReviewItem>) {
  return useQuery<AIContentReviewItem>({
    queryKey: ['ai', 'content-review', 'item', id],
    queryFn: () => aiClient.getContentReviewItem(id),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}

export function useAIReviewDecide(options?: UseMutationOptions<AIResponse, Error, { id: string; decision: ContentReviewStatus; notes?: string }>) {
  const queryClient = useQueryClient();
  return useMutation<AIResponse, Error, { id: string; decision: ContentReviewStatus; notes?: string }>({
    mutationFn: ({ id, decision, notes }) => aiClient.reviewContentItem(id, decision, notes),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'content-review'] });
      queryClient.invalidateQueries({ queryKey: aiKeys.dashboard });
    },
    ...options,
  });
}

export function useAIReassignReview(options?: UseMutationOptions<AIResponse, Error, { id: string; reviewerId: string }>) {
  const queryClient = useQueryClient();
  return useMutation<AIResponse, Error, { id: string; reviewerId: string }>({
    mutationFn: ({ id, reviewerId }) => aiClient.reassignReviewItem(id, reviewerId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'content-review'] });
    },
    ...options,
  });
}

// ─── Hooks: سجلات الذكاء الاصطناعي (AI Logs) ─────────────

export interface AILogsParams {
  status?: string;
  action?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export function useAILogs(
  params?: AILogsParams,
  options?: UseQueryOptions<{ logs: AILogEntry[]; stats: AILogStats; total: number }>
) {
  return useQuery<{ logs: AILogEntry[]; stats: AILogStats; total: number }>({
    queryKey: aiKeys.aiLogs(params as Record<string, unknown>),
    queryFn: () => aiClient.getAILogs(params),
    staleTime: 15_000,
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ─── Hooks: الرقابة الذكية (Moderation) ───────────────────

export interface ModerationParams {
  status?: ModerationCaseStatus;
  severity?: string;
  reason?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useAIModeration(
  params?: ModerationParams,
  options?: UseQueryOptions<{ cases: ModerationCase[]; stats: ModerationStats; total: number }>
) {
  return useQuery<{ cases: ModerationCase[]; stats: ModerationStats; total: number }>({
    queryKey: aiKeys.moderation(params as Record<string, unknown>),
    queryFn: () => aiClient.getModerationCases(params),
    staleTime: 15_000,
    retry: 2,
    ...options,
  });
}

export function useAIDecideModeration(options?: UseMutationOptions<AIResponse, Error, { id: string; decision: 'approve' | 'reject' | 'escalate'; resolution: string }>) {
  const queryClient = useQueryClient();
  return useMutation<AIResponse, Error, { id: string; decision: 'approve' | 'reject' | 'escalate'; resolution: string }>({
    mutationFn: ({ id, decision, resolution }) => aiClient.decideModerationCase(id, decision, resolution),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'moderation'] });
    },
    ...options,
  });
}

export function useAIModerationRules(options?: UseQueryOptions<{ rules: ModerationRule[] }>) {
  return useQuery<{ rules: ModerationRule[] }>({
    queryKey: aiKeys.moderationRules,
    queryFn: () => aiClient.getModerationRules(),
    staleTime: 60_000,
    retry: 2,
    ...options,
  });
}

export function useAIUpsertModerationRule(options?: UseMutationOptions<AIResponse, Error, Partial<ModerationRule>>) {
  const queryClient = useQueryClient();
  return useMutation<AIResponse, Error, Partial<ModerationRule>>({
    mutationFn: (rule) => aiClient.upsertModerationRule(rule),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.moderationRules });
    },
    ...options,
  });
}

export function useAIToggleModerationRule(options?: UseMutationOptions<AIResponse, Error, { id: string; enabled: boolean }>) {
  const queryClient = useQueryClient();
  return useMutation<AIResponse, Error, { id: string; enabled: boolean }>({
    mutationFn: ({ id, enabled }) => aiClient.toggleModerationRule(id, enabled),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.moderationRules });
    },
    ...options,
  });
}

// ─── التصدير الموحد ──────────────────────────────────────

export const aiHooks = {
  useDashboard: useAIDashboard,
  useSimplifiedData: useAISimplifiedData,
  useCopilot: useAICopilot,
  useGenerateContent: useAIGenerateContent,
  useReviewContent: useAIReviewContent,
  useExecuteAction: useAIExecuteAction,
  useAdminAgent: useAIAdminAgent,
  useAdminAgentExecute: useAIAdminAgentExecute,
  useAssistants: useAIAssistants,
  useAssistant: useAIAssistant,
  useUpdateAssistant: useAIUpdateAssistant,
  useToggleAssistant: useAIToggleAssistant,
  useTestAssistant: useAITestAssistant,
  useContentReview: useAIContentReview,
  useReviewItem: useAIReviewItem,
  useReviewDecide: useAIReviewDecide,
  useReassignReview: useAIReassignReview,
  useAILogs,
  useModeration: useAIModeration,
  useDecideModeration: useAIDecideModeration,
  useModerationRules: useAIModerationRules,
  useUpsertModerationRule: useAIUpsertModerationRule,
  useToggleModerationRule: useAIToggleModerationRule,
} as const;