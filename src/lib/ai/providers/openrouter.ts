/**
 * مزود OpenRouter للذكاء الاصطناعي
 * يتصل مباشرة بـ OpenRouter API (يدعم GPT-4o, Claude, Gemini وغيرها)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_URL = 'https://admin-lime-omega-38.vercel.app';
const SITE_NAME = 'Tolo Platform';

export interface OpenRouterConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterChoice {
  message: OpenRouterMessage;
  finish_reason: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: OpenRouterChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * الحصول على مفتاح OpenRouter من البيئة
 *
 * SECURITY: المفتاح يُقرأ من متغيرات البيئة على الخادم فقط ولا يجب أن
 * يُكشف للمتصفح أبداً. على جانب العميل تُرجع سلسلة فارغة لضمان عدم
 * استخدام الوضع المباشر (direct) من المتصفح.
 */
export function getOpenRouterApiKey(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.OPENROUTER_API_KEY || '';
}

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free'; // سريع ومناسب للتعليم

/**
 * إرسال طلب إلى OpenRouter والحصول على رد
 */
export async function openrouterChat(
  messages: OpenRouterMessage[],
  config: Partial<OpenRouterConfig> = {},
): Promise<OpenRouterResponse> {
  const apiKey = config.apiKey || getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error('مفتاح OpenRouter غير موجود. الرجاء إضافة المفتاح في الإعدادات.');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': SITE_URL,
      'X-Title': SITE_NAME,
    },
    body: JSON.stringify({
      model: config.model || DEFAULT_MODEL,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `OpenRouter API error (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  return response.json();
}

/**
 * تبسيط الاستجابة لنص فقط
 */
export function extractReply(response: OpenRouterResponse): string {
  return response.choices?.[0]?.message?.content || '';
}