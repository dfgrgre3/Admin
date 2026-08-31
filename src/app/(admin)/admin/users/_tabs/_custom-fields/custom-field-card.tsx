"use client";

import { Edit2, EyeOff, Settings, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CustomFieldValue } from "./custom-field-value";
import { getFieldTypeLabel } from "./custom-field-types";
import type { CustomField } from "./custom-field-types";

export function CustomFieldCard({ field }: { field: CustomField }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-white">{field.nameAr || field.name}</p>
            {field.required && (
              <Badge variant="destructive" className="text-xs">مطلوب</Badge>
            )}
            {!field.isVisible && (
              <Badge variant="secondary" className="text-xs">
                <EyeOff className="h-3 w-3 ml-1" />
                مخفي
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {getFieldTypeLabel(field.type)}
            {field.options && field.options.length > 0 && (
              <span> • الخيارات: {field.options.join(", ")}</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            تاريخ الإنشاء: {formatDate(field.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-left min-w-[120px]">
          <p className="text-xs text-muted-foreground mb-1">القيمة</p>
          <CustomFieldValue field={field} />
        </div>
        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
          <Edit2 className="h-4 w-4" />
        </button>
        <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}