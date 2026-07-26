import { z } from "zod";
import { UserRole, UserStatus } from "@/types/enums";

export const createUserFields = {
  firstName: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل").max(50),
  lastName: z.string().min(2, "اسم العائلة يجب أن يكون حرفين على الأقل").max(50),
  displayName: z.string().optional(),
  username: z.string().min(3, "اسم المستخدم يجب أن يحتوي 3 أحرف على الأقل").max(30).regex(/^[a-zA-Z0-9._-]+$/, "اسم المستخدم يحتوي أرقام وحروف إنجليزية فقط"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "رقم الهاتف غير صحيح").optional().or(z.literal("")),
  role: z.nativeEnum(UserRole, { required_error: "يرجى اختيار دور المستخدم" }),
  status: z.nativeEnum(UserStatus).default(UserStatus.PENDING_VERIFICATION),
  
  sendInvite: z.boolean().default(true),
  temporaryPassword: z.string().optional(),
  requirePasswordChange: z.boolean().default(true),

  country: z.string().optional(),
  city: z.string().optional(),
  gradeLevel: z.string().optional(),
  schoolId: z.string().optional(),
  parentId: z.string().optional(),
  companyId: z.string().optional(),

  groups: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  internalNote: z.string().optional(),
  creationReason: z.string().optional(),
};

export const createUserObject = z.object(createUserFields);

export const createUserSchema = createUserObject.refine((data) => {
  if (!data.sendInvite && !data.temporaryPassword) {
    return false;
  }
  return true;
}, {
  message: "يجب تحديد كلمة مرور مؤقتة في حال إلغاء تفعيل خيار إرسال الدعوة البريدية",
  path: ["temporaryPassword"],
});

export const updateUserSchema = createUserObject.partial().extend({
  id: z.string().min(1),
  statusReason: z.string().optional(),
});

export const bulkActionSchema = z.object({
  action: z.enum([
    "ACTIVATE",
    "DEACTIVATE",
    "SUSPEND",
    "BAN",
    "UNBAN",
    "DELETE",
    "CHANGE_ROLE",
    "ADD_TAGS",
    "REMOVE_TAGS",
    "ADD_GROUP",
    "SEND_INVITE",
    "RESET_PASSWORD",
    "TERMINATE_SESSIONS",
  ]),
  userIds: z.array(z.string()).min(1, "يرجى اختيار مستخدم واحد على الأقل"),
  reason: z.string().min(3, "سبب الإجراء الجماعي إجباري لحماية الأمان والـ Audit"),
  targetRole: z.nativeEnum(UserRole).optional(),
  tags: z.array(z.string()).optional(),
  groupId: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const impersonateSchema = z.object({
  targetUserId: z.string().min(1),
  reason: z.string().min(5, "سبب التقمص إجباري لمتابعة الأمان والتدقيق الإداري"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
export type ImpersonateInput = z.infer<typeof impersonateSchema>;
