/**
 * Hooks موحدة للذكاء الاصطناعي
 * Unified AI Hooks - للاستخدام في كل مكونات React
 */
'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { aiClient } from './ai-client';
import type {
  AICopilotResponse,
  AIGenerateContentResponse,
  AIResponse,
  AiDashboardData,
  AdminAiPayload,
  AIContentType,
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

// ─── التصدير الموحد ──────────────────────────────────────

export const aiHooks = {
  useDashboard: useAIDashboard,
  useSimplifiedData: useAISimplifiedData,
  useCopilot: useAICopilot,
  useGenerateContent: useAIGenerateContent,
  useReviewContent: useAIReviewContent,
  useExecuteAction: useAIExecuteAction,
} as const;