"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Plus } from "lucide-react";
import { CustomFieldsStats } from "../_tabs/_custom-fields/custom-fields-stats";
import { CustomFieldCard } from "../_tabs/_custom-fields/custom-field-card";
import type { CustomField, UserCustomFieldsTabProps } from "../_tabs/_custom-fields/custom-field-types";

export function UserCustomFieldsTab({ userId: _userId }: UserCustomFieldsTabProps) {
  const [fields] = React.useState<CustomField[]>([]);
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-4">
      <CustomFieldsStats fields={fields} />
      <AdminCard variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">الحقول المخصصة</h3>
          <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة حقل
          </button>
        </div>
        {fields.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد حقول مخصصة</p>
        ) : (
          <div className="space-y-3">
            {fields.map((field) => <CustomFieldCard key={field.id} field={field} />)}
          </div>
        )}
      </AdminCard>
    </div>
  );
}