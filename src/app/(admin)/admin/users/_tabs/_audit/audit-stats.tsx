"use client";

import { FileText, Shield, User, UserCog } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { AuditLog } from "./_audit-types";

interface AuditStatsProps {
  logs: AuditLog[];
  total: number;
}

export function AuditStats({ logs, total }: AuditStatsProps) {
  const roleChangesCount = logs.filter((l) => l.action === "ASSIGN_ROLE" || l.action === "CHANGE_ROLE").length;
  const permissionChangeCount = logs.filter((l) => l.action === "ADD_PERMISSION" || l.action === "REMOVE_PERMISSION").length;
  const impersonateCount = logs.filter((l) => l.action === "IMPERSONATE").length;

  const stats = [
    { label: "إجمالي السجلات", value: total, icon: FileText, color: "blue" },
    { label: "تغييرات الدور", value: roleChangesCount, icon: UserCog, color: "purple" },
    { label: "تغييرات صلاحيات", value: permissionChangeCount, icon: Shield, color: "yellow" },
    { label: "تبديل هوية", value: impersonateCount, icon: User, color: "red" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <AdminCard key={s.label} variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-${s.color}-500/10 text-${s.color}-500`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">{s.label}</p>
                <p className="text-2xl font-black">{s.value}</p>
              </div>
            </div>
          </AdminCard>
        );
      })}
    </div>
  );
}