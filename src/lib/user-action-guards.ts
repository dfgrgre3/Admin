export type DangerousUserAction = "delete" | "suspend" | "ban" | "impersonate" | "reset-password" | "role-change";

export interface UserActionActor {
  id: string;
  role: string;
}

export interface UserActionTarget {
  id: string;
  role: string;
}

const ROLE_RANK: Record<string, number> = {
  STUDENT: 0,
  TEACHER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function getUserActionBlockReason(
  actor: UserActionActor | null | undefined,
  target: UserActionTarget,
  action: DangerousUserAction,
): string | null {
  if (!actor) return "يجب تسجيل الدخول لتنفيذ هذا الإجراء";
  if (actor.id === target.id) {
    const labels: Record<DangerousUserAction, string> = {
      delete: "حذف",
      suspend: "إيقاف",
      ban: "حظر",
      impersonate: "انتحال هوية",
      "reset-password": "إعادة تعيين كلمة مرور",
      "role-change": "تغيير دور",
    };
    return `لا يمكنك ${labels[action]} حسابك الحالي`;
  }
  const actorRank = ROLE_RANK[actor.role] ?? -1;
  const targetRank = ROLE_RANK[target.role] ?? Number.POSITIVE_INFINITY;
  if (actorRank < targetRank) {
    return "لا يمكن إدارة حساب أعلى منك صلاحية";
  }
  if (actorRank === targetRank && actor.role === "ADMIN") {
    return "لا يمكن تنفيذ هذا الإجراء على مدير بنفس مستوى صلاحيتك";
  }
  if (actorRank === targetRank && target.role === "SUPER_ADMIN") {
    return "لا يمكن تنفيذ إجراء حساس على مدير أعلى آخر";
  }
  return null;
}

export function canAssignRole(actorRole: string, targetRole: string): boolean {
  const actorRank = ROLE_RANK[actorRole] ?? -1;
  const targetRank = ROLE_RANK[targetRole] ?? Number.POSITIVE_INFINITY;
  return actorRank >= targetRank;
}
