"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { UserRole } from "@/types/enums";
import { AdminsStats } from "./admins-stats";
import { AdminsToolbar } from "./admins-toolbar";
import { AdminsTable, type AdminStaffRow } from "./admins-table";

const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT] as const;

export function AdminsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<"all" | UserRole>("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-staff", search, selectedRole],
    queryFn: async () => {
      const response = await adminUsersApi.list({
        page: 1,
        limit: 200,
        search: search.trim() || undefined,
        role: selectedRole === "all" ? undefined : selectedRole,
        sortBy: "lastLogin",
        sortOrder: "desc",
      });

      const staff = (response.users || []).filter((user) => STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number]));
      const mapped: AdminStaffRow[] = staff.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        permissions: user.permissions ?? [],
        createdAt: user.createdAt,
      }));

      const active = mapped.filter((user) => user.status === "ACTIVE").length;
      const pending = mapped.filter((user) => user.status === "PENDING_VERIFICATION").length;
      const critical = mapped.filter((user) => user.status === "SUSPENDED" || user.status === "BANNED" || user.status === "DELETED").length;

      return {
        users: mapped,
        stats: {
          total: mapped.length,
          active,
          pending,
          critical,
        },
      };
    },
    staleTime: 30000,
  });

  const stats = data?.stats ?? { total: 0, active: 0, pending: 0, critical: 0 };

  const headerBadge = useMemo(() => `${stats.total} عضو`, [stats.total]);

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      <PageHeader
        title="إدارة المشرفين"
        description="إدارة حسابات المشرفين والصلاحيات والمهام اليومية ضمن لوحة التحكم المركزية."
        eyebrow="المستخدمون"
        badge={headerBadge}
        meta={
          <>
            <AdminBadge variant="outline" status="success" dot>
              نشط
            </AdminBadge>
            <AdminBadge variant="outline" status="info" dot>
              {stats.pending} قيد المراجعة
            </AdminBadge>
          </>
        }
      >
        <AdminButton variant="outline" icon={Bell} className="rounded-xl">
          التنبيهات
        </AdminButton>
        <AdminButton variant="gradient" icon={Plus} className="rounded-xl" onClick={() => router.push("/admin/users/create?role=ADMIN")}>
          إضافة مشرف
        </AdminButton>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <AdminsStats {...stats} />
          <AdminsToolbar
            search={search}
            selectedRole={selectedRole}
            onSearchChange={setSearch}
            onRoleChange={setSelectedRole}
            onAddAdmin={() => router.push("/admin/users/create?role=ADMIN")}
          />
          {isError ? (
            <div className="rounded-[2rem] border border-red-500/30 bg-red-500/5 p-6 text-red-600">
              فشل تحميل بيانات المشرفين: {error instanceof Error ? error.message : "خطأ غير معروف"}
            </div>
          ) : (
            <AdminsTable
              users={data?.users ?? []}
              loading={isLoading}
              onViewAdmin={(id) => router.push(`/admin/users/${id}`)}
            />
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مراقبة الأمان</p>
                <h3 className="text-lg font-black">نظرة سريعة</h3>
              </div>
            </div>

            <div className="space-y-3">
              {[
                ["المشرفون النشطون", `${stats.active}/${stats.total}`],
                ["الحالات الحرجة", String(stats.critical)],
                ["قيد المراجعة", String(stats.pending)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2.5">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-base font-black text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-dashed border-primary/30 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">إجراءات سريعة</p>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              <li>• مراجعة صلاحيات المشرفين</li>
              <li>• حذف الوصول من الحسابات القديمة</li>
              <li>• تفعيل المصادقة الثنائية</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
