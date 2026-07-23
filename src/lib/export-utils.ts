"use client";

import * as React from "react";

export interface ExportColumn<T = any> {
  header: string;
  accessor: string | ((row: T) => any);
}

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  let str = typeof value === "string" ? value : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function resolveAccessor<T>(col: ExportColumn<T>, row: T): string {
  const value = typeof col.accessor === "function" ? col.accessor(row) : (row as any)[col.accessor];
  return escapeCsvValue(value);
}

export function exportToCSV<T>(data: T[], columns: ExportColumn<T>[], filename: string): void {
  try {
    const headers = columns.map(col => escapeCsvValue(col.header)).join(",");
    const rows = data.map(row => columns.map(col => resolveAccessor(col, row)).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

export function exportToJSON(data: any, filename: string): void {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

export function useExport() {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportCSV = React.useCallback(<T,>(data: T[], columns: ExportColumn<T>[], filename: string) => {
    setIsExporting(true);
    try {
      exportToCSV(data, columns, filename);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleExportJSON = React.useCallback((data: any, filename: string) => {
    setIsExporting(true);
    try {
      exportToJSON(data, filename);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportToCSV: handleExportCSV,
    exportToJSON: handleExportJSON,
  };
}

export function useDashboardExport(stats: any) {
  const { exportToCSV, exportToJSON, isExporting } = useExport();

  const exportDashboardData = React.useCallback(() => {
    const data = [
      {
        category: "المستخدمين",
        metric: "إجمالي المستخدمين",
        value: stats.totalUsers || 0,
      },
      {
        category: "المستخدمين",
        metric: "الطلاب النشطون",
        value: stats.activeStudents || 0,
      },
      {
        category: "المستخدمين",
        metric: "المدرّسون",
        value: stats.totalTeachers || 0,
      },
      {
        category: "المستخدمين",
        metric: "مستخدمون جدد اليوم",
        value: stats.newUsersToday || 0,
      },
      {
        category: "المستخدمين",
        metric: "مستخدمون جدد هذا الأسبوع",
        value: stats.newUsersThisWeek || 0,
      },
      {
        category: "الكورسات",
        metric: "الكورسات المنشورة",
        value: stats.publishedCourses || 0,
      },
      {
        category: "الكورسات",
        metric: "قيد المراجعة",
        value: stats.reviewCourses || 0,
      },
      {
        category: "الكورسات",
        metric: "المسودات",
        value: stats.draftCourses || 0,
      },
      {
        category: "الامتحانات",
        metric: "إجمالي الامتحانات",
        value: stats.totalExams || 0,
      },
      {
        category: "الامتحانات",
        metric: "محاولات الاختبار",
        value: stats.examsTaken || 0,
      },
      {
        category: "الإيرادات",
        metric: "الإيرادات اليومية",
        value: stats.dailyRevenue || 0,
      },
      {
        category: "الإيرادات",
        metric: "الإيرادات الشهرية",
        value: stats.monthlyRevenue || 0,
      },
      {
        category: "الاشتراكات",
        metric: "اشتراكات جديدة",
        value: stats.newSubscriptions || 0,
      },
      {
        category: "الاشتراكات",
        metric: "اشتراكات ملغاة",
        value: stats.cancelledSubscriptions || 0,
      },
      {
        category: "العمليات",
        metric: "طلبات معلقة",
        value: stats.pendingOrders || 0,
      },
      {
        category: "العمليات",
        metric: "تذاكر مفتوحة",
        value: stats.openTickets || 0,
      },
      {
        category: "العمليات",
        metric: "البلاغات",
        value: stats.moderationQueue || 0,
      },
      {
        category: "العمليات",
        metric: "مهام تحتاج موافقة",
        value: stats.pendingApprovals || 0,
      },
      {
        category: "التفاعل",
        metric: "معدل الإكمال",
        value: `${Math.round(stats.completionRate || 0)}%`,
      },
      {
        category: "التفاعل",
        metric: "ساعات الدراسة",
        value: Math.round((stats.studyMinutes || 0) / 60),
      },
    ];

    const columns: ExportColumn[] = [
      { header: "الفئة", accessor: "category" },
      { header: "المؤشر", accessor: "metric" },
      { header: "القيمة", accessor: "value" },
    ];

    exportToCSV(data, columns, "dashboard_report");
  }, [stats, exportToCSV]);

  const exportTopCourses = React.useCallback(() => {
    if (!stats.topSellingCourses || stats.topSellingCourses.length === 0) {
      return;
    }

    const columns: ExportColumn[] = [
      { header: "اسم الكورس", accessor: "title" },
      { header: "المبيعات", accessor: "sales" },
      {
        header: "الإيرادات",
        accessor: (row: any) => `${row.revenue} ج.م`,
      },
    ];

    exportToCSV(stats.topSellingCourses, columns, "top_courses");
  }, [stats.topSellingCourses, exportToCSV]);

  return {
    isExporting,
    exportDashboardData,
    exportTopCourses,
    exportToJSON,
  };
}
