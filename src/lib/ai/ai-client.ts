/**
 * عميل الذكاء الاصطناعي الموحد
 * Unified AI Client - النقطة المركزية لجميع استدعاءات AI
 * يدعم: الاتصال عبر الـ Backend OR الاتصال المباشر بـ OpenRouter
 */
import type {
  AIResponse,
  AICopilotResponse,
  AIGenerateContentResponse,
  AiDashboardData,
  AdminAiPayload,
  AIContentType,
  AIProvider,
} from './types';
import { adminFetch } from '@/lib/api/admin-api';
import { apiClient } from '@/lib/api/api-client';
import { apiRoutes } from '@/lib/api/routes';
import { openrouterChat, extractReply, getOpenRouterApiKey } from './providers/openrouter';

/** الموديل الافتراضي - يتزامن مع .env */
export const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-oss-120b:free';

// ─── تكوين AI ─────────────────────────────────────────────

interface AIClientConfig {
  /** وضع التشغيل: 'proxy' للخادم الخلفي، 'direct' للاتصال المباشر بـ OpenRouter */
  mode: 'proxy' | 'direct';
  /** مزود AI الافتراضي */
  defaultProvider: AIProvider;
  /** المهلة الزمنية الافتراضية (ملي ثانية) */
  timeout: number;
  /** عدد مرات إعادة المحاولة */
  retries: number;
  /** مفتاح OpenRouter API */
  openRouterApiKey?: string;
  /** الموديل الافتراضي لـ OpenRouter */
  openRouterModel?: string;
  /** تفعيل سجل الأخطاء */
  debug: boolean;
}

/**
 * قراءة إعدادات AI من متغيرات البيئة
 */
function getEnvConfig(): Partial<AIClientConfig> {
  const envConfig: Partial<AIClientConfig> = {};

  // وضع التشغيل
  if (typeof window === 'undefined') {
    // Server-side فقط
    const mode = process.env.AI_MODE;
    if (mode === 'direct' || mode === 'proxy') {
      envConfig.mode = mode;
    }
    const model = process.env.OPENROUTER_MODEL;
    if (model) {
      envConfig.openRouterModel = model;
    }
  }

  return envConfig;
}

const DEFAULT_CONFIG: AIClientConfig = {
  mode: 'proxy', // الوضع الافتراضي: عبر الـ Backend (المفتاح على الخادم فقط)
  defaultProvider: 'openai',
  timeout: 60000,
  retries: 2,
  openRouterModel: DEFAULT_OPENROUTER_MODEL,
  debug: false,
};

// ─── عميل AI الموحد ───────────────────────────────────────

class UnifiedAIClient {
  private config: AIClientConfig;

  constructor(config: Partial<AIClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...getEnvConfig(), ...config };
    // كشف مفتاح OpenRouter من البيئة تلقائياً
    if (!this.config.openRouterApiKey) {
      const envKey = getOpenRouterApiKey();
      if (envKey) {
        this.config.openRouterApiKey = envKey;
      }
    }
  }

  /** تحديث الإعدادات */
  configure(config: Partial<AIClientConfig>): void {
    this.config = { ...this.config, ...config };
    if (!this.config.openRouterApiKey) {
      const envKey = getOpenRouterApiKey();
      if (envKey) {
        this.config.openRouterApiKey = envKey;
      }
    }
  }

  /** التبديل بين وضع الـ proxy والاتصال المباشر */
  setMode(mode: 'proxy' | 'direct'): void {
    this.config.mode = mode;
  }

  /** هل العميل جاهز للاتصال المباشر؟ */
  get isDirectReady(): boolean {
    return !!this.config.openRouterApiKey;
  }

  // ── المساعد الذكي (Copilot) ──────────────────────────

  /**
   * إرسال استفسار إلى المساعد الذكي
   * إذا كان mode = 'direct'، يتصل مباشرة بـ OpenRouter
   */
  async copilot(prompt: string, context?: Record<string, unknown>): Promise<AICopilotResponse> {
    // الاتصال المباشر بـ OpenRouter
    if (this.config.mode === 'direct') {
      return this.directCopilot(prompt);
    }

    // الاتصال عبر الـ Backend Proxy
    const response = await adminFetch(apiRoutes.admin.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'copilot',
        prompt,
        context,
        provider: this.config.defaultProvider,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'فشل الاتصال بالمساعد الذكي' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * مساعد ذكي عبر OpenRouter مباشر
   */
  private async directCopilot(prompt: string): Promise<AICopilotResponse> {
    if (!this.config.openRouterApiKey) {
      throw new Error('مفتاح OpenRouter غير مضبوط. الرجاء ضبط المفتاح في الإعدادات أولاً.');
    }

    const systemPrompt = `أنت مساعد ذكي متخصص في إدارة المنصات التعليمية. 
      اسمك "المساعد الإداري الذكي". 
      أنت تتحدث باللغة العربية الفصحى.
      تخصصك: تحليل أداء الطلاب، اقتراح تدخلات تعليمية، توليد خطط دراسية، إنشاء اختبارات.
      كن دقيقاً ومحترفاً في ردودك.`;

    const result = await openrouterChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      {
        apiKey: this.config.openRouterApiKey,
        model: this.config.openRouterModel,
      },
    );

    const message = extractReply(result);

    return { message };
  }

  // ── توليد المحتوى ────────────────────────────────────

  /**
   * توليد محتوى تعليمي باستخدام AI
   */
  async generateContent(params: {
    contentType: AIContentType;
    title: string;
    prompt: string;
    subjectId?: string | null;
  }): Promise<AIGenerateContentResponse> {
    // الاتصال المباشر بـ OpenRouter
    if (this.config.mode === 'direct') {
      return this.directGenerateContent(params);
    }

    // الاتصال عبر الـ Backend Proxy
    const response = await adminFetch(apiRoutes.admin.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_content',
        ...params,
        provider: this.config.defaultProvider,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'فشل في توليد المحتوى');
    }

    return result;
  }

  private async directGenerateContent(params: {
    contentType: AIContentType;
    title: string;
    prompt: string;
    subjectId?: string | null;
  }): Promise<AIGenerateContentResponse> {
    if (!this.config.openRouterApiKey) {
      throw new Error('مفتاح OpenRouter غير مضبوط.');
    }

    const contentTypeLabels: Record<string, string> = {
      exam_blueprint: 'مخطط اختبار',
      curriculum_outline: 'مخطط منهج',
      article_draft: 'مسودة مقال',
      article: 'مقال تعليمي',
      update_suggestion: 'اقتراح تحسين المحتوى',
      lesson_summary: 'ملخص درس',
      learning_path: 'مسار تعليمي',
    };

    const systemPrompt = `أنت مولد محتوى تعليمي متخصص.
      المطلوب: ${contentTypeLabels[params.contentType] || params.contentType}
      العنوان: ${params.title}
      ${params.subjectId ? `المادة: ${params.subjectId}` : ''}
      
      قم بتوليد محتوى تعليمي احترافي باللغة العربية.
      يجب أن يكون المحتوى دقيقاً ومناسباً للفئة المستهدفة.`;

    const result = await openrouterChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: params.prompt },
      ],
      {
        apiKey: this.config.openRouterApiKey,
        model: this.config.openRouterModel,
      },
    );

    const message = extractReply(result);

    return {
      item: {
        id: crypto.randomUUID?.() || `gen-${Date.now()}`,
        title: params.title,
        type: params.contentType,
        preview: message.substring(0, 200),
      },
      message,
    };
  }

  // ── مراجعة المحتوى ──────────────────────────────────

  /**
   * اعتماد أو رفض محتوى مولّد
   */
  async reviewContent(id: string, decision: 'approve' | 'reject'): Promise<AIResponse> {
    const response = await adminFetch(apiRoutes.admin.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'review_content',
        id,
        decision,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'فشل في المراجعة');
    }

    return result;
  }

  // ── تنفيذ إجراء ─────────────────────────────────────

  /**
   * تنفيذ إجراء ذكي (مثل إرسال تنبيهات، توليد خطط مراجعة)
   */
  async executeAction(type: string, params: Record<string, unknown>): Promise<AIResponse> {
    const response = await adminFetch(apiRoutes.admin.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'execute_action',
        type,
        params,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || 'فشل تنفيذ الإجراء');
    }

    return result;
  }

  // ── جلب البيانات العامة للوحة التحكم ────────────────

  /**
   * الحصول على بيانات لوحة تحكم AI الكاملة
   */
  async getDashboardData(): Promise<AiDashboardData> {
    const response = await adminFetch(apiRoutes.admin.ai);
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error((errBody as any).error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  /**
   * الحصول على بيانات AI المبسطة (للمكونات الخفيفة مثل AiCommandCenter)
   */
  async getSimplifiedData(): Promise<AdminAiPayload> {
    return apiClient.get<AdminAiPayload>('/admin/ai');
  }
}

// ─── تصدير المثيل الوحيد (Singleton) ───────────────────────

export const aiClient = new UnifiedAIClient();
export default aiClient;