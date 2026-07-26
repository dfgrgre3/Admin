import { UserRole } from "@/types/enums";

export const PERMISSIONS = {
  /** Matches Go `PermAdminBypass` — grants all scoped permissions when present in effective list. */
  ADMIN_BYPASS: "admin:bypass",

  // Global / Dashboard
  DASHBOARD_VIEW: "dashboard:view",
  ANALYTICS_VIEW: "analytics:view",
  REPORTS_VIEW: "reports:view",

  // User Management
  USERS_VIEW: "users:view",
  USERS_MANAGE: "users:manage",
  USERS_VIEW_FINANCIAL: "users:view:financial",
  USERS_VIEW_CONTACT: "users:view:contact",
  USERS_VIEW_AUDIT_LOG: "users:view:audit_log",
  USERS_ADD_NOTE: "users:add:note",
  STUDENTS_VIEW: "students:view",

  // Content Management (Subjects, Books, Resources, Exams)
  SUBJECTS_VIEW: "subjects:view",
  SUBJECTS_MANAGE: "subjects:manage",
  OWN_SUBJECTS_MANAGE: "own_subjects:manage",
  LEARNING_PATHS_VIEW: "learning_paths:view",
  LEARNING_PATHS_MANAGE: "learning_paths:manage",

  BOOKS_VIEW: "books:view",
  BOOKS_MANAGE: "books:manage",
  OWN_BOOKS_MANAGE: "own_books:manage",

  RESOURCES_VIEW: "resources:view",
  RESOURCES_MANAGE: "resources:manage",
  OWN_RESOURCES_MANAGE: "own_resources:manage",

  EXAMS_VIEW: "exams:view",
  EXAMS_MANAGE: "exams:manage",
  OWN_EXAMS_MANAGE: "own_exams:manage",

  TEACHERS_VIEW: "teachers:view",
  TEACHERS_MANAGE: "teachers:manage",

  PARENTS_VIEW: "parents:view",
  PARENTS_MANAGE: "parents:manage",

  SEASONS_VIEW: "seasons:view",
  SEASONS_MANAGE: "seasons:manage",

  CHALLENGES_VIEW: "challenges:view",
  CHALLENGES_MANAGE: "challenges:manage",
  OWN_CHALLENGES_MANAGE: "own_challenges:manage",

  CONTESTS_VIEW: "contests:view",
  CONTESTS_MANAGE: "contests:manage",

  BLOG_VIEW: "blog:view",
  BLOG_MANAGE: "blog:manage",

  FORUM_VIEW: "forum:view",
  FORUM_MODERATE: "forum:moderate",
  FORUM_MANAGE: "forum:manage",

  COMMENTS_VIEW: "comments:view",
  COMMENTS_MODERATE: "comments:moderate",

  EVENTS_VIEW: "events:view",
  EVENTS_MANAGE: "events:manage",

  ANNOUNCEMENTS_VIEW: "announcements:view",
  ANNOUNCEMENTS_MANAGE: "announcements:manage",

  ACHIEVEMENTS_VIEW: "achievements:view",
  ACHIEVEMENTS_MANAGE: "achievements:manage",
  REWARDS_VIEW: "rewards:view",
  REWARDS_MANAGE: "rewards:manage",

  AI_MANAGE: "ai:manage",

  LIVE_MONITOR_VIEW: "live_monitor:view",

  MARKETING_VIEW: "marketing:view",
  MARKETING_MANAGE: "marketing:manage",
  AB_TESTING_VIEW: "ab_testing:view",

  SETTINGS_VIEW: "settings:view",
  // Note: SETTINGS_MANAGE is intentionally omitted - backend uses SETTINGS_VIEW for all settings operations
  AUDIT_LOGS_VIEW: "audit_logs:view",

  // Assignments / Homework
  ASSIGNMENTS_VIEW: "assignments:view",
  ASSIGNMENTS_MANAGE: "assignments:manage",
  OWN_ASSIGNMENTS_MANAGE: "own_assignments:manage",

  // Tax Management
  TAXES_VIEW: "taxes:view",
  TAXES_MANAGE: "taxes:manage",

  // Roles & Permissions Management
  ROLES_VIEW: "roles:view",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",
  ROLES_RESTORE: "roles:restore",
  ROLES_ASSIGN_PERMISSIONS: "roles:assign_permissions",
  ROLES_REMOVE_PERMISSIONS: "roles:remove_permissions",
  ROLES_ASSIGN_USERS: "roles:assign_users",
  ROLES_REMOVE_USERS: "roles:remove_users",
  PERMISSIONS_VIEW: "permissions:view",
  PERMISSIONS_MANAGE: "permissions:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Sidebar / legacy keys → Go permission string (same as `models` constants). */
const PERMISSION_KEY_ALIASES: Record<string, Permission> = {
  DASHBOARD_VIEW: PERMISSIONS.DASHBOARD_VIEW,
  ANALYTICS_VIEW: PERMISSIONS.ANALYTICS_VIEW,
  REPORTS_VIEW: PERMISSIONS.REPORTS_VIEW,
  USERS_VIEW: PERMISSIONS.USERS_VIEW,
  USERS_MANAGE: PERMISSIONS.USERS_MANAGE,
  STUDENTS_VIEW: PERMISSIONS.STUDENTS_VIEW,
  TEACHERS_VIEW: PERMISSIONS.TEACHERS_VIEW,
  TEACHERS_MANAGE: PERMISSIONS.TEACHERS_MANAGE,
  SUBJECTS_VIEW: PERMISSIONS.SUBJECTS_VIEW,
  SUBJECTS_MANAGE: PERMISSIONS.SUBJECTS_MANAGE,
  LEARNING_PATHS_VIEW: PERMISSIONS.LEARNING_PATHS_VIEW,
  LEARNING_PATHS_MANAGE: PERMISSIONS.LEARNING_PATHS_MANAGE,
  BOOKS_VIEW: PERMISSIONS.BOOKS_VIEW,
  EXAMS_VIEW: PERMISSIONS.EXAMS_VIEW,
  RESOURCES_VIEW: PERMISSIONS.RESOURCES_VIEW,
  AI_MANAGE: PERMISSIONS.AI_MANAGE,
  CHALLENGES_VIEW: PERMISSIONS.CHALLENGES_VIEW,
  CHALLENGES_MANAGE: PERMISSIONS.CHALLENGES_MANAGE,
  ACHIEVEMENTS_VIEW: PERMISSIONS.ACHIEVEMENTS_VIEW,
  REWARDS_VIEW: PERMISSIONS.REWARDS_VIEW,
  SEASONS_VIEW: PERMISSIONS.SEASONS_VIEW,
  MARKETING_VIEW: PERMISSIONS.MARKETING_VIEW,
  AB_TESTING_VIEW: PERMISSIONS.AB_TESTING_VIEW,
  ANNOUNCEMENTS_VIEW: PERMISSIONS.ANNOUNCEMENTS_VIEW,
  FORUM_VIEW: PERMISSIONS.FORUM_VIEW,
  BLOG_VIEW: PERMISSIONS.BLOG_VIEW,
  EVENTS_VIEW: PERMISSIONS.EVENTS_VIEW,
  CONTESTS_VIEW: PERMISSIONS.CONTESTS_VIEW,
  LIVE_MONITOR_VIEW: PERMISSIONS.LIVE_MONITOR_VIEW,
  AUDIT_LOGS_VIEW: PERMISSIONS.AUDIT_LOGS_VIEW,
  SETTINGS_VIEW: PERMISSIONS.SETTINGS_VIEW,
  /**
   * Legacy sidebar key — mapped to SETTINGS_VIEW because backend uses
   * `settings:view` (PermSettingsView) for both viewing and managing settings.
   * The backend does not have a separate `settings:manage` permission.
   */
  SETTINGS_MANAGE: PERMISSIONS.SETTINGS_VIEW,
};

export function resolvePermissionInput(
  key: Permission | string,
): Permission | null {
  if (typeof key === "string" && key.includes(":")) {
    return key as Permission;
  }
  const alias = PERMISSION_KEY_ALIASES[String(key)];
  if (alias) return alias;
  const fromConstants = (PERMISSIONS as Record<string, string>)[String(key)];
  if (fromConstants && fromConstants.includes(":")) {
    return fromConstants as Permission;
  }
  return null;
}

export function permissionGrantMatches(grant: string, required: Permission | string): boolean {
  const req = String(required);
  if (grant === req || grant === PERMISSIONS.ADMIN_BYPASS) return true;
  if (grant === "own_subjects:manage" && (req === "subjects:manage" || req === "subjects:view" || req === "learning_paths:manage" || req === "learning_paths:view")) return true;
  if (grant === "subjects:manage" && (req === "subjects:manage" || req === "subjects:view" || req === "learning_paths:manage" || req === "learning_paths:view")) return true;
  if (grant === "subjects:view" && (req === "subjects:view" || req === "learning_paths:view")) return true;
  if (grant === "own_books:manage" && (req === "books:manage" || req === "books:view")) return true;
  if (grant === "own_resources:manage" && (req === "resources:manage" || req === "resources:view")) return true;
  if (grant === "own_exams:manage" && (req === "exams:manage" || req === "exams:view")) return true;
  if (grant === "own_challenges:manage" && (req === "challenges:manage" || req === "challenges:view")) return true;
  if (grant === "*:manage") return req.endsWith(":manage");
  if (grant.length > 2 && grant.endsWith(":*")) {
    const mod = grant.slice(0, -2);
    return req.startsWith(`${mod}:`);
  }
  return false;
}

function getEffectivePermissionStrings(user: {
  role: string;
  permissions?: string[] | null;
}): string[] {
  const fromApi = user.permissions;
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    return fromApi;
  }
  const role = user.role as UserRole;
  return [...(DEFAULT_ROLE_PERMISSIONS[role] || [])];
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [PERMISSIONS.ADMIN_BYPASS],

  SUPER_ADMIN: [PERMISSIONS.ADMIN_BYPASS],

  MODERATOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.TEACHERS_VIEW,
    PERMISSIONS.PARENTS_VIEW,
    PERMISSIONS.SUBJECTS_VIEW,
    PERMISSIONS.LEARNING_PATHS_VIEW,
    PERMISSIONS.LEARNING_PATHS_MANAGE,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.FORUM_VIEW,
    PERMISSIONS.FORUM_MODERATE,
    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.COMMENTS_MODERATE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.LIVE_MONITOR_VIEW,
    PERMISSIONS.MARKETING_VIEW,
  ],

  SUPPORT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.TEACHERS_VIEW,
    PERMISSIONS.PARENTS_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW,
  ],

  TEACHER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.SUBJECTS_VIEW,
    PERMISSIONS.LEARNING_PATHS_VIEW,
    PERMISSIONS.OWN_SUBJECTS_MANAGE,
    PERMISSIONS.BOOKS_VIEW,
    PERMISSIONS.OWN_BOOKS_MANAGE,
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.OWN_RESOURCES_MANAGE,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.OWN_EXAMS_MANAGE,
    PERMISSIONS.CHALLENGES_VIEW,
    PERMISSIONS.OWN_CHALLENGES_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
  ],

  PARENT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PARENTS_VIEW,
  ],

  STUDENT: [],
};

/**
 * Effective permissions come from `/api/auth/me` (`GetEffectivePermissions` in Go).
 * Falls back to `DEFAULT_ROLE_PERMISSIONS` only when the API list is empty (e.g. stale cache).
 */
export function hasPermission(
  user: { role: string; permissions?: string[] | null } | null,
  permission: Permission | string,
): boolean {
  if (!user) return false;

  const required = resolvePermissionInput(permission);
  if (!required) return false;

  for (const grant of getEffectivePermissionStrings(user)) {
    if (permissionGrantMatches(grant, required)) return true;
  }
  return false;
}

// ─────────────────────────────────────────────
//  Field-Level Permissions (FLP)
//  Frontend-only: there is no Go counterpart enforcing field visibility,
//  so this is a UI convenience, not a security boundary — the API may
//  still return these fields to any caller.
// ─────────────────────────────────────────────

export type FieldGroup = "financial" | "grades" | "contact" | "auth_secrets" | "behavioral";

export const FIELD_GROUPS: Record<FieldGroup, string[]> = {
  financial: [
    "balance", "aiCredits", "examCredits", "activeSubscriptionId",
    "subscriptionExpiresAt", "payments", "walletTransactions", "paymobOrderId",
    "externalTxnId", "reference", "method", "amount", "currency", "pdfUrl", "invoiceNumber",
  ],
  grades: [
    "examResults", "totalXP", "level", "currentStreak", "longestStreak",
    "examsPassed", "studyXP", "taskXP", "examXP", "challengeXP", "questXP",
    "seasonXP", "tasksCompleted", "score", "grade", "percentage",
  ],
  contact: [
    "email", "phone", "alternativePhone", "city", "country", "dateOfBirth",
    "gender", "school", "address",
  ],
  auth_secrets: [
    "passwordHash", "twoFactorSecret", "backupCodes", "resetPasswordToken",
    "resetPasswordExpires", "magicLinkToken", "magicLinkExpires",
    "verificationToken", "verificationExpires", "phoneVerificationOtp",
  ],
  behavioral: [],
};

/** Human-readable Arabic labels for field groups (shown in UI badges). */
export const FIELD_GROUP_LABELS: Record<FieldGroup, string> = {
  financial: "البيانات المالية",
  grades: "الدرجات والتقييمات",
  contact: "بيانات التواصل",
  auth_secrets: "أسرار المصادقة",
  behavioral: "النشاط السلوكي",
};

const FIELD_TO_GROUP: Record<string, FieldGroup> = (() => {
  const map: Record<string, FieldGroup> = {};
  (Object.keys(FIELD_GROUPS) as FieldGroup[]).forEach((g) => {
    FIELD_GROUPS[g].forEach((f) => (map[f] = g));
  });
  return map;
})();

/** Default visible field groups per role (mirrors Go DefaultFieldGroupsPerRole). */
const DEFAULT_FIELD_GROUPS: Record<string, FieldGroup[]> = {
  ADMIN: ["financial", "grades", "contact", "auth_secrets", "behavioral"],
  SUPER_ADMIN: ["financial", "grades", "contact", "auth_secrets", "behavioral"],
  MODERATOR: ["grades", "contact", "behavioral"],
  SUPPORT: ["contact", "behavioral"],
  TEACHER: ["grades", "contact", "behavioral"],
  PARENT: ["grades", "contact", "behavioral"],
  STUDENT: [],
};

/**
 * Reports whether the current viewer may see a specific JSON field.
 * Non-sensitive fields are always visible. ADMIN/SUPER_ADMIN see everything.
 * `fieldOverrides` is the per-user JSONB override from the backend, if any.
 */
export function canViewField(
  field: string,
  role: string | undefined,
  fieldOverrides?: Partial<Record<FieldGroup, boolean>> | null,
): boolean {
  const group = FIELD_TO_GROUP[field];
  if (!group) return true; // non-sensitive field

  const r = (role ?? "").toUpperCase();
  if (r === "ADMIN" || r === "SUPER_ADMIN") return true;

  let visibleGroups = DEFAULT_FIELD_GROUPS[r] ?? [];
  if (fieldOverrides) {
    visibleGroups = visibleGroups.filter((g) => fieldOverrides[g] !== false);
    (Object.keys(fieldOverrides) as FieldGroup[]).forEach((g) => {
      if (fieldOverrides[g] && !visibleGroups.includes(g)) visibleGroups.push(g);
    });
  }
  return visibleGroups.includes(group);
}
