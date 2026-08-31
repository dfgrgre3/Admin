"use client";

import { Badge } from "@/components/ui/badge";
import type { CustomField } from "./custom-field-types";

export function CustomFieldValue({ field }: { field: CustomField }) {
  const { value, type } = field;

  if (value === undefined || value === null || value === "") {
    return <span className="text-muted-foreground">غير محدد</span>;
  }

  switch (type) {
    case "checkbox":
      return value ? <Badge variant="default">نعم</Badge> : <Badge variant="secondary">لا</Badge>;
    case "file":
      return (
        <a href={String(value ?? "")} className="text-primary hover:underline">
          عرض الملف
        </a>
      );
    case "select":
    case "multiselect":
      if (Array.isArray(value)) {
        return (
          <>
            {value.map((v, i) => (
              <Badge key={i} variant="outline" className="ml-1">
                {String(v)}
              </Badge>
            ))}
          </>
        );
      }
      return <Badge variant="outline">{String(value ?? "")}</Badge>;
    default:
      return <span className="font-bold">{String(value)}</span>;
  }
}