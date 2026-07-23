"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CustomField {
  id: string;
  name: string;
  nameAr: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "checkbox" | "file";
  required: boolean;
  options?: string[];
  value?: any;
  isVisible: boolean;
  createdAt: string;
}

interface UserCustomFieldsTabProps {
  userId: string;
}

export function UserCustomFieldsTab({ userId }: UserCustomFieldsTabProps) {
  const [fields, setFields] = React.useState<CustomField[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingField, setEditingField] = React.useState<string | null>(null);

  React.useEffect(() => {
    // TODO: Fetch custom fields from API
    setLoading(false);
  }, [userId]);

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "نص",
      number: "رقم",
      date: "تاريخ",
      select: "قائمة منسدلة",
      multiselect: "قائمة متعددة",
      checkbox: "خانة اختيار",
      file: "ملف",
    };
    return labels[type] || type;
  };

  const renderFieldValue = (field: CustomField) => {
    if (field.value === undefined || field.value === null || field.value === "") {
      return <span className="text-muted-foreground">غير محدد</span>;
    }

    switch (field.type) {
      case "checkbox":
        return field.value ? (
          <Badge variant="default">نعم</Badge>
        ) : (
          <Badge variant="secondary">لا</Badge>
        );
      case "file":
        return (
          <a href={field.value} className="text-primary hover:underline">
            عرض الملف
          </a>
        );
      case "select":
      case "multiselect":
        if (Array.isArray(field.value)) {
          return field.value.map((v, i) => (
            <Badge key={i} variant="outline" className="ml-1">
              {v}
            </Badge>
          ));
        }
        return <Badge variant="outline">{field.value}</Badge>;
      default:
        return <span className="font-bold">{String(field.value)}</span>;
    }
  };

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
      {/* Stats */}
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
              <p className="text-2xl font-black">
                {fields.filter((f) => f.isVisible).length}
              </p>
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
              <p className="text-2xl font-black">
                {fields.filter((f) => f.required).length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Custom Fields List */}
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
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{field.nameAr || field.name}</p>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          مطلوب
                        </Badge>
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
                    {renderFieldValue(field)}
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}