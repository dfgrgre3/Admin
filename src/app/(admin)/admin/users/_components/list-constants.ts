import { UserRole, UserStatus } from "@/types/enums";

export const ROLE_TABS: Array<{ value: "all" | UserRole; label: string }> = [
  { value: "all", label: "كل المستخدمين" },
  { value: UserRole.STUDENT, label: "الطلاب" },
  { value: UserRole.PARENT, label: "أولياء الأمور" },
  { value: UserRole.TEACHER, label: "المعلمون" },
  { value: UserRole.MODERATOR, label: "المشرفون" },
  { value: UserRole.ADMIN, label: "المدراء" },
  { value: UserRole.SUPPORT, label: "الدعم الفني" },
  { value: UserRole.SUPER_ADMIN, label: "المدراء العامون" },
];

export const STATUS_TABS: Array<{ value: "all" | "NEW" | UserStatus; label: string; activeClass?: string }> = [
  { value: "all", label: "كل الحالات" },
  { value: "NEW", label: "جدد", activeClass: "data-[state=active]:bg-purple-500 data-[state=active]:text-white" },
  { value: UserStatus.ACTIVE, label: "نشط", activeClass: "data-[state=active]:bg-green-500 data-[state=active]:text-white" },
  { value: UserStatus.INACTIVE, label: "غير نشط", activeClass: "data-[state=active]:bg-slate-500 data-[state=active]:text-white" },
  { value: UserStatus.SUSPENDED, label: "موقوف", activeClass: "data-[state=active]:bg-yellow-500 data-[state=active]:text-white" },
  { value: UserStatus.BANNED, label: "محظور", activeClass: "data-[state=active]:bg-red-500 data-[state=active]:text-white" },
  { value: UserStatus.DELETED, label: "محذوف", activeClass: "data-[state=active]:bg-muted data-[state=active]:text-muted-foreground" },
  { value: UserStatus.PENDING_VERIFICATION, label: "قيد التحقق", activeClass: "data-[state=active]:bg-blue-500 data-[state=active]:text-white" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
  { value: "other", label: "آخر" },
];

export const VERIFIED_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "verified", label: "موثق" },
  { value: "unverified", label: "غير موثق" },
];

export const SUBSCRIPTION_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "ACTIVE", label: "اشتراك نشط" },
  { value: "EXPIRED", label: "منتهي" },
  { value: "CANCELLED", label: "ملغي" },
  { value: "NONE", label: "بدون اشتراك" },
];

export const ONLINE_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "online", label: "متصل الآن" },
  { value: "offline", label: "غير متصل" },
];

export const PAYMENT_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "PAID", label: "مدفوع" },
  { value: "OVERDUE", label: "متأخر عن السداد" },
  { value: "TRIAL", label: "فترة تجريبية" },
  { value: "NONE", label: "بدون دفع" },
];

export const COLUMN_LABELS: Record<string, string> = {
  select: "تحديد",
  name: "المستخدم",
  phone: "الهاتف",
  role: "الدور",
  country: "الدولة",
  createdAt: "تاريخ التسجيل",
  lastLogin: "آخر دخول",
  status: "الحالة",
  verification: "التوثيق",
  subscription: "الاشتراك",
  payment: "حالة الدفع",
  wallet: "الرصيد",
  counts: "الإحصائيات",
  totalXP: "نقاط التفاعل",
  actions: "الإجراءات",
};
