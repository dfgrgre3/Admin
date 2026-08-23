"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Crown,
  Users,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Eye,
  Lock,
  Unlock,
  Layers,
  TrendingUp,
  CheckCircle2,
  Clock,
  GraduationCap,
  Calendar,
  Star,
  PlayCircle,
  Loader2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { type CourseBase, type CourseActionCallbacks, levelConfig, FALLBACK_LEVEL } from "./types";

// --- Types ---
interface CourseCardProps extends CourseActionCallbacks {
  course: CourseBase & {
    averageRating?: number;
    reviewCount?: number;
    userProgress?: number;
    thumbnailAlt?: string;
  };
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  priority?: boolean;
  currency?: string;
}

// --- Zero-Dependency Helpers ---
const FALLBACK_IMAGE = "/images/course-placeholder.svg";

// Native browser API instead of date-fns (0kb bundle impact)
const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

function getRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const diffSecs = Math.round((new Date(dateStr).getTime() - Date.now()) / 1000);
    const absSecs = Math.abs(diffSecs);
    
    if (absSecs < 60) return rtf.format(diffSecs, "second");
    if (absSecs < 3600) return rtf.format(Math.round(diffSecs / 60), "minute");
    if (absSecs < 86400) return rtf.format(Math.round(diffSecs / 3600), "hour");
    if (absSecs < 2592000) return rtf.format(Math.round(diffSecs / 86400), "day");
    if (absSecs < 31536000) return rtf.format(Math.round(diffSecs / 2592000), "month");
    return rtf.format(Math.round(diffSecs / 31536000), "year");
  } catch {
    return "";
  }
}

function formatPrice(amount: number, currency = "SAR"): string {
  try {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

// --- Main Component (Optimized for Raw Performance) ---
export const CourseCard = React.memo(function CourseCard({
  course,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
  onToggleActive,
  isSelected,
  onSelect,
  priority = false,
  currency = "SAR",
}: CourseCardProps) {
  // Local state only for necessary interactions
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(course.thumbnailUrl || FALLBACK_IMAGE);

  // Direct calculations (faster than useMemo for simple primitives)
  const learnersCount = course._count?.enrollments ?? 0;
  const topicsCount = course._count?.topics ?? 0;
  const level = levelConfig[course.level] ?? FALLBACK_LEVEL;
  const isFree = !course.price || course.price === 0;
  const canManage = Boolean(onEdit || onDuplicate || onDelete || onToggleStatus || onToggleActive);
  const relativeDate = getRelativeTime(course.createdAt);
  const progress = course.userProgress ?? 0;

  // Stable callback reference to avoid re-renders in children/dialogs
  const handleAction = React.useCallback(async (name: string, cb?: () => Promise<void> | void) => {
    if (!cb) return;
    setLoadingAction(name);
    try {
      await cb();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  }, []);

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm",
          course.isFeatured && "ring-2 ring-amber-400/50 border-amber-400/50",
          !course.isActive && "opacity-60 grayscale-[0.3]",
          isSelected && "ring-2 ring-primary border-primary shadow-md",
        )}
      >
        {/* Selection Checkbox */}
        {onSelect && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(course.id); }}
            className={cn(
              "absolute left-3 top-3 z-30 flex h-6 w-6 items-center justify-center rounded-md border-2 bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isSelected
                ? "border-primary bg-primary text-white"
                : "border-gray-300 text-transparent opacity-0 group-hover:opacity-100 hover:border-primary",
            )}
            aria-label={isSelected ? "إلغاء تحديد الدورة" : "تحديد الدورة"}
            aria-pressed={isSelected}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {/* Featured Badge */}
        {course.isFeatured && (
          <div className="absolute right-3 top-3 z-20" aria-label="دورة مميزة">
            <div className="flex items-center gap-1.5 rounded-md bg-amber-400 px-2 py-1 shadow-sm">
              <Crown className="h-3 w-3 text-amber-950" aria-hidden="true" />
              <span className="text-[10px] font-black tracking-wide text-amber-950">مميزة</span>
            </div>
          </div>
        )}

        {/* Thumbnail Area - No transitions, fixed layout */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={imgSrc}
            alt={course.thumbnailAlt || course.nameAr || course.name || "صورة الدورة"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            unoptimized={!priority} // Skip Next.js optimization for non-critical images
          />

          {/* Quick Actions Overlay - Instant visibility, no backdrop-blur cost */}
          <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/40 group-hover:flex z-20">
            <Link href={`/admin/courses/${course.id}`} tabIndex={-1} aria-label="معاينة الدورة">
              <AdminButton variant="secondary" size="icon" className="h-9 w-9 rounded-lg shadow-sm hover:bg-white">
                <Eye className="h-4 w-4" aria-hidden="true" />
              </AdminButton>
            </Link>
            {onEdit && (
              <AdminButton
                variant="secondary"
                size="icon"
                onClick={() => handleAction("edit", () => onEdit(course))}
                disabled={loadingAction === "edit"}
                className="h-9 w-9 rounded-lg shadow-sm hover:bg-white"
                aria-label="تعديل البيانات"
              >
                {loadingAction === "edit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
              </AdminButton>
            )}
            {canManage && (
              <Link href={`/admin/courses/${course.id}/curriculum`} tabIndex={-1} aria-label="إدارة المنهج">
                <AdminButton variant="secondary" size="icon" className="h-9 w-9 rounded-lg shadow-sm hover:bg-white">
                  <Layers className="h-4 w-4" aria-hidden="true" />
                </AdminButton>
              </Link>
            )}
          </div>

          {/* Bottom Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
            <Badge variant="secondary" className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-bold shadow-sm border-0 text-white",
              level.color.replace("text-", "bg-").replace("/20", "").replace("border-", ""),
            )}>
              {level.label}
            </Badge>

            <div className="flex flex-col items-end gap-1.5">
              {!course.isFeatured && (
                <div className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-black shadow-sm border-0",
                  isFree ? "bg-emerald-500 text-white" : "bg-white text-foreground",
                )}>
                  {isFree ? "مجانية" : formatPrice(course.price ?? 0, currency)}
                </div>
              )}
              <Badge variant="secondary" className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm border-0 text-white",
                course.isPublished ? "bg-emerald-500" : "bg-orange-500",
              )}>
                {course.isPublished ? "منشورة" : "مسودة"}
              </Badge>
            </div>
          </div>

          {/* Inline Progress Bar - Static width, no transition */}
          {progress > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 z-20"
              role="progressbar"
              aria-valuenow={Math.min(100, Math.max(0, progress))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`تم إنجاز ${progress}% من الدورة`}
            >
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="truncate text-sm font-bold leading-snug text-foreground group-hover:text-primary">
                {course.nameAr || course.name}
              </h3>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                {/* Inlined Rating Stars to avoid component overhead */}
                {course.averageRating != null && (
                  <div className="flex items-center gap-1" role="img" aria-label={`تقييم ${course.averageRating.toFixed(1)} من 5 نجوم`}>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span className="font-bold text-foreground tabular-nums">{course.averageRating.toFixed(1)}</span>
                    {course.reviewCount !== undefined && (
                      <span className="text-[10px] text-muted-foreground tabular-nums">({course.reviewCount})</span>
                    )}
                  </div>
                )}
                
                <span className="h-3 w-px bg-border" aria-hidden="true" />
                
                <span className="flex items-center gap-1 truncate max-w-[120px]" title={course.instructorName || "غير محدد"}>
                  <GraduationCap className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{course.instructorName || "غير محدد"}</span>
                </span>
              </div>
            </div>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AdminButton
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="خيارات إضافية"
                  >
                    {loadingAction === "menu" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </AdminButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl border-border bg-popover shadow-lg">
                  <DropdownMenuLabel className="text-xs font-bold text-muted-foreground">الإجراءات</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {onEdit && (
                    <DropdownMenuItem onClick={() => handleAction("edit", () => onEdit(course))} disabled={!!loadingAction}>
                      <Edit className="h-4 w-4 text-blue-500 ml-2.5" aria-hidden="true" /> تعديل البيانات
                    </DropdownMenuItem>
                  )}

                  <Link href={`/admin/courses/${course.id}/curriculum`} className="block">
                    <DropdownMenuItem disabled={!!loadingAction}>
                      <Layers className="h-4 w-4 text-violet-500 ml-2.5" aria-hidden="true" /> إدارة المنهج
                    </DropdownMenuItem>
                  </Link>

                  {onDuplicate && (
                    <DropdownMenuItem onClick={() => handleAction("duplicate", () => onDuplicate(course))} disabled={!!loadingAction}>
                      <Copy className="h-4 w-4 text-amber-500 ml-2.5" aria-hidden="true" /> استنساخ
                    </DropdownMenuItem>
                  )}

                  <Link href={`/admin/courses/${course.id}/analytics`} className="block">
                    <DropdownMenuItem disabled={!!loadingAction}>
                      <TrendingUp className="h-4 w-4 text-emerald-500 ml-2.5" aria-hidden="true" /> التحليلات
                    </DropdownMenuItem>
                  </Link>

                  {onToggleStatus && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAction("toggle", () => onToggleStatus(course))}
                        disabled={!!loadingAction}
                      >
                        {course.isPublished ? (
                          <><Lock className="h-4 w-4 text-orange-500 ml-2.5" aria-hidden="true" /><span>إخفاء</span></>
                        ) : (
                          <><Unlock className="h-4 w-4 text-emerald-500 ml-2.5" aria-hidden="true" /><span>نشر</span></>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}

                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={!!loadingAction}
                        className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                      >
                        <Trash2 className="h-4 w-4 ml-2.5" aria-hidden="true" /> حذف نهائي
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Footer Stats */}
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5" title="الطلاب المسجلين">
                <Users className="h-3 w-3" aria-hidden="true" />
                <span className="tabular-nums font-semibold text-foreground">{learnersCount.toLocaleString("ar-SA")}</span>
              </span>
              <span className="flex items-center gap-1.5" title="عدد الوحدات">
                <PlayCircle className="h-3 w-3" aria-hidden="true" />
                <span className="tabular-nums font-semibold text-foreground">{topicsCount}</span>
              </span>
              <span className="flex items-center gap-1.5" title="المدة الإجمالية">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span className="tabular-nums font-semibold text-foreground">{course.durationHours ?? 0}س</span>
              </span>
            </div>

            {relativeDate && (
              <time className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground tabular-nums" dateTime={course.createdAt ?? undefined}>
                <Calendar className="h-2.5 w-2.5" aria-hidden="true" /> {relativeDate}
              </time>
            )}
          </div>
        </div>
      </article>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> تأكيد الحذف النهائي
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف دورة <strong>"{course.nameAr || course.name}"</strong>؟
              هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بيانات الطلاب والمنهج المرتبط.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingAction === "delete"}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await handleAction("delete", () => onDelete?.(course));
                setShowDeleteDialog(false);
              }}
              disabled={loadingAction === "delete"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingAction === "delete" ? (
                <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحذف...</>
              ) : (
                "نعم، احذف نهائياً"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});