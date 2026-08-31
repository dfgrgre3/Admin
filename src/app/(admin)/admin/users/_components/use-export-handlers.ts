import { toast } from "sonner";
import { logger } from '@/lib/logger';
import { useExport, ExportColumn } from '@/lib/export-utils';
import { adminAudit } from '@/lib/admin-audit';
import type { AdminUserListItem } from '@/lib/api/admin-users-api';

export function useUserExport(s: any) {
  const { exportToCSV, exportToJSON } = useExport();

  const handleExportCSV = async () => {
    if (!s.canExportUsers) return toast.error("غير مصرح بتصدير المستخدمين");
    s.setExporting(true);
    try {
      const users = await s.fetchExportRows();
      if (!users.length) return toast.error('لا توجد بيانات للتصدير');

      const exportColumns: ExportColumn<AdminUserListItem>[] = [
        { header: 'الاسم', accessor: (u) => u.name || u.username || "بدون اسم" },
        { header: 'اسم المستخدم', accessor: (u) => u.username || "" },
        { header: 'البريد الإلكتروني', accessor: 'email' },
        { header: 'الهاتف', accessor: (u) => u.phone || "" },
        { header: 'الدور', accessor: 'role' },
        { header: 'الحالة', accessor: 'status' },
        { header: 'الدولة', accessor: (u) => u.country || "" },
        { header: 'المدينة', accessor: (u) => u.city || "" },
        { header: 'الجنس', accessor: (u) => u.gender || "" },
        { header: 'البريد موثق', accessor: (u) => u.emailVerified ? "نعم" : "لا" },
        { header: 'الهاتف موثق', accessor: (u) => u.phoneVerified ? "نعم" : "لا" },
        { header: 'الرصيد', accessor: (u) => u.walletBalance || 0 },
        { header: 'عدد الكورسات', accessor: (u) => u.coursesCount || 0 },
        { header: 'عدد الطلبات', accessor: (u) => u.ordersCount || 0 },
        { header: 'عدد الشهادات', accessor: (u) => u.certificatesCount || 0 },
        { header: 'عدد الأجهزة', accessor: (u) => u.devicesCount || 0 },
        { header: 'تاريخ التسجيل', accessor: (u) => new Date(u.createdAt).toLocaleDateString('ar-EG') },
        { header: 'آخر دخول', accessor: (u) => u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول' },
      ];
      exportToCSV(users, exportColumns, 'users');
      toast.success(`تم تصدير ${users.length} مستخدم بنجاح`);
      adminAudit.record("users.export", { format: "csv", count: users.length });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast.info("تم إلغاء عملية التصدير");
        return;
      }
      logger.error("فشل تصدير CSV", err);
      toast.error("فشل تصدير بيانات المستخدمين");
    } finally {
      s.setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!s.canExportUsers) return toast.error("غير مصرح بتصدير المستخدمين");
    s.setExportingJson(true);
    try {
      const users = await s.fetchExportRows();
      if (!users.length) return toast.error('لا توجد بيانات للتصدير');
      exportToJSON(users, 'users');
      toast.success(`تم تصدير ${users.length} مستخدم بنجاح`);
      adminAudit.record("users.export", { format: "json", count: users.length });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      logger.error("فشل تصدير JSON", err);
      toast.error("فشل تصدير بيانات المستخدمين");
    } finally {
      s.setExportingJson(false);
    }
  };

  return { handleExportCSV, handleExportJSON };
}
