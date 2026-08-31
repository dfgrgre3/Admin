import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Users, Download, Upload, UserPlus, FileJson } from "lucide-react";

export function UserListHeader({
  totalUsers,
  onlineNow,
  canExportUsers,
  canImportUsers,
  canCreateUsers,
  exporting,
  exportingJson,
  handleExportCSV,
  handleExportJSON,
  onImportClick,
  onCreateClick
}: any) {
  return (
    <PageHeader
      title="إدارة مستخدمي المنصة ⚙️"
      description="إدارة جميع مستخدمي المنصة، أدوارهم، وصلاحياتهم، وجميع البيانات المرتبطة بهم من مكان واحد."
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-black">
            <Users className="h-3 w-3" /> {totalUsers || 0} مستخدم
          </span>
          {onlineNow !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2.5 py-1 text-[11px] font-black">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {onlineNow || 0} متصل الآن
            </span>
          )}
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        {canExportUsers && (
          <>
            <AdminButton variant="outline" icon={Download} onClick={handleExportCSV} loading={exporting} className="rounded-2xl border-white/10">
              تصدير CSV
            </AdminButton>
            <AdminButton variant="outline" icon={FileJson} onClick={handleExportJSON} loading={exportingJson} className="rounded-2xl border-white/10">
              JSON
            </AdminButton>
          </>
        )}
        {canImportUsers && (
          <AdminButton variant="outline" icon={Upload} onClick={onImportClick} className="rounded-2xl border-white/10">
            استيراد CSV
          </AdminButton>
        )}
        {canCreateUsers && (
          <AdminButton variant="premium" icon={UserPlus} onClick={onCreateClick} className="rounded-2xl shadow-xl">
            إضافة مستخدم جديد
          </AdminButton>
        )}
      </div>
    </PageHeader>
  );
}
