import * as React from "react";
import Link from "next/link";
import { BookOpen, FileText, Clock, Archive, ArrowLeft } from "lucide-react";

interface CourseStatusCard {
  key: string;
  title: string;
  value: number;
  status: string;
  icon: React.ElementType;
  color: "green" | "amber" | "blue" | "gray";
  description: string;
}

const COLOR_CLASSES: Record<CourseStatusCard["color"], string> = {
  green: "bg-green-500/10 text-green-500",
  amber: "bg-amber-500/10 text-amber-500",
  blue: "bg-blue-500/10 text-blue-500",
  gray: "bg-gray-500/10 text-gray-500",
};

interface CourseOverviewSectionProps {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  reviewCourses: number;
  archivedCourses: number;
}

/**
 * CourseOverviewSection — renders the course catalogue as distinct status
 * KPI cards (Published / Draft / Pending Review / Archived) with drill-down
 * links to the courses module filtered by status.
 */
export const CourseOverviewSection = React.memo(function CourseOverviewSection({
  totalCourses,
  publishedCourses,
  draftCourses,
  reviewCourses,
  archivedCourses,
}: CourseOverviewSectionProps) {
  const cards: CourseStatusCard[] = [
    {
      key: "published",
      title: "منشورة",
      value: publishedCourses,
      status: "PUBLISHED",
      icon: BookOpen,
      color: "green",
      description: "دورات متاحة للطلاب",
    },
    {
      key: "review",
      title: "قيد المراجعة",
      value: reviewCourses,
      status: "REVIEW",
      icon: FileText,
      color: "amber",
      description: "بانتظار موافقة الإدارة",
    },
    {
      key: "draft",
      title: "مسودة",
      value: draftCourses,
      status: "DRAFT",
      icon: Clock,
      color: "blue",
      description: "قيد الإنشاء وغير منشورة",
    },
    {
      key: "archived",
      title: "مؤرشفة",
      value: archivedCourses,
      status: "ARCHIVED",
      icon: Archive,
      color: "gray",
      description: "غير متاحة للطلاب",
    },
  ];

  return (
    <div className="admin-glass p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">نظرة عامة على الدورات</h3>
              <p className="text-sm text-gray-400">{totalCourses.toLocaleString("ar-EG")} دورة إجمالاً</p>
            </div>
          </div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:text-primary"
          >
            إدارة الدورات
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={`/admin/courses?status=${encodeURIComponent(card.status)}`}
              className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <div className={`p-3 rounded-xl border border-white/5 group-hover:scale-110 transition-all ${COLOR_CLASSES[card.color]}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-white leading-none">{card.value.toLocaleString("ar-EG")}</p>
                <p className="mt-1.5 truncate text-sm font-black text-white">{card.title}</p>
                <p className="truncate text-[11px] text-gray-500 mt-0.5">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});