import { UserRole } from "@/types/enums";

export const PERMISSIONS = {
  /** Matches Go `PermAdminBypass` — grants all scoped permissions when present in effective list. */
  ADMIN_BYPASS: "admin:bypass",

  /**
   * Sentinel marker (matches Go `PermPermissionsCustom`). When present in a
   * user's stored permissions array, the backend returns ONLY the stored
   * permissions without merging role defaults — enabling restrictive
   * per-user customization. The sentinel is filtered out of the effective
   * list and never matches any permission check.
   */
  PERMISSIONS_CUSTOM: "permissions:custom",

  // Super / System
  SYSTEM_MANAGE: "system:manage",
  SYSTEM_SETTINGS: "system:settings",

  // Global / Dashboard
  DASHBOARD_VIEW: "dashboard:view",
  ANALYTICS_VIEW: "analytics:view",
  REPORTS_VIEW: "reports:view",
  REPORTS_MANAGE: "reports:manage",

  // User Management
  USERS_VIEW: "users:view",
  USERS_MANAGE: "users:manage",
  USERS_VIEW_FINANCIAL: "users:view:financial",
  USERS_VIEW_CONTACT: "users:view:contact",
  USERS_VIEW_AUDIT_LOG: "users:view:audit_log",
  USERS_ADD_NOTE: "users:add:note",
  STUDENTS_VIEW: "students:view",
  STUDENTS_MANAGE: "students:manage",

  // Extended Users Management Hub Permissions
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  USERS_RESTORE: "users:restore",
  USERS_SUSPEND: "users:suspend",
  USERS_EXPORT: "users:export",
  USERS_IMPORT: "users:import",
  USERS_IMPERSONATE: "users:impersonate",
  USERS_ASSIGN_ROLES: "users:assign_roles",
  USERS_ASSIGN_PERMISSIONS: "users:assign_permissions",
  USERS_VIEW_SESSIONS: "users:view:sessions",
  USERS_VIEW_ACTIVITY: "users:view:activity",
  USERS_MANAGE_PASSWORD: "users:manage:password",
  USERS_MANAGE_VERIFICATION: "users:manage:verification",
  USERS_SEND_NOTIFICATIONS: "users:send:notifications",
  USERS_TERMINATE_SESSIONS: "users:terminate_sessions",
  USERS_MANAGE_WALLET: "users:manage:wallet",
  USERS_VIEW_SUBSCRIPTIONS: "users:view:subscriptions",
  USERS_VIEW_ORDERS: "users:view:orders",
  USERS_VIEW_CERTIFICATES: "users:view:certificates",
  USERS_VIEW_SUPPORT: "users:view:support",
  USERS_VIEW_LOGIN_HISTORY: "users:view:login_history",
  USERS_VIEW_DEVICES: "users:view:devices",

  // Content Management (Subjects, Books, Resources, Exams)
  SUBJECTS_VIEW: "subjects:view",
  SUBJECTS_CREATE: "subjects:create",
  SUBJECTS_UPDATE: "subjects:update",
  SUBJECTS_DELETE: "subjects:delete",
  SUBJECTS_MANAGE: "subjects:manage",
  SUBJECTS_PUBLISH: "subjects:publish",
  SUBJECTS_APPROVE: "subjects:approve",
  OWN_SUBJECTS_MANAGE: "own_subjects:manage",
  LEARNING_PATHS_VIEW: "learning_paths:view",
  LEARNING_PATHS_MANAGE: "learning_paths:manage",

  BOOKS_VIEW: "books:view",
  BOOKS_CREATE: "books:create",
  BOOKS_UPDATE: "books:update",
  BOOKS_DELETE: "books:delete",
  BOOKS_MANAGE: "books:manage",
  BOOKS_PUBLISH: "books:publish",
  OWN_BOOKS_MANAGE: "own_books:manage",

  RESOURCES_VIEW: "resources:view",
  RESOURCES_MANAGE: "resources:manage",
  RESOURCES_PUBLISH: "resources:publish",
  OWN_RESOURCES_MANAGE: "own_resources:manage",

  EXAMS_VIEW: "exams:view",
  EXAMS_CREATE: "exams:create",
  EXAMS_UPDATE: "exams:update",
  EXAMS_DELETE: "exams:delete",
  EXAMS_MANAGE: "exams:manage",
  EXAMS_APPROVE: "exams:approve",
  EXAMS_PUBLISH: "exams:publish",
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
  BLOG_CREATE: "blog:create",
  BLOG_UPDATE: "blog:update",
  BLOG_DELETE: "blog:delete",
  BLOG_MANAGE: "blog:manage",
  BLOG_PUBLISH: "blog:publish",

  FORUM_VIEW: "forum:view",
  FORUM_CREATE: "forum:create",
  FORUM_UPDATE: "forum:update",
  FORUM_DELETE: "forum:delete",
  FORUM_MODERATE: "forum:moderate",
  FORUM_MANAGE: "forum:manage",

  COMMENTS_VIEW: "comments:view",
  COMMENTS_CREATE: "comments:create",
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
  AI_USAGE: "ai:usage",

  LIVE_MONITOR_VIEW: "live_monitor:view",

  MARKETING_VIEW: "marketing:view",
  MARKETING_MANAGE: "marketing:manage",
  AB_TESTING_VIEW: "ab_testing:view",

  SETTINGS_VIEW: "settings:view",
  // Note: SETTINGS_MANAGE is intentionally omitted - backend uses SETTINGS_VIEW for all settings operations
  AUDIT_LOGS_VIEW: "audit_logs:view",

  // Support / Tickets
  TICKETS_VIEW: "tickets:view",
  TICKETS_CREATE: "tickets:create",
  TICKETS_UPDATE: "tickets:update",
  TICKETS_MANAGE: "tickets:manage",
  TICKETS_RESOLVE: "tickets:resolve",
  FAQS_MANAGE: "faqs:manage",

  // Parent Dashboard (Children)
  CHILDREN_VIEW: "children:view",
  CHILDREN_GRADES: "children:grades",
  CHILDREN_PROGRESS: "children:progress",
  CHILDREN_ATTENDANCE: "children:attendance",
  CHILDREN_COMMUNICATE: "children:communicate",
  CHILDREN_PAYMENT: "children:payment",

  // Notifications
  NOTIFICATIONS_SEND: "notifications:send",
  NOTIFICATIONS_MANAGE: "notifications:manage",

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
	if (grant.endsWith(":manage") && req === `${grant.slice(0, -":manage".length)}:view`) return true;
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

/**
 * The sentinel value that marks a user as having a custom (restrictive)
 * permission set. Must match Go `PermPermissionsCustom`.
 */
export const PERMISSIONS_CUSTOM_SENTINEL = "permissions:custom";

/**
 * Returns true when the user's stored permissions include the
 * `permissions:custom` sentinel, meaning their effective permissions are
 * exactly the stored set (no role defaults merged in).
 */
export function isCustomPermissionsMode(
  permissions: string[] | null | undefined,
): boolean {
  return Array.isArray(permissions) && permissions.includes(PERMISSIONS_CUSTOM_SENTINEL);
}

/**
 * Strips the `permissions:custom` sentinel from a permissions array.
 * Useful when displaying the real permissions to the user.
 */
export function stripPermissionsSentinel(
  permissions: string[] | null | undefined,
): string[] {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter((p) => p !== PERMISSIONS_CUSTOM_SENTINEL);
}

function getEffectivePermissionStrings(user: {
  role: string;
  permissions?: string[] | null;
}): string[] {
  const fromApi = user.permissions;
  // `/api/auth/me` always returns the effective permission set. An empty
  // array is meaningful: it can be a deliberately restrictive custom set.
  if (Array.isArray(fromApi)) {
    // The backend already filters the sentinel, but filter again here as a
    // safety net for stale/cached client state.
    return fromApi.filter((p) => p !== PERMISSIONS_CUSTOM_SENTINEL);
  }
  // A missing permission payload is never an invitation to infer privileges
  // from a role name. Fail closed until `/api/auth/me` supplies the database
  // backed effective permissions.
  return [];
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
    PERMISSIONS.SUBJECTS_APPROVE,
    PERMISSIONS.BOOKS_VIEW,
    PERMISSIONS.BOOKS_PUBLISH,
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.RESOURCES_PUBLISH,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.EXAMS_APPROVE,
    PERMISSIONS.EXAMS_PUBLISH,
    PERMISSIONS.CHALLENGES_VIEW,
    PERMISSIONS.CONTESTS_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_UPDATE,
    PERMISSIONS.BLOG_DELETE,
    PERMISSIONS.BLOG_PUBLISH,
    PERMISSIONS.FORUM_VIEW,
    PERMISSIONS.FORUM_CREATE,
    PERMISSIONS.FORUM_UPDATE,
    PERMISSIONS.FORUM_DELETE,
    PERMISSIONS.FORUM_MODERATE,
    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.COMMENTS_MODERATE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_MANAGE,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_MANAGE,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_MANAGE,
    PERMISSIONS.TICKETS_RESOLVE,
    PERMISSIONS.ACHIEVEMENTS_VIEW,
    PERMISSIONS.REWARDS_VIEW,
    PERMISSIONS.LIVE_MONITOR_VIEW,
    PERMISSIONS.MARKETING_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
  ],

  SUPPORT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.TEACHERS_VIEW,
    PERMISSIONS.PARENTS_VIEW,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_UPDATE,
    PERMISSIONS.TICKETS_MANAGE,
    PERMISSIONS.TICKETS_RESOLVE,
    PERMISSIONS.FAQS_MANAGE,
    PERMISSIONS.FORUM_VIEW,
    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.SETTINGS_VIEW,
  ],

  TEACHER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.SUBJECTS_VIEW,
    PERMISSIONS.OWN_SUBJECTS_MANAGE,
    PERMISSIONS.BOOKS_VIEW,
    PERMISSIONS.OWN_BOOKS_MANAGE,
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.OWN_RESOURCES_MANAGE,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.OWN_EXAMS_MANAGE,
    PERMISSIONS.CHALLENGES_VIEW,
    PERMISSIONS.OWN_CHALLENGES_MANAGE,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_UPDATE,
    PERMISSIONS.FORUM_VIEW,
    PERMISSIONS.FORUM_CREATE,
    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.ACHIEVEMENTS_VIEW,
    PERMISSIONS.REWARDS_VIEW,
    PERMISSIONS.AI_USAGE,
  ],

  PARENT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CHILDREN_VIEW,
    PERMISSIONS.CHILDREN_GRADES,
    PERMISSIONS.CHILDREN_PROGRESS,
    PERMISSIONS.CHILDREN_ATTENDANCE,
    PERMISSIONS.CHILDREN_COMMUNICATE,
    PERMISSIONS.CHILDREN_PAYMENT,
    PERMISSIONS.SUBJECTS_VIEW,
    PERMISSIONS.BOOKS_VIEW,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.FORUM_VIEW,
    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.ACHIEVEMENTS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
  ],

  STUDENT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SUBJECTS_VIEW,
    PERMISSIONS.BOOKS_VIEW,
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.CHALLENGES_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.FORUM_VIEW,
    PERMISSIONS.FORUM_CREATE,
    PERMISSIONS.COMMENTS_VIEW,
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.ACHIEVEMENTS_VIEW,
    PERMISSIONS.REWARDS_VIEW,
    PERMISSIONS.AI_USAGE,
  ],
};

/**
 * Effective permissions come exclusively from `/api/auth/me`
 * (`GetEffectivePermissions` in Go). A missing payload denies access.
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
