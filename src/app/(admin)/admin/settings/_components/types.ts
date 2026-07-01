import { z } from "zod";
import type { LucideIcon } from "lucide-react";

// ============================================================
// Zod Schema – Full settings validation
// ============================================================
export const settingsSchema = z.object({
  // General
  siteName: z.string().min(1, "اسم الموقع مطلوب"),
  siteDescription: z.string().min(1, "وصف الموقع مطلوب"),
  siteKeywords: z.string(),
  contactEmail: z.string().email("البريد غير صالح"),
  supportPhone: z.string().optional(),

  // Social
  socialLinks: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
  }),

  // Features
  features: z.object({
    registration: z.boolean(),
    emailVerification: z.boolean(),
    engagement: z.boolean(),
    forum: z.boolean(),
    blog: z.boolean(),
    events: z.boolean(),
    aiAssistant: z.boolean(),
  }),

  // Engagement
  engagement: z.object({
    pointsPerTask: z.number().min(0),
    pointsPerStudySession: z.number().min(0),
    pointsPerExam: z.number().min(0),
    streakBonus: z.number().min(0),
  }),

  // Limits
  limits: z.object({
    maxUploadSize: z.number().min(1),
    maxStudySessionDuration: z.number().min(1),
    examTimeLimit: z.number().min(1),
  }),

  // Maintenance
  maintenance: z.object({
    enabled: z.boolean(),
    message: z.string(),
  }),

  // Email (SMTP)
  email: z.object({
    smtpHost: z.string().optional(),
    smtpPort: z.number().min(1).max(65535),
    smtpUsername: z.string().optional(),
    smtpPassword: z.string().optional(),
    fromAddress: z.string().email().optional().or(z.literal("")),
    fromName: z.string().optional(),
    encryption: z.string(),
    enabled: z.boolean(),
    maxBatchSize: z.number().min(1),
    throttleMs: z.number().min(0),
  }),

  // Security
  security: z.object({
    passwordMinLength: z.number().min(6),
    passwordRequireUppercase: z.boolean(),
    passwordRequireLowercase: z.boolean(),
    passwordRequireNumbers: z.boolean(),
    passwordRequireSymbols: z.boolean(),
    sessionTimeoutMinutes: z.number().min(1),
    maxLoginAttempts: z.number().min(1),
    lockoutDurationMinutes: z.number().min(1),
    enforce2FA: z.boolean(),
    rateLimitPerMinute: z.number().min(1),
    rateLimitPerHour: z.number().min(1),
    hstsEnabled: z.boolean(),
    contentSecurityPolicy: z.string().optional(),
  }),

  // Payments
  payments: z.object({
    currency: z.string(),
    currencySymbol: z.string(),
    taxRate: z.number().min(0).max(100),
    enablePaymob: z.boolean(),
    enableWallet: z.boolean(),
    enableCash: z.boolean(),
    minDepositAmount: z.number().min(1),
    maxDepositAmount: z.number().min(1),
    autoConfirmPayments: z.boolean(),
    invoicePrefix: z.string(),
    paymentTimeoutMinutes: z.number().min(1),
  }),

  // Storage
  storage: z.object({
    provider: z.string(),
    maxUploadSizeMB: z.number().min(1),
    imageQuality: z.number().min(1).max(100),
    imageMaxWidth: z.number().min(100),
    imageMaxHeight: z.number().min(100),
    enableCDN: z.boolean(),
    cdnUrl: z.string().optional(),
    enableCompression: z.boolean(),
    enableThumbnails: z.boolean(),
    thumbnailWidth: z.number().min(50),
    thumbnailHeight: z.number().min(50),
    cleanupTempFilesAfterHours: z.number().min(1),
  }),

  // Performance
  performance: z.object({
    enableCaching: z.boolean(),
    cacheTTLSeconds: z.number().min(0),
    enableRedis: z.boolean(),
    enableImageOptimization: z.boolean(),
    enableLazyLoading: z.boolean(),
    paginationDefaultLimit: z.number().min(1),
    paginationMaxLimit: z.number().min(1),
    enableGzipCompression: z.boolean(),
    enableMinification: z.boolean(),
    queryTimeoutSeconds: z.number().min(1),
    maxConcurrentRequests: z.number().min(1),
    enableDbConnectionPooling: z.boolean(),
    dbPoolMaxOpenConns: z.number().min(1),
    dbPoolMaxIdleConns: z.number().min(1),
    dbPoolConnMaxLifetimeMinutes: z.number().min(1),
  }),

  // Privacy
  privacy: z.object({
    termsOfServiceUrl: z.string().optional(),
    privacyPolicyUrl: z.string().optional(),
    cookiePolicyUrl: z.string().optional(),
    enableCookieConsent: z.boolean(),
    enableGDPR: z.boolean(),
    dataRetentionDays: z.number().min(1),
    enableAnalytics: z.boolean(),
    analyticsProvider: z.string().optional(),
    analyticsId: z.string().optional(),
    enableUserDataExport: z.boolean(),
    enableAccountDeletion: z.boolean(),
    deletionGracePeriodDays: z.number().min(1),
    minAgeRequirement: z.number().min(1),
    parentalConsentRequired: z.boolean(),
    showWatermarkOnContent: z.boolean(),
    watermarkText: z.string().optional(),
  }),

  // Notifications
  notifications: z.object({
    enablePushNotifications: z.boolean(),
    enableEmailNotifications: z.boolean(),
    enableSmsNotifications: z.boolean(),
    pushProvider: z.string(),
    firebaseServerKey: z.string().optional(),
    firebaseSenderId: z.string().optional(),
    onesignalAppId: z.string().optional(),
    onesignalApiKey: z.string().optional(),
    dailyDigestEnabled: z.boolean(),
    digestTime: z.string(),
    maxNotificationsPerDay: z.number().min(1),
    quietHoursStart: z.string(),
    quietHoursEnd: z.string(),
  }),

  // Localization
  localization: z.object({
    defaultLanguage: z.string(),
    fallbackLanguage: z.string(),
    enableRTL: z.boolean(),
    dateFormat: z.string(),
    timeFormat: z.string(),
    timezone: z.string(),
    numberFormat: z.string().optional(),
  }),

  // Theme
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
    backgroundColor: z.string(),
    surfaceColor: z.string(),
    textColor: z.string(),
    fontFamily: z.string(),
    fontSize: z.string(),
    borderRadius: z.string(),
    logoUrl: z.string().optional(),
    faviconUrl: z.string().optional(),
    ogImageUrl: z.string().optional(),
    customCSS: z.string().optional(),
  }),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

// ============================================================
// Tab configuration
// ============================================================
export interface TabConfig {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  group: string;
}

// ============================================================
// Safe getter helper
// ============================================================
export function safeGet(obj: any, path: string, defaultVal: any) {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") return defaultVal;
    current = current[key];
  }
  return current !== undefined && current !== null ? current : defaultVal;
}

export function getSafeSettings(settingsData: any) {
  const settings = settingsData?.settings || settingsData?.data?.settings || settingsData?.data || settingsData || {};

  return {
    siteName: safeGet(settings, "siteName", ""),
    siteDescription: safeGet(settings, "siteDescription", ""),
    siteKeywords: Array.isArray(settings.siteKeywords)
      ? settings.siteKeywords.join(", ")
      : typeof settings.siteKeywords === "string"
        ? settings.siteKeywords
        : "",
    contactEmail: safeGet(settings, "contactEmail", ""),
    supportPhone: safeGet(settings, "supportPhone", ""),
    socialLinks: {
      facebook: safeGet(settings, "socialLinks.facebook", ""),
      twitter: safeGet(settings, "socialLinks.twitter", ""),
      instagram: safeGet(settings, "socialLinks.instagram", ""),
      youtube: safeGet(settings, "socialLinks.youtube", ""),
    },
    features: {
      registration: safeGet(settings, "features.registration", true),
      emailVerification: safeGet(settings, "features.emailVerification", true),
      engagement: safeGet(settings, "features.engagement", true),
      forum: safeGet(settings, "features.forum", true),
      blog: safeGet(settings, "features.blog", true),
      events: safeGet(settings, "features.events", true),
      aiAssistant: safeGet(settings, "features.aiAssistant", true),
    },
    engagement: {
      pointsPerTask: safeGet(settings, "engagement.pointsPerTask", 10),
      pointsPerStudySession: safeGet(settings, "engagement.pointsPerStudySession", 5),
      pointsPerExam: safeGet(settings, "engagement.pointsPerExam", 20),
      streakBonus: safeGet(settings, "engagement.streakBonus", 2),
    },
    limits: {
      maxUploadSize: safeGet(settings, "limits.maxUploadSize", 10),
      maxStudySessionDuration: safeGet(settings, "limits.maxStudySessionDuration", 180),
      examTimeLimit: safeGet(settings, "limits.examTimeLimit", 60),
    },
    maintenance: {
      enabled: safeGet(settings, "maintenance.enabled", false),
      message: safeGet(settings, "maintenance.message", ""),
    },
    email: {
      smtpHost: safeGet(settings, "email.smtpHost", ""),
      smtpPort: safeGet(settings, "email.smtpPort", 587),
      smtpUsername: safeGet(settings, "email.smtpUsername", ""),
      smtpPassword: safeGet(settings, "email.smtpPassword", ""),
      fromAddress: safeGet(settings, "email.fromAddress", ""),
      fromName: safeGet(settings, "email.fromName", ""),
      encryption: safeGet(settings, "email.encryption", "tls"),
      enabled: safeGet(settings, "email.enabled", true),
      maxBatchSize: safeGet(settings, "email.maxBatchSize", 50),
      throttleMs: safeGet(settings, "email.throttleMs", 200),
    },
    security: {
      passwordMinLength: safeGet(settings, "security.passwordMinLength", 8),
      passwordRequireUppercase: safeGet(settings, "security.passwordRequireUppercase", true),
      passwordRequireLowercase: safeGet(settings, "security.passwordRequireLowercase", true),
      passwordRequireNumbers: safeGet(settings, "security.passwordRequireNumbers", true),
      passwordRequireSymbols: safeGet(settings, "security.passwordRequireSymbols", false),
      sessionTimeoutMinutes: safeGet(settings, "security.sessionTimeoutMinutes", 60),
      maxLoginAttempts: safeGet(settings, "security.maxLoginAttempts", 5),
      lockoutDurationMinutes: safeGet(settings, "security.lockoutDurationMinutes", 15),
      enforce2FA: safeGet(settings, "security.enforce2FA", false),
      rateLimitPerMinute: safeGet(settings, "security.rateLimitPerMinute", 30),
      rateLimitPerHour: safeGet(settings, "security.rateLimitPerHour", 200),
      hstsEnabled: safeGet(settings, "security.hstsEnabled", true),
      contentSecurityPolicy: safeGet(settings, "security.contentSecurityPolicy", "default-src 'self'"),
    },
    payments: {
      currency: safeGet(settings, "payments.currency", "EGP"),
      currencySymbol: safeGet(settings, "payments.currencySymbol", "ج.م"),
      taxRate: safeGet(settings, "payments.taxRate", 14),
      enablePaymob: safeGet(settings, "payments.enablePaymob", true),
      enableWallet: safeGet(settings, "payments.enableWallet", true),
      enableCash: safeGet(settings, "payments.enableCash", false),
      minDepositAmount: safeGet(settings, "payments.minDepositAmount", 10),
      maxDepositAmount: safeGet(settings, "payments.maxDepositAmount", 10000),
      autoConfirmPayments: safeGet(settings, "payments.autoConfirmPayments", false),
      invoicePrefix: safeGet(settings, "payments.invoicePrefix", "INV-"),
      paymentTimeoutMinutes: safeGet(settings, "payments.paymentTimeoutMinutes", 30),
    },
    storage: {
      provider: safeGet(settings, "storage.provider", "local"),
      maxUploadSizeMB: safeGet(settings, "storage.maxUploadSizeMB", 50),
      imageQuality: safeGet(settings, "storage.imageQuality", 80),
      imageMaxWidth: safeGet(settings, "storage.imageMaxWidth", 1920),
      imageMaxHeight: safeGet(settings, "storage.imageMaxHeight", 1080),
      enableCDN: safeGet(settings, "storage.enableCDN", false),
      cdnUrl: safeGet(settings, "storage.cdnUrl", ""),
      enableCompression: safeGet(settings, "storage.enableCompression", true),
      enableThumbnails: safeGet(settings, "storage.enableThumbnails", true),
      thumbnailWidth: safeGet(settings, "storage.thumbnailWidth", 300),
      thumbnailHeight: safeGet(settings, "storage.thumbnailHeight", 200),
      cleanupTempFilesAfterHours: safeGet(settings, "storage.cleanupTempFilesAfterHours", 24),
    },
    performance: {
      enableCaching: safeGet(settings, "performance.enableCaching", true),
      cacheTTLSeconds: safeGet(settings, "performance.cacheTTLSeconds", 300),
      enableRedis: safeGet(settings, "performance.enableRedis", true),
      enableImageOptimization: safeGet(settings, "performance.enableImageOptimization", true),
      enableLazyLoading: safeGet(settings, "performance.enableLazyLoading", true),
      paginationDefaultLimit: safeGet(settings, "performance.paginationDefaultLimit", 20),
      paginationMaxLimit: safeGet(settings, "performance.paginationMaxLimit", 100),
      enableGzipCompression: safeGet(settings, "performance.enableGzipCompression", true),
      enableMinification: safeGet(settings, "performance.enableMinification", true),
      queryTimeoutSeconds: safeGet(settings, "performance.queryTimeoutSeconds", 30),
      maxConcurrentRequests: safeGet(settings, "performance.maxConcurrentRequests", 100),
      enableDbConnectionPooling: safeGet(settings, "performance.enableDbConnectionPooling", true),
      dbPoolMaxOpenConns: safeGet(settings, "performance.dbPoolMaxOpenConns", 25),
      dbPoolMaxIdleConns: safeGet(settings, "performance.dbPoolMaxIdleConns", 10),
      dbPoolConnMaxLifetimeMinutes: safeGet(settings, "performance.dbPoolConnMaxLifetimeMinutes", 30),
    },
    privacy: {
      termsOfServiceUrl: safeGet(settings, "privacy.termsOfServiceUrl", ""),
      privacyPolicyUrl: safeGet(settings, "privacy.privacyPolicyUrl", ""),
      cookiePolicyUrl: safeGet(settings, "privacy.cookiePolicyUrl", ""),
      enableCookieConsent: safeGet(settings, "privacy.enableCookieConsent", true),
      enableGDPR: safeGet(settings, "privacy.enableGDPR", false),
      dataRetentionDays: safeGet(settings, "privacy.dataRetentionDays", 365),
      enableAnalytics: safeGet(settings, "privacy.enableAnalytics", true),
      analyticsProvider: safeGet(settings, "privacy.analyticsProvider", ""),
      analyticsId: safeGet(settings, "privacy.analyticsId", ""),
      enableUserDataExport: safeGet(settings, "privacy.enableUserDataExport", true),
      enableAccountDeletion: safeGet(settings, "privacy.enableAccountDeletion", true),
      deletionGracePeriodDays: safeGet(settings, "privacy.deletionGracePeriodDays", 30),
      minAgeRequirement: safeGet(settings, "privacy.minAgeRequirement", 16),
      parentalConsentRequired: safeGet(settings, "privacy.parentalConsentRequired", false),
      showWatermarkOnContent: safeGet(settings, "privacy.showWatermarkOnContent", false),
      watermarkText: safeGet(settings, "privacy.watermarkText", ""),
    },
    notifications: {
      enablePushNotifications: safeGet(settings, "notifications.enablePushNotifications", true),
      enableEmailNotifications: safeGet(settings, "notifications.enableEmailNotifications", true),
      enableSmsNotifications: safeGet(settings, "notifications.enableSmsNotifications", false),
      pushProvider: safeGet(settings, "notifications.pushProvider", "firebase"),
      firebaseServerKey: safeGet(settings, "notifications.firebaseServerKey", ""),
      firebaseSenderId: safeGet(settings, "notifications.firebaseSenderId", ""),
      onesignalAppId: safeGet(settings, "notifications.onesignalAppId", ""),
      onesignalApiKey: safeGet(settings, "notifications.onesignalApiKey", ""),
      dailyDigestEnabled: safeGet(settings, "notifications.dailyDigestEnabled", true),
      digestTime: safeGet(settings, "notifications.digestTime", "08:00"),
      maxNotificationsPerDay: safeGet(settings, "notifications.maxNotificationsPerDay", 10),
      quietHoursStart: safeGet(settings, "notifications.quietHoursStart", "22:00"),
      quietHoursEnd: safeGet(settings, "notifications.quietHoursEnd", "08:00"),
    },
    localization: {
      defaultLanguage: safeGet(settings, "localization.defaultLanguage", "ar"),
      fallbackLanguage: safeGet(settings, "localization.fallbackLanguage", "en"),
      enableRTL: safeGet(settings, "localization.enableRTL", true),
      dateFormat: safeGet(settings, "localization.dateFormat", "YYYY-MM-DD"),
      timeFormat: safeGet(settings, "localization.timeFormat", "HH:mm"),
      timezone: safeGet(settings, "localization.timezone", "Africa/Cairo"),
      numberFormat: safeGet(settings, "localization.numberFormat", "ar-EG"),
    },
    theme: {
      primaryColor: safeGet(settings, "theme.primaryColor", "#6366f1"),
      secondaryColor: safeGet(settings, "theme.secondaryColor", "#8b5cf6"),
      accentColor: safeGet(settings, "theme.accentColor", "#f59e0b"),
      backgroundColor: safeGet(settings, "theme.backgroundColor", "#0f172a"),
      surfaceColor: safeGet(settings, "theme.surfaceColor", "#1e293b"),
      textColor: safeGet(settings, "theme.textColor", "#f8fafc"),
      fontFamily: safeGet(settings, "theme.fontFamily", "Cairo, sans-serif"),
      fontSize: safeGet(settings, "theme.fontSize", "16px"),
      borderRadius: safeGet(settings, "theme.borderRadius", "12px"),
      logoUrl: safeGet(settings, "theme.logoUrl", ""),
      faviconUrl: safeGet(settings, "theme.faviconUrl", ""),
      ogImageUrl: safeGet(settings, "theme.ogImageUrl", ""),
      customCSS: safeGet(settings, "theme.customCSS", ""),
    },
  };
}