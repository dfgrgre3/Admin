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
} from './types';

// ─── مفاتيح Cache موحدة ──────────────────────────────────

export const aiKeys = {
  all: ['ai'] as const,
  dashboard: ['ai', 'dashboard'] as const,
  simplified: ['ai', 'simplified'] as const,
  suggestions: (context?: string) => ['ai', 'suggestions', context] as const,
  tips: ['ai', 'tips'] as const,
  recommendations: ['ai', 'recommendations'] as const,
  chat: (conversationId?: string) => ['ai', 'chat', conversationId] as const,
  agent: ['ai', 'agent'] as const,
} as const;

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

export const aiHooks = {
  useDashboard: useAIDashboard,
  useSimplifiedData: useAISimplifiedData,
  useCopilot: useAICopilot,
  useGenerateContent: useAIGenerateContent,
  useReviewContent: useAIReviewContent,
  useExecuteAction: useAIExecuteAction,
  useAdminAgent: useAIAdminAgent,
  useAdminAgentExecute: useAIAdminAgentExecute,
} as const;