import { PERMISSIONS, Permission, DEFAULT_ROLE_PERMISSIONS } from "@/lib/permissions";
import { UserRole } from "@/types/enums";

/**
 * Permission metadata: Arabic label, description, category, and danger level.
 * This drives the permissions matrix UI and keeps all display strings in one place.
 */
export interface PermissionMeta {
  key: string;
  label: string;
  description: string;
  /** Whether this permission is considered dangerous (delete, manage, etc.) */
  dangerLevel: "safe" | "elevated" | "dangerous";
}

export interface PermissionCategory {
  id: string;
  label: string;
  icon: string;
  permissions: PermissionMeta[];
}

// ── Role metadata ──
export interface RoleMeta {
  role: UserRole;
  label: string;
  description: string;
  color: string;
  badgeClass: string;
  isSystem: boolean;
}

export const ROLE_METADATA: RoleMeta[] = [
  {
    role: UserRole.SUPER_ADMIN,
    label: "المدير العام",
    description: "صلاحيات كاملة غير محدودة على النظام بالكامل",
    color: "red",
    badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
    isSystem: true,
  },
  {
    role: UserRole.ADMIN,
    label: "مدير النظام",
    description: "صلاحيات إدارية شاملة مع تجاوز كامل للصلاحيات",
    color: "orange",
    badgeClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    isSystem: true,
  },
  {
    role: UserRole.MODERATOR,
    label: "مشرف",
    description: "إشراف على المحتوى والمستخدمين مع صلاحيات محدودة",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    isSystem: false,
  },
  {
    role: UserRole.SUPPORT,
    label: "الدعم الفني",
    description: "دعم المستخدمين وعرض البيانات الأساسية",
    color: "blue",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    isSystem: false,
  },
  {
    role: UserRole.TEACHER,
    label: "معلم",
    description: "إدارة المحتوى التعليمي الخاص به فقط",
    color: "purple",
    badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    isSystem: false,
  },
  {
    role: UserRole.PARENT,
    label: "ولي أمر",
    description: "متابعة الأبناء وعرض التقارير",
    color: "cyan",
    badgeClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    isSystem: false,
  },
  {
    role: UserRole.STUDENT,
    label: "طالب",
    description: "صلاحيات أساسية للطلاب",
    color: "slate",
    badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    isSystem: false,
  },
];

// ── Permission categories ──
export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "super",
    label: "التجاوز الكامل",
    icon: "ShieldAlert",
    permissions: [
      {
        key: PERMISSIONS.ADMIN_BYPASS,
        label: "تجاوز كامل للصلاحيات",
        description:
          "يمنح الوصول إلى كل صفحة وكل عملية وكل واجهة برمجية دون أي قيد. يتجاوز جميع الصلاحيات الأخرى المحددة أدناه.",
        dangerLevel: "dangerous",
      },
    ],
  },
  {
    id: "dashboard",
    label: "لوحة المعلومات والتحليلات",
    icon: "LayoutDashboard",
    permissions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, label: "عرض لوحة المعلومات", description: "الوصول إلى الصفحة الرئيسية للوحة الإدارة", dangerLevel: "safe" },
      { key: PERMISSIONS.ANALYTICS_VIEW, label: "عرض التحليلات", description: "عرض التقارير والإحصائيات التحليلية", dangerLevel: "safe" },
      { key: PERMISSIONS.REPORTS_VIEW, label: "عرض التقارير", description: "الوصول إلى مُنشئ التقارير والخزانة", dangerLevel: "safe" },
      { key: PERMISSIONS.REPORTS_MANAGE, label: "إدارة التقارير", description: "إنشاء وتعديل وحذف التقارير المخصصة", dangerLevel: "elevated" },
      { key: PERMISSIONS.LIVE_MONITOR_VIEW, label: "المراقبة اللحظية", description: "مراقبة النشاط المباشر والجلسات", dangerLevel: "elevated" },
    ],
  },
  {
    id: "users",
    label: "إدارة المستخدمين",
    icon: "Users",
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: "عرض المستخدمين", description: "عرض قائمة المستخدمين والبيانات الأساسية", dangerLevel: "safe" },
      { key: PERMISSIONS.USERS_MANAGE, label: "إدارة المستخدمين", description: "صلاحية شاملة لإدارة المستخدمين", dangerLevel: "dangerous" },
      { key: PERMISSIONS.USERS_CREATE, label: "إنشاء مستخدم", description: "إضافة مستخدمين جدد", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_UPDATE, label: "تعديل مستخدم", description: "تعديل بيانات المستخدمين", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_DELETE, label: "حذف مستخدم", description: "حذف حسابات المستخدمين", dangerLevel: "dangerous" },
      { key: PERMISSIONS.USERS_RESTORE, label: "استعادة مستخدم", description: "استعادة الحسابات المحذوفة", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_SUSPEND, label: "تعليق مستخدم", description: "تعليق وتفعيل حسابات المستخدمين", dangerLevel: "dangerous" },
      { key: PERMISSIONS.USERS_EXPORT, label: "تصدير المستخدمين", description: "تصدير بيانات المستخدمين", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_IMPORT, label: "استيراد المستخدمين", description: "استيراد مستخدمين من ملفات CSV", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_IMPERSONATE, label: "انتحال هوية مستخدم", description: "تسجيل الدخول بحساب مستخدم آخر للتشخيص", dangerLevel: "dangerous" },
      { key: PERMISSIONS.USERS_ASSIGN_ROLES, label: "تعيين الأدوار", description: "تغيير أدوار المستخدمين", dangerLevel: "dangerous" },
      { key: PERMISSIONS.USERS_ASSIGN_PERMISSIONS, label: "تعيين الصلاحيات", description: "منح أو سحب صلاحيات فردية", dangerLevel: "dangerous" },
      { key: PERMISSIONS.USERS_VIEW_FINANCIAL, label: "عرض البيانات المالية", description: "عرض الأرصدة والمحافظ المالية", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_VIEW_CONTACT, label: "عرض بيانات التواصل", description: "عرض البريد والهاتف والعنوان", dangerLevel: "safe" },
      { key: PERMISSIONS.USERS_VIEW_AUDIT_LOG, label: "عرض سجل التدقيق", description: "عرض سجلات التغييرات للمستخدم", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_VIEW_SESSIONS, label: "عرض الجلسات", description: "عرض الجلسات النشطة للمستخدم", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_VIEW_ACTIVITY, label: "عرض النشاط", description: "عرض سجل نشاط المستخدم", dangerLevel: "safe" },
      { key: PERMISSIONS.USERS_MANAGE_PASSWORD, label: "إدارة كلمة المرور", description: "إعادة تعيين كلمات المرور", dangerLevel: "dangerous" },
      { key: PERMISSIONS.USERS_MANAGE_VERIFICATION, label: "إدارة التوثيق", description: "توثيق البريد والهاتف يدوياً", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_SEND_NOTIFICATIONS, label: "إرسال إشعارات", description: "إرسال إشعارات للمستخدمين", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_TERMINATE_SESSIONS, label: "إنهاء الجلسات", description: "إنهاء الجلسات النشطة للمستخدمين", dangerLevel: "dangerous" },
      { key: PERMISSIONS.USERS_MANAGE_WALLET, label: "إدارة المحفظة", description: "تعديل أرصدة المحافظ المالية", dangerLevel: "dangerous" },
      { key: PERMISSIONS.USERS_VIEW_SUBSCRIPTIONS, label: "عرض الاشتراكات", description: "عرض اشتراكات المستخدم", dangerLevel: "safe" },
      { key: PERMISSIONS.USERS_VIEW_ORDERS, label: "عرض الطلبات", description: "عرض طلبات المستخدم", dangerLevel: "safe" },
      { key: PERMISSIONS.USERS_VIEW_CERTIFICATES, label: "عرض الشهادات", description: "عرض شهادات المستخدم", dangerLevel: "safe" },
      { key: PERMISSIONS.USERS_VIEW_SUPPORT, label: "عرض تذاكر الدعم", description: "عرض تذاكر الدعم الفني للمستخدم", dangerLevel: "safe" },
      { key: PERMISSIONS.USERS_VIEW_LOGIN_HISTORY, label: "عرض سجل الدخول", description: "عرض تاريخ تسجيل الدخول", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_VIEW_DEVICES, label: "عرض الأجهزة", description: "عرض الأجهزة المسجلة للمستخدم", dangerLevel: "elevated" },
      { key: PERMISSIONS.USERS_ADD_NOTE, label: "إضافة ملاحظات", description: "إضافة ملاحظات إدارية للمستخدم", dangerLevel: "safe" },
      { key: PERMISSIONS.STUDENTS_VIEW, label: "عرض الطلاب", description: "عرض قائمة الطلاب", dangerLevel: "safe" },
      { key: PERMISSIONS.STUDENTS_MANAGE, label: "إدارة الطلاب", description: "إدارة شاملة لبيانات الطلاب", dangerLevel: "dangerous" },
    ],
  },
  {
    id: "content",
    label: "إدارة المحتوى التعليمي",
    icon: "BookOpen",
    permissions: [
      { key: PERMISSIONS.SUBJECTS_VIEW, label: "عرض المواد", description: "عرض المواد الدراسية", dangerLevel: "safe" },
      { key: PERMISSIONS.SUBJECTS_CREATE, label: "إنشاء مادة", description: "إضافة مواد دراسية جديدة", dangerLevel: "elevated" },
      { key: PERMISSIONS.SUBJECTS_UPDATE, label: "تعديل مادة", description: "تعديل المواد الدراسية", dangerLevel: "elevated" },
      { key: PERMISSIONS.SUBJECTS_DELETE, label: "حذف مادة", description: "حذف المواد الدراسية", dangerLevel: "dangerous" },
      { key: PERMISSIONS.SUBJECTS_MANAGE, label: "إدارة المواد", description: "إنشاء وتعديل وحذف المواد", dangerLevel: "dangerous" },
      { key: PERMISSIONS.SUBJECTS_PUBLISH, label: "نشر المواد", description: "نشر وإلغاء نشر المواد الدراسية", dangerLevel: "elevated" },
      { key: PERMISSIONS.SUBJECTS_APPROVE, label: "اعتماد المواد", description: "اعتماد ومراجعة المواد قبل النشر", dangerLevel: "elevated" },
      { key: PERMISSIONS.OWN_SUBJECTS_MANAGE, label: "إدارة موادي فقط", description: "إدارة المواد الخاصة بالمعلم فقط", dangerLevel: "elevated" },
      { key: PERMISSIONS.LEARNING_PATHS_VIEW, label: "عرض مسارات التعلم", description: "عرض مسارات التعلم", dangerLevel: "safe" },
      { key: PERMISSIONS.LEARNING_PATHS_MANAGE, label: "إدارة مسارات التعلم", description: "إنشاء وتعديل مسارات التعلم", dangerLevel: "dangerous" },
      { key: PERMISSIONS.BOOKS_VIEW, label: "عرض الكتب", description: "عرض المكتبة", dangerLevel: "safe" },
      { key: PERMISSIONS.BOOKS_CREATE, label: "إنشاء كتاب", description: "إضافة كتب جديدة", dangerLevel: "elevated" },
      { key: PERMISSIONS.BOOKS_UPDATE, label: "تعديل كتاب", description: "تعديل الكتب الموجودة", dangerLevel: "elevated" },
      { key: PERMISSIONS.BOOKS_DELETE, label: "حذف كتاب", description: "حذف الكتب", dangerLevel: "dangerous" },
      { key: PERMISSIONS.BOOKS_MANAGE, label: "إدارة الكتب", description: "إضافة وتعديل الكتب", dangerLevel: "dangerous" },
      { key: PERMISSIONS.BOOKS_PUBLISH, label: "نشر الكتب", description: "نشر وإلغاء نشر الكتب", dangerLevel: "elevated" },
      { key: PERMISSIONS.OWN_BOOKS_MANAGE, label: "إدارة كتبي", description: "إدارة الكتب الخاصة بالمعلم", dangerLevel: "elevated" },
      { key: PERMISSIONS.RESOURCES_VIEW, label: "عرض الموارد", description: "عرض الموارد التعليمية", dangerLevel: "safe" },
      { key: PERMISSIONS.RESOURCES_MANAGE, label: "إدارة الموارد", description: "إضافة وتعديل الموارد", dangerLevel: "dangerous" },
      { key: PERMISSIONS.RESOURCES_PUBLISH, label: "نشر الموارد", description: "نشر وإلغاء نشر الموارد التعليمية", dangerLevel: "elevated" },
      { key: PERMISSIONS.OWN_RESOURCES_MANAGE, label: "إدارة مواردي", description: "إدارة الموارد الخاصة بالمعلم", dangerLevel: "elevated" },
      { key: PERMISSIONS.EXAMS_VIEW, label: "عرض الامتحانات", description: "عرض الامتحانات والاختبارات", dangerLevel: "safe" },
      { key: PERMISSIONS.EXAMS_CREATE, label: "إنشاء امتحان", description: "إضافة امتحانات جديدة", dangerLevel: "elevated" },
      { key: PERMISSIONS.EXAMS_UPDATE, label: "تعديل امتحان", description: "تعديل الامتحانات الموجودة", dangerLevel: "elevated" },
      { key: PERMISSIONS.EXAMS_DELETE, label: "حذف امتحان", description: "حذف الامتحانات", dangerLevel: "dangerous" },
      { key: PERMISSIONS.EXAMS_MANAGE, label: "إدارة الامتحانات", description: "إنشاء وتعديل الامتحانات", dangerLevel: "dangerous" },
      { key: PERMISSIONS.EXAMS_APPROVE, label: "اعتماد الامتحانات", description: "اعتماد ومراجعة الامتحانات", dangerLevel: "elevated" },
      { key: PERMISSIONS.EXAMS_PUBLISH, label: "نشر الامتحانات", description: "نشر وإلغاء نشر الامتحانات", dangerLevel: "elevated" },
      { key: PERMISSIONS.OWN_EXAMS_MANAGE, label: "إدارة امتحاناتي", description: "إدارة الامتحانات الخاصة بالمعلم", dangerLevel: "elevated" },
      { key: PERMISSIONS.ASSIGNMENTS_VIEW, label: "عرض الواجبات", description: "عرض الواجبات المنزلية", dangerLevel: "safe" },
      { key: PERMISSIONS.ASSIGNMENTS_MANAGE, label: "إدارة الواجبات", description: "إنشاء وتعديل الواجبات", dangerLevel: "dangerous" },
      { key: PERMISSIONS.OWN_ASSIGNMENTS_MANAGE, label: "إدارة واجباتي", description: "إدارة الواجبات الخاصة بالمعلم", dangerLevel: "elevated" },
    ],
  },
  {
    id: "people",
    label: "إدارة الكوادر",
    icon: "GraduationCap",
    permissions: [
      { key: PERMISSIONS.TEACHERS_VIEW, label: "عرض المعلمين", description: "عرض قائمة المعلمين", dangerLevel: "safe" },
      { key: PERMISSIONS.TEACHERS_MANAGE, label: "إدارة المعلمين", description: "إضافة وتعديل المعلمين", dangerLevel: "dangerous" },
      { key: PERMISSIONS.PARENTS_VIEW, label: "عرض أولياء الأمور", description: "عرض قائمة أولياء الأمور", dangerLevel: "safe" },
      { key: PERMISSIONS.PARENTS_MANAGE, label: "إدارة أولياء الأمور", description: "إدارة حسابات أولياء الأمور", dangerLevel: "dangerous" },
    ],
  },
  {
    id: "engagement",
    label: "التفاعل والتحفيز",
    icon: "Trophy",
    permissions: [
      { key: PERMISSIONS.CHALLENGES_VIEW, label: "عرض المهام", description: "عرض المهام التعليمية", dangerLevel: "safe" },
      { key: PERMISSIONS.CHALLENGES_MANAGE, label: "إدارة المهام", description: "إنشاء وتعديل المهام", dangerLevel: "dangerous" },
      { key: PERMISSIONS.OWN_CHALLENGES_MANAGE, label: "إدارة مهامي", description: "إدارة المهام الخاصة بالمعلم", dangerLevel: "elevated" },
      { key: PERMISSIONS.CONTESTS_VIEW, label: "عرض المسابقات", description: "عرض المسابقات العلمية", dangerLevel: "safe" },
      { key: PERMISSIONS.CONTESTS_MANAGE, label: "إدارة المسابقات", description: "إنشاء وتعديل المسابقات", dangerLevel: "dangerous" },
      { key: PERMISSIONS.ACHIEVEMENTS_VIEW, label: "عرض الأوسمة", description: "عرض الأوسمة والتقدير", dangerLevel: "safe" },
      { key: PERMISSIONS.ACHIEVEMENTS_MANAGE, label: "إدارة الأوسمة", description: "منح وإدارة الأوسمة", dangerLevel: "elevated" },
      { key: PERMISSIONS.REWARDS_VIEW, label: "عرض المكافآت", description: "عرض المكافآت", dangerLevel: "safe" },
      { key: PERMISSIONS.REWARDS_MANAGE, label: "إدارة المكافآت", description: "إدارة نظام المكافآت", dangerLevel: "elevated" },
      { key: PERMISSIONS.SEASONS_VIEW, label: "عرض فترات التميز", description: "عرض فترات التميز", dangerLevel: "safe" },
      { key: PERMISSIONS.SEASONS_MANAGE, label: "إدارة فترات التميز", description: "إدارة فترات التميز", dangerLevel: "elevated" },
    ],
  },
  {
    id: "community",
    label: "المجتمع والتواصل",
    icon: "MessageSquare",
    permissions: [
      { key: PERMISSIONS.BLOG_VIEW, label: "عرض المدونة", description: "عرض المدونة الأكاديمية", dangerLevel: "safe" },
      { key: PERMISSIONS.BLOG_CREATE, label: "إنشاء مقال", description: "كتابة مقالات جديدة", dangerLevel: "elevated" },
      { key: PERMISSIONS.BLOG_UPDATE, label: "تعديل مقال", description: "تعديل المقالات الموجودة", dangerLevel: "elevated" },
      { key: PERMISSIONS.BLOG_DELETE, label: "حذف مقال", description: "حذف المقالات", dangerLevel: "dangerous" },
      { key: PERMISSIONS.BLOG_MANAGE, label: "إدارة المدونة", description: "نشر وإدارة المقالات", dangerLevel: "elevated" },
      { key: PERMISSIONS.BLOG_PUBLISH, label: "نشر المقالات", description: "نشر وإلغاء نشر المقالات", dangerLevel: "elevated" },
      { key: PERMISSIONS.FORUM_VIEW, label: "عرض المنتدى", description: "عرض منتدى الحوار", dangerLevel: "safe" },
      { key: PERMISSIONS.FORUM_CREATE, label: "إنشاء موضوع", description: "إنشاء مواضيع جديدة في المنتدى", dangerLevel: "elevated" },
      { key: PERMISSIONS.FORUM_UPDATE, label: "تعديل موضوع", description: "تعديل مواضيع المنتدى", dangerLevel: "elevated" },
      { key: PERMISSIONS.FORUM_DELETE, label: "حذف موضوع", description: "حذف مواضيع المنتدى", dangerLevel: "dangerous" },
      { key: PERMISSIONS.FORUM_MODERATE, label: "إشراف المنتدى", description: "إشراف ومشاركة في المنتدى", dangerLevel: "elevated" },
      { key: PERMISSIONS.FORUM_MANAGE, label: "إدارة المنتدى", description: "إدارة كاملة للمنتدى", dangerLevel: "dangerous" },
      { key: PERMISSIONS.COMMENTS_VIEW, label: "عرض التعليقات", description: "عرض التعليقات", dangerLevel: "safe" },
      { key: PERMISSIONS.COMMENTS_CREATE, label: "إضافة تعليق", description: "كتابة تعليقات جديدة", dangerLevel: "safe" },
      { key: PERMISSIONS.COMMENTS_MODERATE, label: "إشراف التعليقات", description: "حذف وتعديل التعليقات", dangerLevel: "elevated" },
      { key: PERMISSIONS.EVENTS_VIEW, label: "عرض الفعاليات", description: "عرض الفعاليات", dangerLevel: "safe" },
      { key: PERMISSIONS.EVENTS_MANAGE, label: "إدارة الفعاليات", description: "إنشاء وتعديل الفعاليات", dangerLevel: "elevated" },
      { key: PERMISSIONS.ANNOUNCEMENTS_VIEW, label: "عرض الإعلانات", description: "عرض الإعلانات الرسمية", dangerLevel: "safe" },
      { key: PERMISSIONS.ANNOUNCEMENTS_MANAGE, label: "إدارة الإعلانات", description: "نشر الإعلانات والإشعارات", dangerLevel: "elevated" },
    ],
  },
  {
    id: "support",
    label: "الدعم الفني والتذاكر",
    icon: "LifeBuoy",
    permissions: [
      { key: PERMISSIONS.TICKETS_VIEW, label: "عرض التذاكر", description: "عرض تذاكر الدعم الفني", dangerLevel: "safe" },
      { key: PERMISSIONS.TICKETS_CREATE, label: "إنشاء تذكرة", description: "إنشاء تذاكر دعم فني جديدة", dangerLevel: "safe" },
      { key: PERMISSIONS.TICKETS_UPDATE, label: "تعديل تذكرة", description: "تعديل تذاكر الدعم الفني", dangerLevel: "elevated" },
      { key: PERMISSIONS.TICKETS_MANAGE, label: "إدارة التذاكر", description: "تعيين وتصعيد وإغلاق التذاكر", dangerLevel: "elevated" },
      { key: PERMISSIONS.TICKETS_RESOLVE, label: "حل التذاكر", description: "حل وإغلاق تذاكر الدعم الفني", dangerLevel: "elevated" },
      { key: PERMISSIONS.FAQS_MANAGE, label: "إدارة الأسئلة الشائعة", description: "إدارة قاعدة المعرفة والأسئلة الشائعة", dangerLevel: "elevated" },
    ],
  },
  {
    id: "parent",
    label: "لوحة ولي الأمر",
    icon: "Baby",
    permissions: [
      { key: PERMISSIONS.CHILDREN_VIEW, label: "عرض الأبناء", description: "عرض قائمة الأبناء المرتبطين", dangerLevel: "safe" },
      { key: PERMISSIONS.CHILDREN_GRADES, label: "عرض درجات الأبناء", description: "عرض الدرجات والنتائج", dangerLevel: "safe" },
      { key: PERMISSIONS.CHILDREN_PROGRESS, label: "متابعة تقدم الأبناء", description: "عرض تقدم الأبناء في الدروس", dangerLevel: "safe" },
      { key: PERMISSIONS.CHILDREN_ATTENDANCE, label: "متابعة حضور الأبناء", description: "عرض سجل الحضور والالتزام", dangerLevel: "safe" },
      { key: PERMISSIONS.CHILDREN_COMMUNICATE, label: "التواصل مع المعلمين", description: "مراسلة معلمي الأبناء", dangerLevel: "safe" },
      { key: PERMISSIONS.CHILDREN_PAYMENT, label: "إدارة مدفوعات الأبناء", description: "عرض وإدارة مدفوعات الأبناء", dangerLevel: "elevated" },
    ],
  },
  {
    id: "system",
    label: "النظام والإعدادات",
    icon: "Settings",
    permissions: [
      { key: PERMISSIONS.SETTINGS_VIEW, label: "عرض الإعدادات", description: "الوصول إلى إعدادات النظام", dangerLevel: "elevated" },
      { key: PERMISSIONS.SYSTEM_MANAGE, label: "إدارة النظام", description: "إدارة كاملة لخيارات النظام", dangerLevel: "dangerous" },
      { key: PERMISSIONS.SYSTEM_SETTINGS, label: "إعدادات النظام", description: "عرض وتعديل إعدادات النظام المتقدمة", dangerLevel: "dangerous" },
      { key: PERMISSIONS.AUDIT_LOGS_VIEW, label: "عرض سجلات النظام", description: "عرض سجلات تدقيق النظام", dangerLevel: "elevated" },
      { key: PERMISSIONS.AI_MANAGE, label: "إدارة المساعد الذكي", description: "إدارة المساعد الذكي والإعدادات", dangerLevel: "dangerous" },
      { key: PERMISSIONS.AI_USAGE, label: "استخدام المساعد الذكي", description: "استخدام المساعد الذكي في المهام", dangerLevel: "safe" },
      { key: PERMISSIONS.MARKETING_VIEW, label: "عرض التسويق", description: "عرض حملات التسويق", dangerLevel: "safe" },
      { key: PERMISSIONS.MARKETING_MANAGE, label: "إدارة التسويق", description: "إدارة حملات التواصل", dangerLevel: "elevated" },
      { key: PERMISSIONS.AB_TESTING_VIEW, label: "عرض اختبارات A/B", description: "عرض تجارب تحسين الأداء", dangerLevel: "safe" },
      { key: PERMISSIONS.NOTIFICATIONS_SEND, label: "إرسال إشعارات", description: "إرسال إشعارات للمستخدمين", dangerLevel: "elevated" },
      { key: PERMISSIONS.NOTIFICATIONS_MANAGE, label: "إدارة الإشعارات", description: "إدارة قوالب وإعدادات الإشعارات", dangerLevel: "dangerous" },
      { key: PERMISSIONS.TAXES_VIEW, label: "عرض الضرائب", description: "عرض إعدادات الضرائب", dangerLevel: "safe" },
      { key: PERMISSIONS.TAXES_MANAGE, label: "إدارة الضرائب", description: "إدارة إعدادات الضرائب", dangerLevel: "elevated" },
    ],
  },
  {
    id: "roles",
    label: "إدارة الأدوار والصلاحيات",
    icon: "ShieldCheck",
    permissions: [
      { key: PERMISSIONS.ROLES_VIEW, label: "عرض الأدوار", description: "عرض الأدوار المتاحة", dangerLevel: "elevated" },
      { key: PERMISSIONS.ROLES_CREATE, label: "إنشاء أدوار", description: "إنشاء أدوار جديدة", dangerLevel: "dangerous" },
      { key: PERMISSIONS.ROLES_UPDATE, label: "تعديل الأدوار", description: "تعديل الأدوار الحالية", dangerLevel: "dangerous" },
      { key: PERMISSIONS.ROLES_DELETE, label: "حذف الأدوار", description: "حذف الأدوار", dangerLevel: "dangerous" },
      { key: PERMISSIONS.ROLES_RESTORE, label: "استعادة الأدوار", description: "استعادة الأدوار المحذوفة", dangerLevel: "dangerous" },
      { key: PERMISSIONS.ROLES_ASSIGN_PERMISSIONS, label: "تعيين صلاحيات للأدوار", description: "منح صلاحيات للأدوار", dangerLevel: "dangerous" },
      { key: PERMISSIONS.ROLES_REMOVE_PERMISSIONS, label: "سحب صلاحيات من الأدوار", description: "إزالة صلاحيات من الأدوار", dangerLevel: "dangerous" },
      { key: PERMISSIONS.ROLES_ASSIGN_USERS, label: "تعيين مستخدمين للأدوار", description: "ربط المستخدمين بالأدوار", dangerLevel: "dangerous" },
      { key: PERMISSIONS.ROLES_REMOVE_USERS, label: "إزالة مستخدمين من الأدوار", description: "فصل المستخدمين عن الأدوار", dangerLevel: "dangerous" },
      { key: PERMISSIONS.PERMISSIONS_VIEW, label: "عرض الصلاحيات", description: "عرض جميع الصلاحيات المتاحة", dangerLevel: "elevated" },
      { key: PERMISSIONS.PERMISSIONS_MANAGE, label: "إدارة الصلاحيات", description: "إدارة الصلاحيات بشكل كامل", dangerLevel: "dangerous" },
    ],
  },
];

// ── Helper functions ──

/** Flatten all permissions with their category info */
export function getAllPermissionMetas(): Array<PermissionMeta & { categoryId: string; categoryLabel: string }> {
  return PERMISSION_CATEGORIES.flatMap((cat) =>
    cat.permissions.map((perm) => ({
      ...perm,
      categoryId: cat.id,
      categoryLabel: cat.label,
    })),
  );
}

/** Check if a role has a specific permission by default */
export function roleHasPermission(role: UserRole, permissionKey: string): boolean {
  const rolePerms = DEFAULT_ROLE_PERMISSIONS[role] || [];
  if (rolePerms.includes(PERMISSIONS.ADMIN_BYPASS as Permission)) return true;
  return rolePerms.includes(permissionKey as Permission);
}

/** Get all permissions for a role (including bypass) */
export function getRolePermissions(role: UserRole): string[] {
  return DEFAULT_ROLE_PERMISSIONS[role] || [];
}

/** Count permissions per role */
export function getRolePermissionCount(role: UserRole): { total: number; byCategory: Record<string, number> } {
  const perms = getRolePermissions(role);
  if (perms.includes(PERMISSIONS.ADMIN_BYPASS)) {
    const allPerms = getAllPermissionMetas();
    const byCategory: Record<string, number> = {};
    allPerms.forEach((p) => {
      byCategory[p.categoryId] = (byCategory[p.categoryId] || 0) + 1;
    });
    return { total: allPerms.length, byCategory };
  }
  const byCategory: Record<string, number> = {};
  perms.forEach((perm) => {
    PERMISSION_CATEGORIES.forEach((cat) => {
      if (cat.permissions.some((p) => p.key === perm)) {
        byCategory[cat.id] = (byCategory[cat.id] || 0) + 1;
      }
    });
  });
  return { total: perms.length, byCategory };
}

/** Get danger level styling */
export function getDangerLevelStyle(level: PermissionMeta["dangerLevel"]): {
  label: string;
  color: string;
  badgeClass: string;
} {
  const styles = {
    safe: {
      label: "آمن",
      color: "emerald",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    elevated: {
      label: "مرتفع",
      color: "amber",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    dangerous: {
      label: "خطر",
      color: "red",
      badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
  };
  return styles[level];
}

/** Get all manageable roles (non-system roles that can be customized) */
export function getManageableRoles(): RoleMeta[] {
  return ROLE_METADATA.filter((r) => !r.isSystem);
}

/** Get all staff roles (roles that appear in the permissions matrix) */
export function getStaffRoles(): RoleMeta[] {
  return ROLE_METADATA.filter((r) =>
    [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT, UserRole.TEACHER].includes(r.role),
  );
}