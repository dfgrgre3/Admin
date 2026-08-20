"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Globe, Mail, Phone, Share2, Wrench, RefreshCw, Save, Download,
  AlertTriangle, Clock, Zap, Lock, Layout, Server, Users, MessageCircle,
  Target, TrendingUp, Sparkles, Star, Shield, CreditCard, HardDrive,
  Gauge, Eye, Bell, Languages, Palette, Search, XCircle,
  type LucideIcon,
} from "lucide-react";
import { SettingsSkeleton } from "@/components/admin/ui/loading-skeleton";
import { logger } from '@/lib/logger';
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { cn } from "@/lib/utils";
import { settingsSchema, getSafeSettings, type SettingsFormValues, type TabConfig } from "./_components/types";
import { SettingsIconButton } from "./_components/shared";
import { GeneralTab } from "./_components/tabs-general";
import { FeaturesTab } from "./_components/tabs-features";
import { SocialTab } from "./_components/tabs-social";
import { EmailTab } from "./_components/tabs-email";
import { EngagementTab } from "./_components/tabs-engagement";
import { LimitsTab } from "./_components/tabs-limits";
import { MaintenanceTab } from "./_components/tabs-maintenance";
import { SecurityTab } from "./_components/tabs-security";
import { PaymentsTab } from "./_components/tabs-payments";
import { StorageTab } from "./_components/tabs-storage";
import { PerformanceTab } from "./_components/tabs-performance";
import { PrivacyTab } from "./_components/tabs-privacy";
import { NotificationsSettingsTab } from "./_components/tabs-notifications";
import { LocalizationTab } from "./_components/tabs-localization";
import { ThemeTab } from "./_components/tabs-theme";
import { useUIState } from "@/hooks/use-ui-state";

// ============================================================
// Tab configuration
// ============================================================
const TABS: TabConfig[] = [
  { value: "general", label: "الهوية العامة", icon: Globe, color: "blue", group: "عامة" },
  { value: "features", label: "المزايا", icon: Zap, color: "amber", group: "عامة" },
  { value: "social", label: "التواصل", icon: Share2, color: "pink", group: "عامة" },
  { value: "engagement", label: "التحفيز", icon: Star, color: "purple", group: "النظام" },
  { value: "limits", label: "الحدود", icon: Wrench, color: "emerald", group: "النظام" },
  { value: "maintenance", label: "الصيانة", icon: Server, color: "red", group: "النظام" },
  { value: "email", label: "البريد", icon: Mail, color: "sky", group: "البنية التحتية" },
  { value: "security", label: "الأمان", icon: Shield, color: "rose", group: "البنية التحتية" },
  { value: "payments", label: "المدفوعات", icon: CreditCard, color: "green", group: "البنية التحتية" },
  { value: "storage", label: "التخزين", icon: HardDrive, color: "cyan", group: "البنية التحتية" },
  { value: "performance", label: "الأداء", icon: Gauge, color: "orange", group: "البنية التحتية" },
  { value: "privacy", label: "الخصوصية", icon: Eye, color: "indigo", group: "التجربة" },
  { value: "notifications", label: "الإشعارات", icon: Bell, color: "yellow", group: "التجربة" },
  { value: "localization", label: "اللغة", icon: Languages, color: "teal", group: "التجربة" },
  { value: "theme", label: "المظهر", icon: Palette, color: "violet", group: "التجربة" },
];

const TAB_GROUPS = Array.from(new Set(TABS.map((t) => t.group)));

// ============================================================
// Main Page Component
// ============================================================
export default function AdminSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [_lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = useUIState<string>("settings-active-tab", "general");
  const [confirmMaintenance, setConfirmMaintenance] = React.useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "", siteDescription: "", siteKeywords: "", contactEmail: "", supportPhone: "",
      socialLinks: {},
      features: { registration: true, emailVerification: true, engagement: true, forum: true, blog: true, events: true, aiAssistant: true },
      engagement: { pointsPerTask: 10, pointsPerStudySession: 5, pointsPerExam: 20, streakBonus: 2 },
      limits: { maxUploadSize: 10, maxStudySessionDuration: 180, examTimeLimit: 60 },
      maintenance: { enabled: false, message: "" },
      email: { smtpHost: "", smtpPort: 587, smtpUsername: "", smtpPassword: "", fromAddress: "", fromName: "", encryption: "tls", enabled: true, maxBatchSize: 50, throttleMs: 200 },
      security: { passwordMinLength: 8, passwordRequireUppercase: true, passwordRequireLowercase: true, passwordRequireNumbers: true, passwordRequireSymbols: false, sessionTimeoutMinutes: 60, maxLoginAttempts: 5, lockoutDurationMinutes: 15, enforce2FA: false, rateLimitPerMinute: 30, rateLimitPerHour: 200, hstsEnabled: true, contentSecurityPolicy: "default-src 'self'" },
      payments: { currency: "EGP", currencySymbol: "ج.م", taxRate: 14, enablePaymob: true, enableWallet: true, enableCash: false, minDepositAmount: 10, maxDepositAmount: 10000, autoConfirmPayments: false, invoicePrefix: "INV-", paymentTimeoutMinutes: 30 },
      storage: { provider: "local", maxUploadSizeMB: 50, imageQuality: 80, imageMaxWidth: 1920, imageMaxHeight: 1080, enableCDN: false, cdnUrl: "", enableCompression: true, enableThumbnails: true, thumbnailWidth: 300, thumbnailHeight: 200, cleanupTempFilesAfterHours: 24 },
      performance: { enableCaching: true, cacheTTLSeconds: 300, enableRedis: true, enableImageOptimization: true, enableLazyLoading: true, paginationDefaultLimit: 20, paginationMaxLimit: 100, enableGzipCompression: true, enableMinification: true, queryTimeoutSeconds: 30, maxConcurrentRequests: 100, enableDbConnectionPooling: true, dbPoolMaxOpenConns: 25, dbPoolMaxIdleConns: 10, dbPoolConnMaxLifetimeMinutes: 30 },
      privacy: { termsOfServiceUrl: "", privacyPolicyUrl: "", cookiePolicyUrl: "", enableCookieConsent: true, enableGDPR: false, dataRetentionDays: 365, enableAnalytics: true, analyticsProvider: "", analyticsId: "", enableUserDataExport: true, enableAccountDeletion: true, deletionGracePeriodDays: 30, minAgeRequirement: 16, parentalConsentRequired: false, showWatermarkOnContent: false, watermarkText: "" },
      notifications: { enablePushNotifications: true, enableEmailNotifications: true, enableSmsNotifications: false, pushProvider: "firebase", firebaseServerKey: "", firebaseSenderId: "", onesignalAppId: "", onesignalApiKey: "", dailyDigestEnabled: true, digestTime: "08:00", maxNotificationsPerDay: 10, quietHoursStart: "22:00", quietHoursEnd: "08:00" },
      localization: { defaultLanguage: "ar", fallbackLanguage: "en", enableRTL: true, dateFormat: "YYYY-MM-DD", timeFormat: "HH:mm", timezone: "Africa/Cairo", numberFormat: "ar-EG" },
      theme: { primaryColor: "#6366f1", secondaryColor: "#8b5cf6", accentColor: "#f59e0b", backgroundColor: "#0f172a", surfaceColor: "#1e293b", textColor: "#f8fafc", fontFamily: "Cairo, sans-serif", fontSize: "16px", borderRadius: "12px", logoUrl: "", faviconUrl: "", ogImageUrl: "", customCSS: "" },
    },
  });

  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch(apiRoutes.admin.settings);
      const data = await response.json();
      const safeSettings = getSafeSettings(data);
      form.reset(safeSettings);
    } catch (err: unknown) {
      toast.error("حدث خطأ أثناء جلب الإعدادات");
      logger.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [form]);

  React.useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (values: SettingsFormValues) => {
    if (values.maintenance.enabled && !confirmMaintenance) {
      setConfirmMaintenance(true);
      toast.warning("يرجى تأكيد تفعيل وضع الصيانة بالضغط على حفظ مرة أخرى");
      return;
    }
    setConfirmMaintenance(false);
    setSaving(true);
    try {
      const response = await adminFetch(apiRoutes.admin.settings, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, siteKeywords: values.siteKeywords.split(",").map((k: string) => k.trim()).filter(Boolean) }),
      });
      if (response.ok) {
        toast.success("تم حفظ إعدادات النظام بنجاح");
        setLastSaved(new Date());
        setHasChanges(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData?.errors?.length ? errorData.errors.join("\n") : "فشل في حفظ الإعدادات");
      }
    } catch (err: unknown) {
      toast.error("خطأ في الاتصال بالخادم");
      logger.error(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  };

  const handleReset = async () => {
    try {
      const response = await adminFetch(apiRoutes.admin.settings, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reset: true }),
      });
      if (response.ok) {
        const data = await response.json();
        form.reset(getSafeSettings(data));
        toast.success("تمت العودة للقيم الافتراضية");
      }
    } catch (err: unknown) {
      toast.error("فشل في استعادة القيم الأصلية");
      logger.error(err instanceof Error ? err.message : String(err));
    }
  };

  const handleExportSettings = () => {
    const settings = form.getValues();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `system-settings-${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
    toast.success("تم تصدير نسخة من إعدادات المنصة");
  };

  React.useEffect(() => {
    const subscription = form.watch(() => setHasChanges(form.formState.isDirty));
    return () => subscription.unsubscribe();
  }, [form]);

  const filteredTabs = React.useMemo(() => {
    if (!searchQuery) return TABS;
    const q = searchQuery.toLowerCase();
    return TABS.filter((t) => t.label.includes(q) || t.group.includes(q) || t.value.includes(q));
  }, [searchQuery]);

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="إعدادات المنصة المركزية" description="إدارة التكوينات الأساسية، تفعيل المزايا التعليمية، وشؤون الصيانة العامة للنظام.">
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black h-8 px-4 rounded-xl">
              تعديلات معلقة
            </Badge>
          )}
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
            <SettingsIconButton icon={Download} onClick={handleExportSettings} title="تصدير الإعدادات" />
            <SettingsIconButton icon={RefreshCw} onClick={handleReset} title="استعادة الافتراضي" />
            <div className="w-px h-6 bg-white/10 self-center mx-1" />
            <AdminButton variant="premium" size="sm" onClick={form.handleSubmit(handleSave)} disabled={saving || !hasChanges} className="h-9 px-6 rounded-xl font-black shadow-xl" icon={Save}>
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </AdminButton>
          </div>
        </div>
      </PageHeader>

      <div className="relative max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث في الإعدادات..." className="h-12 rounded-2xl border-white/10 bg-white/5 pr-12 font-bold" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
            <TabsList className="flex flex-wrap h-auto bg-card/50 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] gap-2 items-center justify-center">
              {TAB_GROUPS.map((group) => (
                <React.Fragment key={group}>
                  {group !== TAB_GROUPS[0] && <div className="w-px h-8 bg-white/10 mx-1" />}
                  {TABS.filter((t) => t.group === group).map((tab) => {
                    const isVisible = filteredTabs.includes(tab);
                    if (!isVisible && searchQuery) return null;
                    return (
                      <TabsTrigger key={tab.value} value={tab.value}
                        className={cn("rounded-2xl h-11 px-5 data-[state=active]:bg-white/10 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all border border-transparent data-[state=active]:border-white/10", !isVisible && "hidden")}>
                        <tab.icon className={cn("w-4 h-4", `text-${tab.color}-500`)} />
                        {tab.label}
                      </TabsTrigger>
                    );
                  })}
                </React.Fragment>
              ))}
            </TabsList>

            <TabsContent value="general"><GeneralTab form={form} /></TabsContent>
            <TabsContent value="features"><FeaturesTab form={form} /></TabsContent>
            <TabsContent value="social"><SocialTab form={form} /></TabsContent>
            <TabsContent value="engagement"><EngagementTab form={form} /></TabsContent>
            <TabsContent value="limits"><LimitsTab form={form} /></TabsContent>
            <TabsContent value="maintenance"><MaintenanceTab form={form} /></TabsContent>
            <TabsContent value="email"><EmailTab form={form} /></TabsContent>
            <TabsContent value="security"><SecurityTab form={form} /></TabsContent>
            <TabsContent value="payments"><PaymentsTab form={form} /></TabsContent>
            <TabsContent value="storage"><StorageTab form={form} /></TabsContent>
            <TabsContent value="performance"><PerformanceTab form={form} /></TabsContent>
            <TabsContent value="privacy"><PrivacyTab form={form} /></TabsContent>
            <TabsContent value="notifications"><NotificationsSettingsTab form={form} /></TabsContent>
            <TabsContent value="localization"><LocalizationTab form={form} /></TabsContent>
            <TabsContent value="theme"><ThemeTab form={form} /></TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}