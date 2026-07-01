/**
 * وحدة الذكاء الاصطناعي الموحدة
 * Unified AI Module - الواجهة الرئيسية لجميع خدمات AI
 *
 * @example
 * ```tsx
 * // استخدام العميل المباشر
 * import { aiClient } from '@/lib/ai';
 * const response = await aiClient.copilot('أنشئ اختباراً');
 *
 * // استخدام الـ hooks
 * import { useAICopilot, useAIDashboard } from '@/lib/ai';
 * const { data } = useAIDashboard();
 * const copilot = useAICopilot();
 * ```
 */

// ─── العميل الموحد ────────────────────────────────────────
export { aiClient, default as defaultAIClient } from './ai-client';

// ─── Hooks الموحدة ────────────────────────────────────────
export {
  useAIDashboard,
  useAISimplifiedData,
  useAICopilot,
  useAIGenerateContent,
  useAIReviewContent,
  useAIExecuteAction,
  aiHooks,
  aiKeys,
} from './ai-hooks';

// ─── مزود OpenRouter ─────────────────────────────────────
export {
  openrouterChat,
  extractReply,
  getOpenRouterApiKey,
} from './providers/openrouter';
export type {
  OpenRouterConfig,
  OpenRouterMessage,
  OpenRouterChoice,
  OpenRouterResponse,
} from './providers/openrouter';

// ─── الأنواع الموحدة ──────────────────────────────────────
export type {
  AIProvider,
  AIProviderConfig,
  AIMessageRole,
  AIMessage,
  AIConversation,
  AIActionType,
  AIContentType,
  AIRequestBase,
  AICopilotRequest,
  AIGenerateContentRequest,
  AIReviewContentRequest,
  AIExecuteActionRequest,
  AIChatRequest,
  AIRequest,
  AIResponse,
  AICopilotResponse,
  AIGenerateContentResponse,
  Subject,
  ReviewItem,
  RiskLevel,
  RiskStudent,
  GradingItem,
  ForecastItem,
  AiSummary,
  AiDashboardData,
  RiskStudentSimple,
  AdminAiPayload,
} from './types';