import { z } from "zod";
import { UserRole, UserStatus } from "@/types/enums";

export const createUserSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل"),
  lastName: z.string().min(2, "اسم العائلة يجب أن يكون حرفين على الأقل"),
  username: z
    .string()
    .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
    .optional()
    .or(z.literal("")),
  email: z.string().email("صيغة البريد الإلكتروني غير صالحة"),
  phone: z.string().min(8, "رقم الهاتف قصير جداً").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/[A-Za-z]/, "يجب أن تحتوي كلمة المرور على حروف")
    .regex(/\d/, "يجب أن تحتوي كلمة المرور على أرقام"),
  role: z.enum([
    "STUDENT",
    "TEACHER",
    "ADMIN",
    "MODERATOR",
    "SUPPORT",
    "SUPER_ADMIN",
  ]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]),
  country: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional().or(z.literal("")),
  language: z.string().optional().or(z.literal("")),
  timezone: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "النبذة يجب ألا تتجاوز 500 حرف").optional().or(z.literal("")),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;

export const roleOptions = [
  { value: UserRole.STUDENT, label: "طالب" },
  { value: UserRole.TEACHER, label: "معلم" },
  { value: UserRole.PARENT, label: "ولي أمر" },
  { value: UserRole.MODERATOR, label: "مشرف" },
  { value: UserRole.SUPPORT, label: "دعم فني" },
  { value: UserRole.ADMIN, label: "مدير" },
] as const;

export const statusOptions = [
  { value: UserStatus.ACTIVE, label: "نشط" },
  { value: UserStatus.INACTIVE, label: "غير نشط" },
  { value: UserStatus.SUSPENDED, label: "موقوف" },
  { value: UserStatus.PENDING_VERIFICATION, label: "قيد التحقق" },
] as const;

export const genderOptions = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
  { value: "other", label: "آخر" },
] as const;

export const languageOptions = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "الإنجليزية" },
  { value: "fr", label: "الفرنسية" },
] as const;

export const AVATAR_MAX_SIZE_MB = 5;
export const AVATAR_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const createUserDefaultValues: CreateUserValues = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  role: UserRole.STUDENT,
  status: UserStatus.ACTIVE,
  country: "",
  city: "",
  dateOfBirth: "",
  gender: "",
  language: "ar",
  timezone: "Africa/Cairo",
  bio: "",
};