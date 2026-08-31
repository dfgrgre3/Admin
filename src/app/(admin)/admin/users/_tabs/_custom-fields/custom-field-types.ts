export interface CustomField {
  id: string;
  name: string;
  nameAr: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "checkbox" | "file";
  required: boolean;
  options?: string[];
  value?: unknown;
  isVisible: boolean;
  createdAt: string;
}

export interface UserCustomFieldsTabProps {
  userId: string;
}

export const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "نص",
  number: "رقم",
  date: "تاريخ",
  select: "قائمة منسدلة",
  multiselect: "قائمة متعددة",
  checkbox: "خانة اختيار",
  file: "ملف",
};

export function getFieldTypeLabel(type: string): string {
  return FIELD_TYPE_LABELS[type] || type;
}