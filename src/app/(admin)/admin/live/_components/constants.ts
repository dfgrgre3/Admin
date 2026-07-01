import React from "react";
import {
   AlertTriangle,
   Eye,
   History,
   KeyRound,
   Lock,
   Mail,
   Scan,
   Shield,
   Siren,
   Terminal,
   Unlock,
   UserCheck,
   UserX,
   Wifi,
} from "lucide-react";

export interface ActiveUser {
   userId: string;
   user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar: string | null;
   };
   sessionId: string | null;
   lastAccessed: string;
   ip: string | null;
   deviceInfo: string | null;
   isActive: boolean;
   currentActivity: "online" | "studying" | "taking_exam";
   activityDetails: {
      type: string;
      subject?: { id: string; name: string; nameAr: string };
      exam?: { id: string; title: string; subject: { name: string; nameAr: string } };
      startTime?: string;
      takenAt?: string;
      duration?: number;
      score?: number;
   } | null;
}

export interface LiveStats {
   totalActive: number;
   studying: number;
   takingExam: number;
   online: number;
   byRole: {
      students: number;
      teachers: number;
      admins: number;
   };
}

export interface DeviceFingerprint {
   id: string;
   userId: string;
   userName: string;
   fingerprint: string;
   ip: string;
   userAgent: string;
   deviceType: string;
   lastSeen: string;
   isBlocked: boolean;
   blockReason: string | null;
   loginCount: number;
}

export interface RolePermission {
   id: string;
   name: string;
   description: string;
   permissions: string[];
   userCount: number;
}

export interface Session {
   id: string;
   userId: string;
   user?: { name: string; email: string; avatar: string | null };
   ip: string;
   userAgent: string;
   deviceInfo: string | null;
   location: string | null;
   isActive: boolean;
   status: string;
   lastAccessed: string;
   createdAt: string;
   expiresAt: string | null;
}

export interface IPWhitelistEntry {
   id: string;
   ip: string;
   label: string;
   isActive: boolean;
   createdAt: string;
   createdBy: string;
   expiresAt: string | null;
   reason: string;
}

export interface SecurityLog {
   id: string;
   eventType: string;
   userId: string | null;
   user?: { name: string; email: string } | null;
   ip: string;
   userAgent: string;
   location: string | null;
   metadata: string | null;
   createdAt: string;
}

export const STYLES = {
   glass: "admin-glass p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl relative overflow-hidden",
   glassCard: "admin-card p-6 flex flex-col gap-4 border border-white/5",
   statValue: "text-4xl font-black font-mono tracking-tighter",
   glowEffect: "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none",
};

export const activityConfig = {
   taking_exam: {
      label: "يؤدي امتحان",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500",
      shadowColor: "rgba(239,68,68,0.3)",
      icon: AlertTriangle,
   },
   studying: {
      label: "يدرس",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/50",
      icon: Eye,
   },
   online: {
      label: "متصل",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      icon: Wifi,
   },
} satisfies Record<ActiveUser["currentActivity"], {
   label: string;
   color: string;
   bgColor: string;
   borderColor: string;
   shadowColor?: string;
   icon: React.ElementType;
}>;

export const eventTypeLabels: Record<string, string> = {
   LOGIN: "تسجيل دخول",
   LOGIN_SUCCESS: "تسجيل دخول ناجح",
   LOGOUT: "تسجيل خروج",
   FAILED_LOGIN: "محاولة دخول فاشلة",
   LOGIN_FAILED: "محاولة دخول فاشلة",
   SUSPICIOUS_ACTIVITY: "نشاط مشبوه",
   ACCOUNT_LOCKED: "قفل الحساب",
   ACCOUNT_UNLOCKED: "إلغاء قفل الحساب",
   TWO_FACTOR_ENABLED: "تفعيل 2FA",
   TWO_FACTOR_DISABLED: "تعطيل 2FA",
   "2FA_ENABLED": "تفعيل المصادقة الثنائية",
   "2FA_DISABLED": "تعطيل المصادقة الثنائية",
   "2FA_FAILED": "فشل المصادقة الثنائية",
   PASSWORD_CHANGE: "تغيير كلمة المرور",
   EMAIL_CHANGE: "تحديث البريد",
   EMAIL_VERIFIED: "تأكيد البريد الإلكتروني",
   SESSION_EXPIRED: "انتهاء الجلسة",
   API_ACCESS: "وصول API",
   PROFILE_UPDATE: "تعديل الملف الشخصي",
   REGISTER: "تسجيل جديد",
   MAGIC_LINK_REQUESTED: "طلب رابط سحري",
   MAGIC_LINK_LOGIN: "دخول عبر رابط سحري",
   PASSWORD_RESET_REQUESTED: "طلب إعادة تعيين كلمة المرور",
   PASSWORD_RESET_SUCCESS: "إعادة تعيين كلمة المرور بنجاح",
   DEVICE_TRUST_CHANGE: "تغيير ثقة الجهاز",
};

export const eventTypeColors: Record<string, string> = {
   LOGIN: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
   LOGIN_SUCCESS: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
   LOGOUT: "bg-gray-500/10 text-gray-500 border-gray-500/20",
   FAILED_LOGIN: "bg-red-500/10 text-red-500 border-red-500/20",
   LOGIN_FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
   SUSPICIOUS_ACTIVITY: "bg-red-700/10 text-red-700 border-red-700/20",
   ACCOUNT_LOCKED: "bg-red-600/10 text-red-600 border-red-600/20",
   ACCOUNT_UNLOCKED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
   TWO_FACTOR_ENABLED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
   TWO_FACTOR_DISABLED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
   "2FA_ENABLED": "bg-purple-500/10 text-purple-500 border-purple-500/20",
   "2FA_DISABLED": "bg-orange-500/10 text-orange-500 border-orange-500/20",
   "2FA_FAILED": "bg-red-500/10 text-red-500 border-red-500/20",
   PASSWORD_CHANGE: "bg-yellow-600/10 text-yellow-600 border-yellow-600/20",
   EMAIL_CHANGE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
   EMAIL_VERIFIED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
   SESSION_EXPIRED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
   API_ACCESS: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
   PROFILE_UPDATE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
   REGISTER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
   MAGIC_LINK_REQUESTED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
   MAGIC_LINK_LOGIN: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
   PASSWORD_RESET_REQUESTED: "bg-yellow-600/10 text-yellow-600 border-yellow-600/20",
   PASSWORD_RESET_SUCCESS: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
   DEVICE_TRUST_CHANGE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export const eventTypeIcons: Record<string, React.ElementType> = {
   LOGIN: UserCheck,
   LOGIN_SUCCESS: UserCheck,
   LOGOUT: UserX,
   FAILED_LOGIN: AlertTriangle,
   LOGIN_FAILED: AlertTriangle,
   SUSPICIOUS_ACTIVITY: Siren,
   ACCOUNT_LOCKED: Lock,
   ACCOUNT_UNLOCKED: Unlock,
   TWO_FACTOR_ENABLED: Shield,
   TWO_FACTOR_DISABLED: AlertTriangle,
   "2FA_ENABLED": Shield,
   "2FA_DISABLED": AlertTriangle,
   "2FA_FAILED": AlertTriangle,
   PASSWORD_CHANGE: KeyRound,
   EMAIL_CHANGE: Mail,
   EMAIL_VERIFIED: Mail,
   SESSION_EXPIRED: History,
   API_ACCESS: Terminal,
   PROFILE_UPDATE: Scan,
   REGISTER: UserCheck,
   MAGIC_LINK_REQUESTED: Mail,
   MAGIC_LINK_LOGIN: UserCheck,
   PASSWORD_RESET_REQUESTED: KeyRound,
   PASSWORD_RESET_SUCCESS: KeyRound,
   DEVICE_TRUST_CHANGE: Scan,
};
