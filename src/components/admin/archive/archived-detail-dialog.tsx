"use client";

import { BookOpen, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArchivedCourseRow } from "./types";
import { toCourseLevel, toCourseLanguage, formatDateTime } from "./utils";

interface ArchivedDetailDialogProps {
  open: boolean;
  course: ArchivedCourseRow | null;
  canManage: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (course: ArchivedCourseRow) => void;
}

export function ArchivedDetailDialog({
  open,
  course,
  canManage,
  onOpenChange,
  onRestore,
}: ArchivedDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>تفاصيل الدورة المؤرشفة</DialogTitle>
          <DialogDescription>
            البيانات المعروضة هي ما يخزّنه الباكند فعلياً لهذه الدورة.
          </DialogDescription>
        </DialogHeader>

        {course && (
          <div className="space-y-5">
            <div className="flex items-start gap-4 rounded-2xl bg-muted/40 p-5 ring-1 ring-border/50">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                <Badge
                  variant="outline"
                  className="mt-2 bg-slate-500/10 text-slate-500 border-slate-500/20"
                >
                  مؤرشف • v{course.version ?? 1}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/30 p-4 ring-1 ring-border/40">
                <p className="text-xs font-semibold text-muted-foreground">المستوى</p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  {toCourseLevel(course.level)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4 ring-1 ring-border/40">
                <p className="text-xs font-semibold text-muted-foreground">اللغة</p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  {toCourseLanguage(course.language)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4 ring-1 ring-border/40">
                <p className="text-xs font-semibold text-muted-foreground">تاريخ الإنشاء</p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  {formatDateTime(course.createdAt)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4 ring-1 ring-border/40">
                <p className="text-xs font-semibold text-muted-foreground">آخر تعديل</p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  {formatDateTime(course.updatedAt)}
                </p>
              </div>
            </div>

            {course.slug && (
              <div className="rounded-xl bg-muted/30 p-4 ring-1 ring-border/40">
                <p className="text-xs font-semibold text-muted-foreground">الرابط المختصر</p>
                <p className="mt-1.5 text-sm font-medium text-foreground" dir="ltr">
                  {course.slug}
                </p>
              </div>
            )}

            {course.description && (
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">الوصف</p>
                <p className="rounded-xl bg-muted/30 p-4 text-sm leading-7 text-foreground ring-1 ring-border/40">
                  {course.description}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {canManage && course && (
            <Button
              variant="default"
              className="gap-2"
              onClick={() => onRestore(course)}
            >
              <Undo2 className="h-4 w-4" />
              استعادة الدورة
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
