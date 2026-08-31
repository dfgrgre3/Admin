"use client";

import {
  Ban, CheckCircle, Edit2, Key, LogIn, LogOut, Plus, RefreshCw, Settings, Shield, Trash2, User, UserCog,
} from "lucide-react";
import type { ComponentType } from "react";

export interface ActionMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  className: string;
}

export const ACTION_META: Record<string, ActionMeta> = {
  CREATE_USER_NOTE:      { label: "إضافة ملاحظة",     icon: Plus,        className: "text-green-500" },
  UPDATE_USER_NOTE:      { label: "تعديل ملاحظة",     icon: Edit2,       className: "text-blue-500" },
  DELETE_USER_NOTE:      { label: "حذف ملاحظة",       icon: Trash2,      className: "text-red-500" },
  SUSPEND_USER:          { label: "تعليق الحساب",     icon: Ban,         className: "text-orange-500" },
  ACTIVATE_USER:         { label: "تفعيل الحساب",     icon: CheckCircle, className: "text-green-500" },
  BAN_USER:              { label: "حظر الحساب",       icon: Ban,         className: "text-red-500" },
  RESTORE_USER:          { label: "استعادة الحساب",   icon: RefreshCw,   className: "text-green-500" },
  ASSIGN_ROLE:           { label: "تغيير الدور",      icon: UserCog,     className: "text-purple-500" },
  CHANGE_ROLE:           { label: "تغيير الدور",      icon: UserCog,     className: "text-purple-500" },
  ADD_PERMISSION:        { label: "منح صلاحية",       icon: Shield,      className: "text-yellow-500" },
  REMOVE_PERMISSION:     { label: "سحب صلاحية",       icon: Shield,      className: "text-yellow-500" },
  RESET_PASSWORD:        { label: "تغيير كلمة المرور", icon: Key,        className: "text-blue-500" },
  TERMINATE_SESSION:     { label: "إنهاء جلسة",       icon: LogOut,      className: "text-gray-500" },
  TERMINATE_ALL_SESSIONS:{ label: "إنهاء كل الجلسات", icon: LogOut,      className: "text-gray-500" },
  VERIFY_EMAIL:          { label: "توثيق البريد",     icon: CheckCircle, className: "text-green-500" },
  VERIFY_PHONE:          { label: "توثيق الهاتف",     icon: CheckCircle, className: "text-green-500" },
  LOGIN:                 { label: "تسجيل دخول",       icon: LogIn,       className: "text-green-500" },
  LOGOUT:                { label: "تسجيل خروج",       icon: LogOut,      className: "text-gray-500" },
  IMPERSONATE:           { label: "تبديل هوية",       icon: User,        className: "text-purple-500" },
};

export function getActionMeta(action: string): ActionMeta {
  return ACTION_META[action] ?? { label: action, icon: Settings, className: "text-gray-500" };
}

export function tryParseJson(value: string): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}