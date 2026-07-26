"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Search,
  Download,
  RefreshCw,
  Activity,
  LogIn,
  LogOut,
  Lock,
  Shield,
  UserCheck,
  UserX,
  Ban,
  BookOpen,
  CheckCircle,
  Trophy,
  CreditCard,
  Ticket,
  FileText,
  AlertTriangle,
  Eye,
  Filter,
  Calendar,
  Monitor,
  MapPin,
  Loader2,
} from "lucide-react";
import { format, isValid, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

// ─── Event Type Configuration ─────────────────────────────────────────────────

const eventConfig: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  category: "security" | "academic" | "financial" | "admin" | "system";
}> = {
  login:               { label: "تسجيل دخول",          icon: LogIn,       color: "text-blue-500",   bg: "bg-blue-500/10",   category: "security" },
  logout:              { label: "تسجيل خروج",          icon: LogOut,      color: "text-slate-500",  bg: "bg-slate-500/10",  category: "security" },
  failed_login:        { label: "محاولة دخول فاشلة",   icon: AlertTriangle, color: "text-red-500",  bg: "bg-red-500/10",    category: "security" },
  password_changed:    { label: "تغيير كلمة المرور",   icon: Lock,        color: "text-purple-500", bg: "bg-purple-500/10", category: "security" },
  password_reset:      { label: "إعادة تعيين كلمة المرور", icon: Lock,    color: "text-purple-500", bg: "bg-purple-500/10", category: "security" },
  email_changed:       { label: "تغيير البريد",         icon: Shield,      color: "text-cyan-500",   bg: "bg-cyan-500/10",   category: "security" },
  phone_changed:       { label: "تغيير الهاتف",         icon: Shield,      color: "text-cyan-500",   bg: "bg-cyan-500/10",   category: "security" },
  "2fa_enabled":       { label: "تفعيل التحقق الثنائي", icon: Shield,     color: "text-green-500",  bg: "bg-green-500/10",  category: "security" },
  "2fa_disabled":      { label: "إلغاء التحقق الثنائي", icon: Shield,     color: "text-red-500",    bg: "bg-red-500/10",    category: "security" },
  profile_updated:     { label: "تحديث الملف الشخصي",  icon: UserCheck,   color: "text-indigo-500", bg: "bg-indigo-500/10", category: "system" },
  role_changed:        { label: "تغيير الدور",          icon: Shield,      color: "text-amber-500",  bg: "bg-amber-500/10",  category: "admin" },
  status_changed:      { label: "تغيير الحالة",         icon: Activity,    color: "text-orange-500", bg: "bg-orange-500/10", category: "admin" },
  banned:              { label: "حظر الحساب",           icon: Ban,         color: "text-red-600",    bg: "bg-red-600/10",    category: "admin" },
  unbanned:            { label: "رفع الحظر",            icon: UserCheck,   color: "text-green-600",  bg: "bg-green-600/10",  category: "admin" },
  suspended:           { label: "إيقاف مؤقت",           icon: UserX,       color: "text-amber-600",  bg: "bg-amber-600/10",  category: "admin" },
  reactivated:         { label: "إعادة تفعيل",          icon: UserCheck,   color: "text-green-500",  bg: "bg-green-500/10",  category: "admin" },
  enrolled:            { label: "تسجيل في دورة",        icon: BookOpen,    color: "text-violet-500", bg: "bg-violet-500/10", category: "academic" },
  unenrolled:          { label: "إلغاء تسجيل",          icon: BookOpen,    color: "text-red-400",    bg: "bg-red-400/10",    category: "academic" },
  lesson_completed:    { label: "إتمام درس",            icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", category: "academic" },
  course_completed:    { label: "إتمام دورة",           icon: Trophy,      color: "text-yellow-500", bg: "bg-yellow-500/10", category: "academic" },
  certificate_issued:  { label: "إصدار شهادة",          icon: Trophy,      color: "text-amber-500",  bg: "bg-amber-500/10",  category: "academic" },
  order_created:       { label: "طلب جديد",             icon: CreditCard,  color: "text-green-500",  bg: "bg-green-500/10",  category: "financial" },
  payment_succeeded:   { label: "دفع ناجح",             icon: CreditCard,  color: "text-green-600",  bg: "bg-green-600/10",  category: "financial" },
  payment_failed:      { label: "فشل الدفع",            icon: CreditCard,  color: "text-red-500",    bg: "bg-red-500/10",    category: "financial" },
  refund_issued:       { label: "استرداد مبلغ",         icon: CreditCard,  color: "text-purple-500", bg: "bg-purple-500/10", category: "financial" },
  ticket_created:      { label: "فتح تذكرة دعم",        icon: Ticket,      color: "text-sky-500",    bg: "bg-sky-500/10",    category: "system" },
  note_added:          { label: "إضافة ملاحظة إدارية", icon: FileText,    color: "text-slate-500",  bg: "bg-slate-500/10",  category: "admin" },
  impersonated:        { label: "تبديل الهوية",          icon: Eye,         color: "text-red-500",    bg: "bg-red-500/10",    category: "admin" },
  data_export:         { label: "تصدير بيانات",          icon: Download,    color: "text-gray-500",   bg: "bg-gray-500/10",   category: "system" },
};

const getEventConfig = (type: string) => eventConfig[type] ?? {
  label: type,
  icon: Activity,
  color: "text-muted-foreground",
  bg: "bg-muted",
  category: "system" as const,
};

const categoryLabels: Record<string, string> = {
  all: "كل الأحداث",
  security: "الأمان",
  academic: "أكاديمي",
  financial: "مالي",
  admin: "إداري",
  system: "النظام",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserActivityPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const limit = 30;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["user-activity", userId, page, limit],
    queryFn: () => adminUsersApi.getActivity(userId, { limit: limit * page }),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const { data: userData } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => adminUsersApi.get(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const allEvents = data?.feed ?? [];

  const filteredEvents = allEvents.filter(event => {
    const cfg = getEventConfig(event.type);
    const matchesCategory = category === "all" || cfg.category === category;
    const matchesSearch = !search || event.title.toLowerCase().includes(search.toLowerCase())
      || event.type.toLowerCase().includes(search.toLowerCase())
      || event.detail?.toLowerCase().includes(search.toLowerCase())
      || event.ip?.includes(search);
    return matchesCategory && matchesSearch;
  });

  // Group by date
  const grouped = filteredEvents.reduce<Record<string, typeof filteredEvents>>((acc, event) => {
    const date = isValid(new Date(event.timestamp))
      ? format(new Date(event.timestamp), "yyyy-MM-dd")
      : "unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const groupedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const stats = {
    total: data?.total ?? 0,
    filtered: filteredEvents.length,
    logins: allEvents.filter(e => (e.type as string) === "login").length,
    failed: allEvents.filter(e => (e.type as string) === "failed_login").length,
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={`سجل النشاط — ${userData?.name || userData?.email || userId}`}
          description="جدول زمني شامل لكل أحداث المستخدم من تسجيل دخول وإجراءات إدارية وأحداث أكاديمية ومالية."
          className="p-0"
        />
        <div className="flex items-center gap-2">
          <AdminButton
            variant="outline"
            icon={ArrowRight}
            className="rounded-2xl border-white/10"
            onClick={() => router.push(`/admin/users/${userId}`)}
          >
            ملف المستخدم
          </AdminButton>
          <AdminButton
            variant="outline"
            icon={RefreshCw}
            className="rounded-2xl border-white/10"
            onClick={() => void refetch()}
          >
            تحديث
          </AdminButton>
          <AdminButton icon={Download} className="rounded-2xl">
            تصدير CSV
          </AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الأحداث", value: stats.total, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "تسجيلات الدخول", value: stats.logins, icon: LogIn, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "محاولات فاشلة", value: stats.failed, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "النتائج المعروضة", value: stats.filtered, icon: Filter, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map(s => (
          <Card key={s.label} className="border-white/10 bg-card/50 backdrop-blur">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black">{s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-bold">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-white/10 bg-card/30 backdrop-blur">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث في الأحداث، الـ IP، التفاصيل..."
              className="pr-9 rounded-xl h-10 bg-accent/10 border-white/10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40 rounded-xl h-10 bg-accent/10 border-white/10">
              <Filter className="h-4 w-4 ml-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(search || category !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setCategory("all"); }} className="rounded-xl">
              مسح الفلاتر
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-8">
        {isLoading ? (
          <Card className="p-6 border-white/10"><ActivitySkeleton /></Card>
        ) : isError ? (
          <Card className="p-6 border-destructive/20 bg-destructive/5 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-bold text-destructive mb-2">تعذر تحميل سجل النشاط</p>
            <Button variant="outline" onClick={() => void refetch()} className="rounded-xl">
              <RefreshCw className="h-4 w-4 ml-2" /> إعادة المحاولة
            </Button>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-12 border-white/10 text-center">
            <Activity className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-black text-muted-foreground">لا يوجد نشاط</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || category !== "all" ? "لا توجد أحداث مطابقة لهذه الفلاتر" : "لا يوجد نشاط مسجل لهذا المستخدم بعد."}
            </p>
          </Card>
        ) : (
          groupedDates.map(dateKey => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-white/5">
                  <Calendar className="h-3.5 w-3.5" />
                  {isValid(new Date(dateKey))
                    ? format(new Date(dateKey), "EEEE، d MMMM yyyy", { locale: ar })
                    : dateKey}
                </div>
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-xs text-muted-foreground">{(grouped[dateKey] || []).length} حدث</span>
              </div>

              {/* Events */}
              <div className="space-y-2 mr-4">
                {(grouped[dateKey] || []).map((event, idx) => {
                  const cfg = getEventConfig(event.type);
                  const Icon = cfg.icon;
                  const eventDate = new Date(event.timestamp);
                  const isValidDate = isValid(eventDate);

                  return (
                    <div
                      key={event.id || idx}
                      className="group relative flex gap-4 p-4 rounded-2xl border border-white/5 bg-card/40 hover:bg-card/80 hover:border-white/10 transition-all duration-200"
                    >
                      {/* Icon */}
                      <div className={`flex-none flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bg} transition-transform group-hover:scale-110`}>
                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2">
                          <p className="font-bold text-sm">{event.title || cfg.label}</p>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0 font-bold ${cfg.color} border-current/30 bg-transparent`}>
                            {cfg.label}
                          </Badge>
                          {event.status && (
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 font-bold ${event.status === "success" || event.status === "SUCCESS" ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"}`}>
                              {event.status === "success" || event.status === "SUCCESS" ? "✓ نجاح" : "✗ فشل"}
                            </Badge>
                          )}
                        </div>

                        {event.detail && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.detail}</p>
                        )}

                        {/* Meta: IP + Time */}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-muted-foreground/70">
                          {event.ip && (
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              <span dir="ltr" className="font-mono">{event.ip}</span>
                            </span>
                          )}
                          {isValidDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(eventDate, "HH:mm:ss")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Relative Time */}
                      <div className="text-right text-[11px] text-muted-foreground flex-none">
                        {isValidDate ? formatDistanceToNow(eventDate, { locale: ar, addSuffix: true }) : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Load More */}
        {!isLoading && data && filteredEvents.length < stats.total && (
          <div className="text-center">
            <Button
              variant="outline"
              className="rounded-2xl px-8 border-white/10"
              onClick={() => setPage(p => p + 1)}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              تحميل المزيد ({stats.total - filteredEvents.length} حدث متبقي)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
