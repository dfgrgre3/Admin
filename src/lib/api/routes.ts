/**
 * Centralized API route definitions for Admin Panel.
 * Synced with backend router: internal/router/
 * Last sync: 2026-06-29
 */
export const apiRoutes = {
  // ──────────────────────────────────────────
  // Health
  // ──────────────────────────────────────────
  health: {
    healthz: '/api/healthz',
    readyz: '/api/readyz',
    live: '/health/live',
    ready: '/health/ready',
  },

  // ──────────────────────────────────────────
  // Authentication
  // ──────────────────────────────────────────
  auth: {
    login: '/api/auth/login',
    adminLogin: '/api/auth/admin-login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    refresh: '/api/auth/refresh',
    refreshSession: '/api/auth/refresh-session',
    sessions: '/api/auth/sessions',
    revokeSession: (id: string) => `/api/auth/sessions/${id}`,
    profile: '/api/auth/profile',
    deleteAccount: '/api/auth/account',
    validateToken: '/api/auth/validate-token',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    changePassword: '/api/auth/change-password',
    verifyEmail: '/api/auth/verify-email',
    resendVerification: '/api/auth/resend-verification',
    recovery: {
      initiate: '/api/auth/recovery/initiate',
      finalize: '/api/auth/recovery/finalize',
    },
    mfa: {
      setup: '/api/auth/mfa/setup',
      enable: '/api/auth/mfa/enable',
      disable: '/api/auth/mfa/disable',
      verify: '/api/auth/mfa/verify',
    },
    social: {
      login: (provider: string) => `/api/auth/social/${provider}`,
      callback: (provider: string) => `/api/auth/callback/${provider}`,
      link: '/api/auth/social/link',
      unlink: '/api/auth/social/unlink',
      accounts: '/api/auth/social/accounts',
    },
    verify2FA: '/api/auth/2fa/verify',
    magicLink: {
      request: '/api/auth/magic-link/request',
      verify: '/api/auth/magic-link/verify',
    },
  },

  // ──────────────────────────────────────────
  // Progress & Analytics
  // ──────────────────────────────────────────
  progress: {
    summary: '/api/progress/summary',
    courses: '/api/users/progress/courses',
    time: '/api/users/progress/time',
    achievements: '/api/users/progress/achievements',
  },
  analytics: {
    weekly: '/api/analytics/weekly',
    time: '/api/analytics/time',
    performance: '/api/analytics/performance',
    predictions: '/api/analytics/predictions',
  },

  // ──────────────────────────────────────────
  // Notifications
  // ──────────────────────────────────────────
  notifications: {
    list: '/api/notifications',
    unreadCount: '/api/notifications/unread-count',
    markRead: '/api/notifications/mark-read',
    enqueue: '/api/notifications/enqueue',
  },

  // ──────────────────────────────────────────
  // Activities
  // ──────────────────────────────────────────
  activities: {
    recent: '/api/activities/recent',
    markRead: (id: string) => `/api/activities/${id}/read`,
    readAll: '/api/activities/read-all',
    read: (id: string) => `/api/activities/${id}/read`,
  },

  // ──────────────────────────────────────────
  // Settings
  // ──────────────────────────────────────────
  settings: {
    preferences: '/api/settings/preferences',
    system: '/api/settings',
  },

  // ──────────────────────────────────────────
  // Users & Profile
  // ──────────────────────────────────────────
  users: {
    guest: '/api/users/guest',
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
    billingSummary: '/api/users/billing-summary',
  },

  // ──────────────────────────────────────────
  // Billing & Subscriptions
  // ──────────────────────────────────────────
  billing: {
    wallet: '/api/billing/wallet',
    transactions: '/api/billing/wallet/transactions',
    deposit: '/api/billing/wallet',
  },
  subscriptions: {
    plans: '/api/subscriptions/plans',
    current: '/api/subscriptions',
    checkout: '/api/subscriptions/checkout',
  },
  coupons: {
    validate: '/api/coupons/validate',
  },

  // ──────────────────────────────────────────
  // Gamification
  // ──────────────────────────────────────────
  gamification: {
    progress: '/api/gamification/progress',
    achievements: '/api/gamification/achievements',
    leaderboard: '/api/gamification/leaderboard',
    goals: '/api/gamification/goals',
    updateGoal: (id: string) => `/api/gamification/goals/${id}`,
  },

  // ──────────────────────────────────────────
  // AI
  // ──────────────────────────────────────────
  ai: {
    exam: '/api/ai/exam',
    examStatus: (jobId: string) => `/api/ai/exam/status/${jobId}`,
    suggest: '/api/ai/suggest',
    chat: '/api/ai/chat',
    tips: '/api/ai/tips',
    recommendations: '/api/ai/recommendations',
  },

  // ──────────────────────────────────────────
  // Library
  // ──────────────────────────────────────────
  library: {
    books: '/api/library/books',
    categories: '/api/library/categories',
  },

  // ──────────────────────────────────────────
  // Admin  (admin_routes.go — /api/admin/*)
  // ──────────────────────────────────────────
  admin: {
    dashboard: '/api/admin/dashboard',
    ai: '/api/admin/ai',
    live: '/api/admin/live',
    analytics: '/api/admin/analytics',
    revenue: '/api/admin/analytics/revenue',
    journeys: '/api/admin/analytics/journeys',
    activityMetrics: '/api/admin/analytics/metrics',
    metricsHistory: '/api/admin/metrics/history',
    infrastructureStats: '/api/admin/infrastructure/stats',
    health: '/api/admin/health/detailed',

    // Announcements
    announcements: '/api/admin/announcements',

    // Notifications
    notificationBroadcast: '/api/admin/notifications/broadcast',
    notificationSchedule: '/api/admin/notifications/schedule',
    notificationStats: '/api/admin/notifications/stats',
    notificationPush: '/api/admin/notifications/push',
    broadcasts: '/api/admin/broadcasts',
    cancelBroadcast: (id: string) => `/api/admin/notifications/broadcast/${id}/cancel`,
    retryBroadcast: (id: string) => `/api/admin/notifications/broadcast/${id}/retry`,

    // Reports
    reportsOverview: '/api/admin/reports/overview',
    reportsUsers: '/api/admin/reports/users',
    reportsBooks: '/api/admin/reports/books',
    reportsContent: '/api/admin/reports/content',
    reports: '/api/admin/reports',
    report: (id: string) => `/api/admin/reports/${id}`,
    executeReport: (id: string) => `/api/admin/reports/${id}/execute`,
    exportReport: (id: string) => `/api/admin/reports/${id}/export`,
    scheduleReport: (id: string) => `/api/admin/reports/${id}/schedule`,

    // Users
    users: '/api/admin/users',
    createUser: '/api/admin/users',
    userById: (id: string) => `/api/admin/users/${id}`,
    searchUsers: '/api/admin/search/users',
    wallet: (userId: string) => `/api/admin/users/${userId}/wallet/transactions`,

    // Teachers
    teachers: '/api/admin/teachers',

    // Subjects & Courses
    subjects: '/api/admin/subjects',
    courses: '/api/admin/courses',
    courseAction: '/api/admin/courses/action',
    courseDuplicate: '/api/admin/courses/duplicate',
    courseBatch: '/api/admin/courses/batch',
    courseExport: '/api/admin/courses/export',
    courseStudents: (courseId: string) => `/api/admin/courses/${courseId}/students`,
    courseAnalytics: (courseId: string) => `/api/admin/courses/${courseId}/analytics`,
    courseCurriculum: (courseId: string) => `/api/admin/courses/${courseId}/curriculum`,
    courseCurriculumStats: (courseId: string) => `/api/admin/courses/${courseId}/curriculum-stats`,
    courseEnrollments: (courseId: string) => `/api/admin/courses/${courseId}/enrollments`,
    courseMarketing: (courseId: string) => `/api/admin/courses/${courseId}/marketing`,
    courseFaq: (courseId: string) => `/api/admin/courses/${courseId}/faq`,
    courseGuarantee: (courseId: string) => `/api/admin/courses/${courseId}/guarantee`,
    courseChangelog: (courseId: string) => `/api/admin/courses/${courseId}/changelog`,
    courseProjects: (courseId: string) => `/api/admin/courses/${courseId}/projects`,
    courseReviews: (courseId: string) => `/api/admin/courses/${courseId}/reviews`,
    subjectCurriculum: (subjectId: string) => `/api/admin/subjects/${subjectId}/curriculum`,

    // Enrollments
    enrollments: '/api/admin/courses/enrollments',
    manualEnroll: '/api/admin/courses/enroll',
    unenrollUser: '/api/admin/courses/unenroll',
    addLessonAttachment: '/api/admin/courses/lessons/attachments',

    // Exams
    exams: '/api/admin/exams',

    // Categories
    courseCategories: '/api/admin/course-categories',

    // Course Certificates
    certificates: '/api/admin/certificates',
    certificateById: (id: string) => `/api/admin/certificates/${id}`,
    certificateAwards: '/api/admin/certificates/awards',
    certificateAwardById: (id: string) => `/api/admin/certificates/awards/${id}`,

    // Learning Paths
    learningPaths: '/api/admin/learning-paths',
    learningPathById: (id: string) => `/api/admin/learning-paths/${id}`,
    learningPathEnrollments: (id: string) => `/api/admin/learning-paths/${id}/enrollments`,

    // Payments
    payments: '/api/admin/payments',

    // Coupons
    coupons: '/api/admin/coupons',
    couponById: (id: string) => `/api/admin/coupons/${id}`,

    // Subscription Plans
    plans: '/api/admin/plans',
    planById: (id: string) => `/api/admin/plans/${id}`,

    // Settings
    settings: '/api/admin/settings',

    // Gamification
    challenges: '/api/admin/challenges',
    challengeById: (id: string) => `/api/admin/challenges/${id}`,
    rewards: '/api/admin/rewards',
    rewardById: (id: string) => `/api/admin/rewards/${id}`,
    achievements: '/api/admin/achievements',
    achievementById: (id: string) => `/api/admin/achievements/${id}`,
    seasons: '/api/admin/seasons',
    seasonById: (id: string) => `/api/admin/seasons/${id}`,

    // Blog
    blog: '/api/admin/blog',
    blogById: (id: string) => `/api/admin/blog/${id}`,

    // Forum
    forum: '/api/admin/forum',
    forumCategories: '/api/admin/forum-categories',

    // Events
    events: '/api/admin/events',

    // Automations
    automations: '/api/admin/automations',
    automationById: (id: string) => `/api/admin/automations/${id}`,

    // AB Testing
    abTesting: '/api/admin/ab-testing',
    abTestById: (id: string) => `/api/admin/ab-testing/${id}`,

    // Books
    books: '/api/admin/books',
    bookById: (id: string) => `/api/admin/books/${id}`,
    bookReviews: '/api/admin/books/reviews',
    bookViews: '/api/admin/books/views',

    // Resources
    resources: '/api/admin/resources',

    // Impersonation
    impersonate: '/api/admin/impersonate',
    impersonateById: (id: string) => `/api/admin/users/${id}/impersonate`,
    deleteImpersonation: '/api/admin/impersonate',

    // Marketing
    marketing: '/api/admin/marketing',
    marketingCampaigns: '/api/admin/marketing/campaigns',
    campaignById: (id: string) => `/api/admin/marketing/campaigns/${id}`,

    // Contests
    contests: '/api/admin/contests',
    contestById: (id: string) => `/api/admin/contests/${id}`,

    // Support Tickets
    tickets: '/api/admin/tickets',
    ticketStats: '/api/admin/tickets/stats',
    ticketById: (id: string) => `/api/admin/tickets/${id}`,
    ticketMessages: (id: string) => `/api/admin/tickets/${id}/messages`,
    ticketStatus: (id: string) => `/api/admin/tickets/${id}/status`,
    ticketPriority: (id: string) => `/api/admin/tickets/${id}/priority`,
    ticketAssign: (id: string) => `/api/admin/tickets/${id}/assign`,
    ticketClose: (id: string) => `/api/admin/tickets/${id}/close`,
    ticketTags: (id: string) => `/api/admin/tickets/${id}/tags`,

    // Backups
    backups: '/api/admin/backups',
    backupStats: '/api/admin/backups/stats',
    backupTables: '/api/admin/backups/tables',
    backupSchedule: '/api/admin/backups/schedule',
    backupById: (id: string) => `/api/admin/backups/${id}`,
    downloadBackup: (id: string) => `/api/admin/backups/${id}/download`,
    restoreBackup: (id: string) => `/api/admin/backups/${id}/restore`,
    verifyBackup: (id: string) => `/api/admin/backups/${id}/verify`,
    backupProgress: (id: string) => `/api/admin/backups/${id}/progress`,

    // Security / Sessions
    security: {
      sessions: '/api/admin/security/sessions',
      sessionStats: '/api/admin/security/sessions/stats',
      sessionActivity: '/api/admin/security/sessions/activity',
      revokeSession: (id: string) => `/api/admin/security/sessions/${id}/revoke`,
      revokeOthers: '/api/admin/security/sessions/revoke-others',
      revokeUserSessions: (userId: string) =>
        `/api/admin/security/sessions/user/${userId}/revoke-all`,
      suspendSession: (id: string) => `/api/admin/security/sessions/${id}/suspend`,
      ipWhitelist: '/api/admin/security/ip-whitelist',
      ipWhitelistSettings: '/api/admin/security/ip-whitelist/settings',
      ipWhitelistBlocked: '/api/admin/security/ip-whitelist/blocked',
      ipWhitelistBulk: '/api/admin/security/ip-whitelist/bulk',
      ipWhitelistCheck: '/api/admin/security/ip-whitelist/check',
      ipWhitelistById: (id: string) => `/api/admin/security/ip-whitelist/${id}`,
    },

    // Scheduler
    scheduler: '/api/admin/scheduler',
    schedulerStats: '/api/admin/scheduler/stats',
    schedulerById: (id: string) => `/api/admin/scheduler/${id}`,
    cancelScheduled: (id: string) => `/api/admin/scheduler/${id}/cancel`,
    retryScheduled: (id: string) => `/api/admin/scheduler/${id}/retry`,
    executeScheduled: (id: string) => `/api/admin/scheduler/${id}/execute`,

    // Audit Logs
    auditLogs: '/api/admin/audit-logs',

    // Database
    databasePartitions: '/api/admin/database-partitions',

    // Search
    searchContent: '/api/admin/search/content',

    // Misc
    resetCircuitBreaker: '/api/admin/reset-circuit-breaker',
  },
} as const;

export type ApiRoutes = typeof apiRoutes;
