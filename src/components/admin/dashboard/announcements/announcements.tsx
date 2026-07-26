"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Megaphone, Calendar, Clock, Pin, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "urgent" | "info" | "success" | "warning";
  priority: "high" | "medium" | "low";
  createdAt: string;
  expiresAt?: string;
  pinned?: boolean;
  author?: string;
}

interface AnnouncementsProps {
  announcements: Announcement[];
  className?: string;
}

export function Announcements({ announcements, className }: AnnouncementsProps) {
  const typeConfig = {
    urgent: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    success: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  };

  const priorityConfig = {
    high: "bg-red-500/20 text-red-500",
    medium: "bg-amber-500/20 text-amber-500",
    low: "bg-blue-500/20 text-blue-500",
  };

  return (
    <AdminCard variant="glass" className={cn("border-primary/20", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <span>الإعلانات</span>
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>محدث تلقائياً</span>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <Megaphone className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            لا توجد إعلانات
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const type = typeConfig[announcement.type];
            const TypeIcon = type.icon;
            const priority = priorityConfig[announcement.priority];

            return (
              <div
                key={announcement.id}
                className={cn("p-4 rounded-2xl border transition-all hover:border-primary/30", type.bg, type.border)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-xl", type.bg)}>
                    <TypeIcon className={cn("w-5 h-5", type.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {announcement.pinned && (
                        <Pin className="w-4 h-4 text-primary" />
                      )}
                      <h4 className="font-bold">{announcement.title}</h4>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded", priority)}>
                        {announcement.priority === "high" && "عاجل"}
                        {announcement.priority === "medium" && "متوسط"}
                        {announcement.priority === "low" && "عادي"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {announcement.createdAt}
                      </div>
                      {announcement.expiresAt && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ينتهي: {announcement.expiresAt}
                          </div>
                        </>
                      )}
                      {announcement.author && (
                        <>
                          <span>•</span>
                          <span>{announcement.author}</span>
                        </>
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
