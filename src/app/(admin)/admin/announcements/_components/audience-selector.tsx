"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { SearchInput } from "@/components/admin/ui/admin-input";
import { Badge } from "@/components/ui/badge";
import {
  AnnouncementAudienceSegment,
  AUDIENCE_OPTIONS,
  DEFAULT_GRADE_OPTIONS,
  DEFAULT_ROLE_OPTIONS,
} from "./types";

interface AudienceSelectorProps {
  segments: AnnouncementAudienceSegment[];
  onSegmentsChange: (segments: AnnouncementAudienceSegment[]) => void;
  grades: string[];
  onGradesChange: (grades: string[]) => void;
  roles: string[];
  onRolesChange: (roles: string[]) => void;
  userIds: string[];
  onUserIdsChange: (ids: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function AudienceSelector({
  segments,
  onSegmentsChange,
  grades,
  onGradesChange,
  roles,
  onRolesChange,
  userIds,
  onUserIdsChange,
  disabled,
  className,
}: AudienceSelectorProps) {
  const toggleSegment = (seg: AnnouncementAudienceSegment) => {
    if (segments.includes(seg)) {
      onSegmentsChange(segments.filter((s) => s !== seg));
    } else {
      onSegmentsChange([...segments, seg]);
    }
  };

  const toggleGrade = (g: string) => {
    if (grades.includes(g)) onGradesChange(grades.filter((x) => x !== g));
    else onGradesChange([...grades, g]);
  };

  const toggleRole = (r: string) => {
    if (roles.includes(r)) onRolesChange(roles.filter((x) => x !== r));
    else onRolesChange([...roles, r]);
  };

  const showGrades = segments.includes("grade");
  const showRoles = segments.includes("role");
  const showUsers = segments.includes("custom");

  // جلب المستخدمين عند الحاجة للقائمة المخصصة
  const [userQuery, setUserQuery] = React.useState("");
  const { data: usersData, isFetching: usersLoading } = useQuery({
    queryKey: ["admin", "announcements", "audience-users", userQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "30", fields: "id,name,email,role" });
      if (userQuery) params.set("search", userQuery);
      const res = await adminFetch(`${apiRoutes.admin.users}?${params.toString()}`);
      if (!res.ok) return { users: [] };
      const json = await res.json();
      return { users: json?.data?.users || json?.users || [] };
    },
    enabled: showUsers,
    staleTime: 30000,
  });

  const toggleUser = (id: string) => {
    if (userIds.includes(id)) onUserIdsChange(userIds.filter((x) => x !== id));
    else onUserIdsChange([...userIds, id]);
  };

  const users = (usersData?.users || []) as Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  }>;

  return (
    <div className={cn("space-y-5 rounded-2xl border border-white/10 bg-white/2.5 p-5", className)}>
      <div className="space-y-1">
        <p className="text-sm font-black flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          الجمهور المستهدف
        </p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          اختر شريحة واحدة أو أكثر من الجمهور
        </p>
      </div>

      {/* بطاقات الشرائح */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCE_OPTIONS.map((opt) => {
          const active = segments.includes(opt.value);
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleSegment(opt.value)}
              disabled={disabled}
              className={cn(
                "group relative rounded-2xl border p-3 text-right transition-all",
                active
                  ? "border-primary/40 bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-white/10 bg-white/2.5 hover:border-white/20 hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/5 text-muted-foreground group-hover:bg-white/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs font-black",
                      active ? "text-primary" : "text-foreground"
                    )}
                  >
                    {opt.label}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground line-clamp-2">
                    {opt.description}
                  </p>
                </div>
                {active && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* تفاصيل إضافية للشرائح التي تحتاج ذلك */}
      {showGrades && (
        <div className="space-y-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            اختر الصف الدراسي
          </p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_GRADE_OPTIONS.map((grade) => {
              const active = grades.includes(grade.value);
              return (
                <button
                  key={grade.value}
                  type="button"
                  onClick={() => toggleGrade(grade.value)}
                  disabled={disabled}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-black transition",
                    active
                      ? "bg-blue-500 text-white shadow"
                      : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {grade.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showRoles && (
        <div className="space-y-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            اختر الدور الإداري
          </p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_ROLE_OPTIONS.map((role) => {
              const active = roles.includes(role.value);
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => toggleRole(role.value)}
                  disabled={disabled}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-black transition",
                    active
                      ? "bg-violet-500 text-white shadow"
                      : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showUsers && (
        <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            قائمة مخصصة — اختر المستخدمين
          </p>
          <SearchInput
            value={userQuery}
            onSearch={setUserQuery}
            placeholder="ابحث عن مستخدم بالاسم أو البريد..."
            className="h-9 rounded-lg bg-white/5"
          />
          {usersLoading && (
            <p className="text-[10px] font-bold text-muted-foreground animate-pulse">
              جاري التحميل...
            </p>
          )}
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg bg-white/5 p-1">
            {users.map((u) => {
              const active = userIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleUser(u.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-right transition",
                    active
                      ? "bg-emerald-500/20 text-foreground"
                      : "hover:bg-white/5 text-muted-foreground"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{u.name || u.email}</p>
                    {u.email && (
                      <p className="truncate text-[10px] font-bold opacity-60">{u.email}</p>
                    )}
                  </div>
                  {active ? (
                    <X className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Check className="h-3.5 w-3.5 opacity-40" />
                  )}
                </button>
              );
            })}
            {!usersLoading && users.length === 0 && (
              <p className="py-3 text-center text-[10px] font-bold text-muted-foreground">
                لا توجد نتائج
              </p>
            )}
          </div>
          {userIds.length > 0 && (
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-muted-foreground">{userIds.length} مستخدم محدد</span>
              <button
                type="button"
                onClick={() => onUserIdsChange([])}
                className="text-red-500 hover:underline"
              >
                مسح الكل
              </button>
            </div>
          )}
        </div>
      )}

      {/* ملخص الجمهور المختار */}
      {segments.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            الجمهور المختار:
          </span>
          {segments.map((seg) => (
            <Badge
              key={seg}
              variant="secondary"
              className="gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary"
            >
              {AUDIENCE_OPTIONS.find((o) => o.value === seg)?.label}
              <button
                type="button"
                onClick={() => toggleSegment(seg)}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}