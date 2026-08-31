"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { ReportCard, ReportsEmptyState, ReportsLoadingState } from "../_tabs/_reports/report-card";
import { ReportsStats } from "../_tabs/_reports/reports-stats";
import type { Report } from "../_tabs/_reports/report-types";

interface UserReportsTabProps {
  userId: string;
}

export function UserReportsTab({ userId: _userId }: UserReportsTabProps) {
  const [reports] = React.useState<Report[]>([]);
  const [loading] = React.useState(false);

  if (loading) return <ReportsLoadingState />;

  return (
    <div className="space-y-4">
      <ReportsStats reports={reports} />
      {reports.length === 0 ? (
        <ReportsEmptyState />
      ) : (
        <AdminCard variant="glass" className="p-6">
          <h3 className="text-xl font-black mb-4">البلاغات</h3>
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}