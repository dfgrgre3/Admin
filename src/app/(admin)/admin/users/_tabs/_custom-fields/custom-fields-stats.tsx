"use client";

import { Eye, Settings } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { CustomField } from "./custom-field-types";

interface CustomFieldsStatsProps {
  fields: CustomField[];
}

export function CustomFieldsStats({ fields }: CustomFieldsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AdminCard variant="glass" className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold">إجمالي الحقول</p>
            <p className="text-2xl font-black">{fields.length}</p>
          </div>
        </div>
      </AdminCard>
      <AdminCard variant="glass" className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold">حقول مفعّلة</p>
            <p className="text-2xl font-black">{fields.filter((f) => f.isVisible).length}</p>
          </div>
        </div>
      </AdminCard>
      <AdminCard variant="glass" className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold">حقول مطلوبة</p>
            <p className="text-2xl font-black">{fields.filter((f) => f.required).length}</p>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}