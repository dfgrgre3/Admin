"use client";

import React from 'react';
import { m } from 'framer-motion';
import { Terminal, Search, Trash2, RefreshCw } from 'lucide-react';
import { adminFetch } from "@/lib/api/admin-api";

interface SecurityLog {
  id: string;
  eventType: string;
  userId: string | null;
  user?: { name: any; email: string } | null;
  ip: string;
  userAgent: string;
  location: string | null;
  metadata: string | null;
  createdAt: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

// Exact event types from the backend model (security_log.go)
const eventTypeLabels: Record<string, string> = {
  LOGIN_SUCCESS: "تسجيل دخول ناجح",
  LOGIN_FAILED: "محاولة دخول فاشلة",
  LOGOUT: "تسجيل خروج",
  REGISTER: "تسجيل مستخدم جديد",
  PASSWORD_CHANGE: "تغيير كلمة المرور",
  MAGIC_LINK_REQUESTED: "طلب رابط سحري",
  MAGIC_LINK_LOGIN: "دخول عبر رابط سحري",
  "2FA_ENABLED": "تفعيل المصادقة الثنائية",
  "2FA_DISABLED": "تعطيل المصادقة الثنائية",
  "2FA_FAILED": "فشل المصادقة الثنائية",
  EMAIL_VERIFIED: "تأكيد البريد الإلكتروني",
  PASSWORD_RESET_REQUESTED: "طلب إعادة تعيين كلمة المرور",
  PASSWORD_RESET_SUCCESS: "إعادة تعيين كلمة المرور بنجاح",
  DEVICE_TRUST_CHANGE: "تغيير ثقة الجهاز",
  SUSPICIOUS_ACTIVITY: "نشاط مشبوه",
  // legacy / fallback mappings
  LOGIN: "تسجيل دخول",
  FAILED_LOGIN: "محاولة دخول فاشلة",
  ACCOUNT_LOCKED: "قفل الحساب",
  ACCOUNT_UNLOCKED: "إلغاء قفل الحساب",
  TWO_FACTOR_ENABLED: "تفعيل 2FA",
  TWO_FACTOR_DISABLED: "تعطيل 2FA",
  SESSION_EXPIRED: "انتهاء الجلسة",
  API_ACCESS: "وصول API",
  PROFILE_UPDATE: "تعديل الملف الشخصي",
};

const getLevelForEventType = (eventType: string): string => {
  switch (eventType) {
    case 'LOGIN_FAILED':
    case 'FAILED_LOGIN':
    case '2FA_FAILED':
      return 'WARN';
    case 'SUSPICIOUS_ACTIVITY':
    case 'ACCOUNT_LOCKED':
      return 'ERROR';
    case 'API_ACCESS':
    case 'DEVICE_TRUST_CHANGE':
      return 'DEBUG';
    default:
      return 'INFO';
  }
};

const formatLogMessage = (log: SecurityLog): string => {
  const label = eventTypeLabels[log.eventType] || log.eventType;
  const parts: string[] = [`[${label}]`];

  parts.push(`ip=${log.ip}`);

  if (log.user) {
    const name = typeof log.user.name === 'string' ? log.user.name : (log.user.name ?? '');
    if (name) parts.push(`user=${name}`);
    if (log.user.email) parts.push(`<${log.user.email}>`);
  } else if (log.userId) {
    parts.push(`uid=${log.userId.slice(0, 8)}...`);
  }

  if (log.location) parts.push(`loc=${log.location}`);

  const ua = log.userAgent?.slice(0, 50);
  if (ua) parts.push(`ua=${ua}${log.userAgent?.length > 50 ? '…' : ''}`);

  return parts.join(' ');
};

export function PremiumLogViewer() {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [filter, setFilter] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminFetch("/api/admin/security/logs?limit=100");
      
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const errMsg = errBody?.error || errBody?.message || `خطأ ${response.status}: ${response.statusText}`;
        throw new Error(errMsg);
      }

      const resData = await response.json();
      const rawLogs: SecurityLog[] = resData?.data?.logs ?? [];

      const mapped: LogEntry[] = rawLogs
        .map((log) => {
          const dateValue = new Date(log.createdAt);
          return {
            timestamp: isNaN(dateValue.getTime())
              ? '??:??:??'
              : dateValue.toLocaleTimeString('ar-EG'),
            level: getLevelForEventType(log.eventType),
            message: formatLogMessage(log),
          };
        })
        .reverse(); // API returns DESC (latest first) → reverse so latest is at bottom

      setLogs(mapped);
    } catch (err: any) {
      setError(err?.message ?? 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15_000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // Auto-scroll to bottom on new logs
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = React.useMemo(
    () =>
      logs.filter(
        (log) =>
          log.message.toLowerCase().includes(filter.toLowerCase()) ||
          log.level.toLowerCase().includes(filter.toLowerCase())
      ),
    [logs, filter]
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="بحث في السجلات..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 text-gray-500 hover:text-white transition-all disabled:opacity-50"
            title="تحديث السجلات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setLogs([])}
            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 text-gray-500 hover:text-red-500 transition-all"
            title="مسح العرض الحالي"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="text-[11px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-xl break-all">
          ⚠ {error}
        </div>
      )}

      {/* Log terminal */}
      <div
        ref={scrollRef}
        className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[11px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 min-h-[300px]"
      >
        <div className="space-y-1">
          {filteredLogs.map((log, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex gap-4 group hover:bg-white/5 p-1 rounded transition-colors"
            >
              <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
              <span
                className={`font-bold shrink-0 w-12 ${
                  log.level === 'ERROR'
                    ? 'text-red-500'
                    : log.level === 'WARN'
                    ? 'text-yellow-500'
                    : log.level === 'DEBUG'
                    ? 'text-blue-500'
                    : 'text-green-500'
                }`}
              >
                {log.level}
              </span>
              <span className="text-gray-300 break-all">{log.message}</span>
            </m.div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[250px] gap-4 text-gray-600">
              <Terminal className="w-8 h-8 opacity-20" />
              <p>{loading ? 'جاري تحميل السجلات...' : 'لا توجد سجلات مطابقة'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
