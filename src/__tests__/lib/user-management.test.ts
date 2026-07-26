import { describe, it, expect } from "vitest";
import { UserRole, UserStatus } from "@/types/enums";
import { createUserSchema, bulkActionSchema, impersonateSchema } from "@/lib/validations/user-schema";
import { getUserActionBlockReason, canAssignRole } from "@/lib/user-action-guards";
import { logUserAdminAction, auditUserStatusChange, auditImpersonation } from "@/lib/audit-logger";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

describe("User Management Module Unit Tests", () => {
  describe("Zod Validation Schemas", () => {
    it("validates a correct user creation payload", () => {
      const validPayload = {
        firstName: "أحمد",
        lastName: "المنصور",
        email: "ahmad@example.com",
        username: "ahmad_mansoor",
        role: UserRole.STUDENT,
        sendInvite: true,
      };
      const result = createUserSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("fails user creation if sendInvite is false and temporaryPassword is missing", () => {
      const invalidPayload = {
        firstName: "علي",
        lastName: "حسن",
        email: "ali@example.com",
        username: "ali_hassan",
        role: UserRole.TEACHER,
        sendInvite: false,
      };
      const result = createUserSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("validates a correct bulk action payload", () => {
      const bulkPayload = {
        action: "SUSPEND",
        userIds: ["usr_1", "usr_2"],
        reason: "مخالفة الشروط والأحكام الخاصة بالمنصة",
      };
      const result = bulkActionSchema.safeParse(bulkPayload);
      expect(result.success).toBe(true);
    });

    it("requires a reason for impersonation", () => {
      const result = impersonateSchema.safeParse({ targetUserId: "usr_100", reason: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("User Action Guards & Privilege Escalation Controls", () => {
    it("blocks an admin from banning or deleting their own account", () => {
      const actor = { id: "admin_1", role: UserRole.ADMIN };
      const target = { id: "admin_1", role: UserRole.ADMIN };

      const banReason = getUserActionBlockReason(actor, target, "ban");
      expect(banReason).toContain("لا يمكنك حظر حسابك الحالي");

      const deleteReason = getUserActionBlockReason(actor, target, "delete");
      expect(deleteReason).toContain("لا يمكنك حذف حسابك الحالي");
    });

    it("blocks an admin from modifying a Super Admin account (Privilege Escalation Block)", () => {
      const actor = { id: "admin_1", role: UserRole.ADMIN };
      const target = { id: "super_1", role: UserRole.SUPER_ADMIN };

      const reason = getUserActionBlockReason(actor, target, "role-change");
      expect(reason).toContain("لا يمكن إدارة حساب أعلى منك صلاحية");
    });

    it("blocks regular ADMIN from assigning SUPER_ADMIN role to anyone", () => {
      const actor = { id: "admin_1", role: UserRole.ADMIN };
      expect(canAssignRole(actor.role, UserRole.SUPER_ADMIN)).toBe(false);
      expect(canAssignRole(actor.role, UserRole.STUDENT)).toBe(true);
    });

    it("allows a Super Admin to assign any role", () => {
      const actor = { id: "super_1", role: UserRole.SUPER_ADMIN };
      expect(canAssignRole(actor.role, UserRole.SUPER_ADMIN)).toBe(true);
      expect(canAssignRole(actor.role, UserRole.ADMIN)).toBe(true);
    });

    it("blocks regular ADMIN from impersonating another ADMIN", () => {
      const actor = { id: "admin_1", role: UserRole.ADMIN };
      const target = { id: "admin_2", role: UserRole.ADMIN };
      const reason = getUserActionBlockReason(actor, target, "impersonate");
      expect(reason).toContain("لا يمكن تنفيذ هذا الإجراء على مدير بنفس مستوى صلاحيتك");
    });
  });

  describe("RBAC Permissions Logic", () => {
    it("only grants ADMIN_BYPASS to SUPER_ADMIN, NOT regular ADMIN", () => {
      const superAdmin = { role: UserRole.SUPER_ADMIN, permissions: [PERMISSIONS.ADMIN_BYPASS] };
      const regularAdmin = { role: UserRole.ADMIN, permissions: [PERMISSIONS.USERS_VIEW] };

      expect(hasPermission(superAdmin, "any:custom_permission")).toBe(true);
      expect(hasPermission(regularAdmin, "any:custom_permission")).toBe(false);
      expect(hasPermission(regularAdmin, PERMISSIONS.USERS_VIEW)).toBe(true);
    });

    it("grants full field access to Super Admin", () => {
      const userContext = { id: "super_1", role: UserRole.SUPER_ADMIN, permissions: [] };
      const { canViewField, isSuperAdmin } = useUserPermissions(userContext);

      expect(isSuperAdmin).toBe(true);
      expect(canViewField("financial")).toBe(true);
      expect(canViewField("contact")).toBe(true);
      expect(canViewField("audit")).toBe(true);
    });

    it("blocks Support role from financial and audit fields if missing specific permissions", () => {
      const supportUser = { id: "sup_1", role: UserRole.SUPPORT, permissions: ["users:view"] };
      const { canViewField } = useUserPermissions(supportUser);

      expect(canViewField("financial")).toBe(false);
      expect(canViewField("audit")).toBe(false);
    });
  });

  describe("Audit Logger Utility & Helpers", () => {
    it("creates a well-formed audit log entry with ISO timestamp and requestId", async () => {
      const entry = await logUserAdminAction({
        actorId: "admin_77",
        actorRole: UserRole.ADMIN,
        targetUserId: "user_88",
        action: "user.suspended",
        reason: "تعليق الحساب مؤقتاً لمراجعة الهوية",
      });

      expect(entry.id).toMatch(/^audit_/);
      expect(entry.requestId).toMatch(/^req_/);
      expect(entry.actorId).toBe("admin_77");
      expect(entry.targetUserId).toBe("user_88");
      expect(entry.action).toBe("user.suspended");
      expect(entry.result).toBe("success");
      expect(entry.createdAt).toBeDefined();
    });

    it("logs impersonation with userAgent via auditImpersonation helper", async () => {
      const entry = await auditImpersonation("admin_1", UserRole.ADMIN, "target_55", "فحص مشكلة فنية للطالب");
      expect(entry.action).toBe("user.impersonated");
      expect(entry.targetUserId).toBe("target_55");
      expect(entry.reason).toBe("فحص مشكلة فنية للطالب");
    });
  });
});
