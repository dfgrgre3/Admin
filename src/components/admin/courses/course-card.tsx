"use client";

import * as React from "react";
import Image from "next/image";
import { m, type Variants } from "framer-motion";
import { Crown, BookOpen, Users, Edit, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn, formatPrice } from "@/lib/utils";
import { type CourseBase, type CourseActionCallbacks, levelConfig } from "./types";

// Local card animation variants (kept here to avoid a circular dependency on
// course-list-item, which only exposes listItemVariants).
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

interface CourseCardProps extends CourseActionCallbacks {
  course: CourseBase;
  index?: number;
}

export const CourseCard = React.memo(function CourseCard({
  course,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
  index = 0,
}: CourseCardProps) {
  const learnersCount = course._count?.enrollments ?? 0;
  const topicsCount = course._count?.topics ?? 0;
  const level = (levelConfig[course.level] ?? levelConfig.INTERMEDIATE)!;
  const isFree = !course.price || course.price === 0;
  const canManage = Boolean(onEdit || onDuplicate || onDelete || onToggleStatus);

  return (
    <m.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      // Removed 'layout' prop to prevent forced reflows (140ms savings)
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10",
        course.isFeatured && "ring-1 ring-amber-500/40",
        !course.isActive && "opacity-70",
      )}
    >
      {/* Featured Badge */}
      {course.isFeatured && (
        <div className="absolute left-3 top-3 z-10">
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 backdrop-blur-md"
          >
            <Crown className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-black text-amber-400">مميزة</span>
          </m.div>
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.nameAr || course.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
            <BookOpen className="h-12 w-12 text-primary/30" />
          </div>
        )}

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Status Badges */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <Badge
            className={cn(
              "rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg",
              course.isPublished
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-orange-500/20 text-orange-300 border-orange-500/30",
            )}
          >
            {course.isPublished ? "منشورة" : "مسودة"}
          </Badge>
          {!course.isActive && (
            <Badge className="rounded-lg border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[10px] font-black text-red-300 backdrop-blur-md">
              موقوفة
            </Badge>
          )}
        </div>

        {/* Level Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge
            className={cn(
              "rounded-lg border px-2 py-0.5 text-[10px] font-black backdrop-blur-md",
              level.color,
            )}
          >
            {level.label}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <div
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[11px] font-black backdrop-blur-md",
              isFree
                ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                : "bg-black/60 text-white border-white/20",
            )}
          >
            {isFree ? "مجانية" : formatPrice(course.price)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="truncate text-sm font-black leading-snug transition-colors group-hover:text-primary">
              {course.nameAr || course.name}
            </h3>
            <p className="truncate text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">
              {course.code && <span className="text-primary/60">#{course.code} • </span>}
              {course.instructorName || "بدون محاضر"}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {learnersCount}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> {topicsCount}
            </span>
          </div>

          {canManage && (
            <div className="flex items-center gap-1">
              <AdminButton
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => onEdit?.(course)}
              >
                <Edit className="h-3.5 w-3.5" />
              </AdminButton>
              <AdminButton
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => onDuplicate?.(course)}
              >
                <Copy className="h-3.5 w-3.5" />
              </AdminButton>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
});