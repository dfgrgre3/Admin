import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date with validation and error handling
 */
export function formatDate(date: Date | string | null | undefined): string {
  // Validate input
  if (!date) {
    return 'تاريخ غير صحيح';
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Validate date object
    if (isNaN(dateObj.getTime())) {
      return 'تاريخ غير صحيح';
    }

    return dateObj.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (_error) {
    return 'تاريخ غير صحيح';
  }
}

/**
 * Format date and time with validation and error handling
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  // Validate input
  if (!date) {
    return 'تاريخ غير صحيح';
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Validate date object
    if (isNaN(dateObj.getTime())) {
      return 'تاريخ غير صحيح';
    }

    return dateObj.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (_error) {
    return 'تاريخ غير صحيح';
  }
}

/**
 * Format relative time with validation and error handling
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  // Validate input
  if (!date) {
    return 'تاريخ غير صحيح';
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Validate date object
    if (isNaN(dateObj.getTime())) {
      return 'تاريخ غير صحيح';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    // Handle future dates
    if (diffInSeconds < 0) {
      const futureDiffInSeconds = Math.abs(diffInSeconds);
      if (futureDiffInSeconds < 60) {
        return "قريباً";
      }
      const futureDiffInMinutes = Math.floor(futureDiffInSeconds / 60);
      if (futureDiffInMinutes < 60) {
        return `خلال ${futureDiffInMinutes} دقيقة`;
      }
      return "في المستقبل";
    }

    if (diffInSeconds < 60) {
      return "الآن";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `منذ ${diffInDays} يوم`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `منذ ${diffInWeeks} أسبوع`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `منذ ${diffInMonths} شهر`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `منذ ${diffInYears} سنة`;
  } catch (_error) {
    return 'تاريخ غير صحيح';
  }
}

/**
 * Truncate text with validation
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  // Validate input
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Validate maxLength
  if (typeof maxLength !== 'number' || maxLength < 0) {
    return text;
  }

  if (text.length <= maxLength) {
    return text;
  }

  // Ensure we don't cut in the middle of a word if possible
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Generate unique ID with validation using cryptographically secure methods if available
 */
export function generateId(): string {
  try {
    if (typeof window !== 'undefined' && window.crypto && 'randomUUID' in window.crypto) {
      return window.crypto.randomUUID();
    }
    
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint32Array(2);
      window.crypto.getRandomValues(array);
      return array[0]!.toString(36) + array[1]!.toString(36);
    }
    
    // Fallback for environments without crypto
    const part1 = Math.random().toString(36).substring(2, 15);
    const part2 = Math.random().toString(36).substring(2, 15);
    return part1 + part2;
  } catch (_error) {
    // Final fallback to timestamp-based ID
    return `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

/**
 * Generate a cryptographically secure numeric PIN
 */
export function generateSecurePin(length: number = 6): string {
  if (!Number.isSafeInteger(length) || length < 1 || length > 15) {
    throw new RangeError('PIN length must be an integer between 1 and 15');
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error('A cryptographically secure random number generator is unavailable');
  }

  // Draw each decimal digit with rejection sampling. Values >= 250 are
  // discarded because 250 is divisible by 10, eliminating modulo bias.
  const digits: number[] = [];
  const bytes = new Uint8Array(Math.max(16, length * 2));
  while (digits.length < length) {
    cryptoApi.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= 250) continue;
      digits.push(byte % 10);
      if (digits.length === length) break;
    }
  }
  return digits.join('');
}

/**
 * Format number with consistent locale to avoid hydration errors
 */
export function formatNumber(number: number | string | null | undefined, decimals?: number): string {
  if (number === null || number === undefined) return "0";
  const num = typeof number === "string" ? parseFloat(number) : number;
  if (isNaN(num)) return "0";
  if (decimals !== undefined) {
    return num.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  return num.toLocaleString("en-US");
}

export function formatCurrency(amount: number | string | null | undefined, currency = "EGP"): string {
  const formatted = formatNumber(amount);
  return `${formatted} ${currency}`;
}

export function formatPercentage(value: number | string | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "0%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0%";
  return `${num.toFixed(decimals)}%`;
}

/**
 * Generate a cryptographically secure random float between 0 and 1
 */
export function getRandomFloat(): number {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0]! / 0xFFFFFFFF;
  }
  return Math.random();
}

/**
 * Format price with EGP suffix
 */
export function formatPrice(price: number | string | null | undefined): string {
  const formatted = formatNumber(price);
  return `${formatted} EGP`;
}

/**
 * Trims trailing slashes from a string without using regex (avoids ReDoS hotspots).
 */
export function trimTrailingSlashes(str: string): string {
  if (!str) return '';
  let cleaned = str;
  while (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}
