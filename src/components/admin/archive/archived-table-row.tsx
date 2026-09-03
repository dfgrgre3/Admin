import {
  BookOpen,
  Calendar,
  Eye,
  Languages,
  Loader2,
  Signal,
  Trash2,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArchivedCourseRow } from "./types";
import { toCourseLevel, toCourseLanguage, formatDateTime } from "./utils";

interface ArchivedTableRowProps {
  course: ArchivedCourseRow;
  busy: boolean;
  canManage: boolean;
  /** عند التفعيل تظهر خانات الاختيار (سارية على عمود «الدورة») */
  canSelect: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onRestore: (course: ArchivedCourseRow) => void;
  onDelete: (course: ArchivedCourseRow) => void;
  onDetail: (course: ArchivedCourseRow) => void;
}

export function ArchivedTableRow({
  course,
  busy,
  canManage,
  canSelect,
  selected,
  onToggleSelect,
  onRestore,
  onDelete,
  onDetail,
}: ArchivedTableRowProps) {
  return (
    <TableRow className="transition-colors hover:bg-muted/40">
      {canSelect && (
        <TableCell className="w-10 px-2 text-center">
          <Checkbox
            aria-label={`تحديد ${course.title}`}
            checked={selected}
            onCheckedChange={() => onToggleSelect(course.id)}
            disabled={busy}
            className="mx-auto"
          />
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="max-w-[280px] truncate font-semibold text-foreground">
              {course.title}
            </p>
            {course.slug && (
              <p className="truncate text-xs text-muted-foreground" dir="ltr">
                {course.slug}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Signal className="h-3.5 w-3.5" />
          {toCourseLevel(course.level)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Languages className="h-3.5 w-3.5" />
          {toCourseLanguage(course.language)}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-500 border-slate-500/20"
        >
          v{course.version ?? 1}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDateTime(course.updatedAt)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => onDetail(course)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>عرض التفاصيل</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {canManage && (
            <>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-green-600 hover:bg-green-500/10 hover:text-green-600"
                      disabled={busy}
                      onClick={() => onRestore(course)}
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Undo2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>استعادة الدورة (إلى مسودة)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-500"
                      disabled={busy}
                      onClick={() => onDelete(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>حذف الدورة</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
