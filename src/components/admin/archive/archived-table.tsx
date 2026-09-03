"use client";

import { Loader2, Archive, RefreshCw } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArchivedCourseRow } from "./types";
import { ArchivedTableRow } from "./archived-table-row";

interface ArchivedTableProps {
  courses: ArchivedCourseRow[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  debouncedSearch: string;
  busyId: string | null;
  canManage: boolean;
  onRestore: (course: ArchivedCourseRow) => void;
  onDelete: (course: ArchivedCourseRow) => void;
  onDetail: (course: ArchivedCourseRow) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export function ArchivedTable({
  courses,
  isLoading,
  isError,
  refetch,
  debouncedSearch,
  busyId,
  canManage,
  onRestore,
  onDelete,
  onDetail,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: ArchivedTableProps) {
  const canSelect = canManage;
  const allSelected = courses.length > 0 && selectedIds.length === courses.length;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const colSpan = canSelect ? 7 : 6;

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          {canSelect && (
            <TableHead className="w-10 px-2 text-center">
              <Checkbox
                aria-label="تحديد الكل"
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={() => onToggleSelectAll()}
                className="mx-auto"
              />
            </TableHead>
          )}
          <TableHead className="w-14">الدورة</TableHead>
          <TableHead>المستوى</TableHead>
          <TableHead>اللغة</TableHead>
          <TableHead>الإصدار</TableHead>
          <TableHead>آخر تعديل</TableHead>
          <TableHead className="w-44 text-center">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="h-56 text-center">
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                جاري تحميل الدورات المؤرشفة...
              </div>
            </TableCell>
          </TableRow>
        ) : isError ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="h-56 text-center">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
                  <Archive className="h-7 w-7 text-destructive" />
                </div>
                <p className="font-semibold text-foreground">تعذّر تحميل الأرشيف</p>
                <p className="text-sm text-muted-foreground">
                  حدث خطأ أثناء الاتصال بالخادم. تأكد من اتصالك ثم أعد المحاولة.
                </p>
                <Button variant="outline" size="sm" onClick={refetch}>
                  <RefreshCw className="h-4 w-4" />
                  إعادة المحاولة
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ) : courses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="h-56 text-center">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
                  <Archive className="h-7 w-7 text-muted-foreground/60" />
                </div>
                <p className="font-semibold text-foreground">
                  {debouncedSearch ? "لا توجد نتائج مطابقة" : "الأرشيف فارغ"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch
                    ? "جرّب كلمات بحث مختلفة."
                    : "لا توجد دورات مؤرشفة حالياً. تُنقل الدورات هنا عند أرشفتها من صفحة الدورات."}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          courses.map((course) => (
            <ArchivedTableRow
              key={course.id}
              course={course}
              busy={busyId === course.id || busyId === "bulk"}
              canManage={canManage}
              canSelect={canSelect}
              selected={selectedIds.includes(course.id)}
              onToggleSelect={onToggleSelect}
              onRestore={onRestore}
              onDelete={onDelete}
              onDetail={onDetail}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
