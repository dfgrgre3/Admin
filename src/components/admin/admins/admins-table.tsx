import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { RoleBadge, StatusBadge } from "@/components/admin/ui/admin-badge";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import type { UserRole, UserStatus } from "@/types/enums";
import { Checkbox } from "@/components/ui/checkbox";

export interface AdminStaffRow {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string | null;
  permissions?: string[];
  createdAt?: string | null;
}

interface AdminsTableProps {
  users: AdminStaffRow[];
  loading?: boolean;
  onViewAdmin?: (id: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "مدير عام",
  ADMIN: "مدير",
  MODERATOR: "مشرف",
  SUPPORT: "دعم فني",
};

const getStatusValue = (status?: UserStatus) => {
  if (status === "ACTIVE") return "active";
  if (status === "INACTIVE") return "inactive";
  if (status === "PENDING_VERIFICATION") return "pending";
  if (status === "SUSPENDED" || status === "BANNED") return "suspended";
  if (status === "DELETED") return "inactive";
  return "inactive";
};

export function AdminsTable({ users, loading = false, onViewAdmin, selectedIds = [], onToggleSelect }: AdminsTableProps) {
  return (
    <div className="rounded-[2rem] border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-foreground">قائمة المشرفين</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "جاري تحميل البيانات..." : `عدد السجلات: ${users.length}`}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground">
          <ArrowUpDown className="h-4 w-4" />
          ترتيب بحسب آخر نشاط
        </div>
      </div>

      <div className="overflow-x-auto">
        {users.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground">لا توجد نتائج</p>
              <p className="mt-1 text-sm text-muted-foreground">لم يتم العثور على أي مشرف يطابق البحث الحالي.</p>
            </div>
          </div>
        ) : (
          <table className="min-w-full border-separate border-spacing-y-2 text-right">
            <thead>
              <tr className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-3 py-3 text-center">اختيار</th>
                <th className="px-3 py-3">المشرف</th>
                <th className="px-3 py-3">الدور</th>
                <th className="px-3 py-3">الحالة</th>
                <th className="px-3 py-3">تاريخ الانضمام</th>
                <th className="px-3 py-3">آخر نشاط</th>
                <th className="px-3 py-3">الصلاحيات</th>
                <th className="px-3 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((admin) => (
                <tr key={admin.id} className="rounded-2xl bg-background/60 shadow-sm ring-1 ring-border/60">
                  <td className="rounded-r-2xl px-3 py-4 text-center">
                    <Checkbox checked={selectedIds.includes(admin.id)} onCheckedChange={() => onToggleSelect?.(admin.id)} />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary">
                        {(admin.name || admin.email || "م").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{admin.name || "اسم غير متوفر"}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <RoleBadge role={admin.role} />
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge status={getStatusValue(admin.status) as any} />
                  </td>
                  <td className="px-3 py-4 text-sm text-muted-foreground">
                    {admin.createdAt ? formatDateTime(admin.createdAt) : "-"}
                  </td>
                  <td className="px-3 py-4 text-sm text-muted-foreground">
                    {admin.lastLogin ? formatRelativeTime(admin.lastLogin) : "غير مسجل"}
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
                      {admin.permissions && admin.permissions.length ? admin.permissions.slice(0, 2).join(" • ") : roleLabels[admin.role] || "صلاحيات"}
                    </span>
                  </td>
                  <td className="rounded-l-2xl px-3 py-4 text-center">
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl px-3"
                      icon={MoreHorizontal}
                      onClick={() => onViewAdmin?.(admin.id)}
                    >
                      الملف
                    </AdminButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
