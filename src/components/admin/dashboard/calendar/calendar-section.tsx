"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Calendar, Clock, Video, FileText, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  type: "live_class" | "exam" | "assignment_due" | "announcement" | "meeting";
  date: string;
  time: string;
  duration?: string;
}

interface CalendarSectionProps {
  events: CalendarEvent[];
  className?: string;
}

export function CalendarSection({ events, className }: CalendarSectionProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const typeConfig = {
    live_class: { icon: Video, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "فصل مباشر" },
    exam: { icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", label: "امتحان" },
    assignment_due: { icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "واجب" },
    announcement: { icon: Megaphone, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "إعلان" },
    meeting: { icon: Calendar, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", label: "اجتماع" },
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return (
    <AdminCard variant="glass" className={`border-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span>التقويم</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            لا توجد أحداث مجدولة
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const type = typeConfig[event.type];
            const TypeIcon = type.icon;

            return (
              <div
                key={event.id}
                className={`p-4 rounded-xl border transition-all hover:border-primary/30 ${type.bg} ${type.border}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${type.bg}`}>
                    <TypeIcon className={`w-5 h-5 ${type.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${type.color} ${type.bg}`}>
                        {type.label}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm">{event.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </div>
                      {event.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.duration}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}
