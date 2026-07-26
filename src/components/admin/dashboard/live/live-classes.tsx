"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Video, Users, Clock, Eye, Mic, MicOff, VideoOff, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveClass {
  id: string;
  title: string;
  instructor: string;
  subject: string;
  viewers: number;
  duration: string;
  status: "live" | "starting" | "ended";
  thumbnail?: string;
}

interface LiveClassesProps {
  classes: LiveClass[];
  className?: string;
}

export function LiveClasses({ classes, className }: LiveClassesProps) {
  const liveClasses = classes.filter(c => c.status === "live");
  const startingClasses = classes.filter(c => c.status === "starting");

  return (
    <AdminCard variant="glass" className={cn("border-primary/20", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <span>الفصول المباشرة</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-sm font-bold">
            <Signal className="w-4 h-4" />
            {liveClasses.length} مباشر
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <Video className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            لا توجد فصول مباشرة حالياً
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((liveClass) => (
            <div
              key={liveClass.id}
              className={cn(
                "p-4 rounded-2xl border transition-all",
                liveClass.status === "live" ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {liveClass.status === "live" && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500 text-white text-xs font-bold">
                        <Signal className="w-3 h-3" />
                        مباشر
                      </div>
                    )}
                    {liveClass.status === "starting" && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white text-xs font-bold">
                        <Clock className="w-3 h-3" />
                        قريبًا
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">{liveClass.subject}</span>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{liveClass.title}</h4>
                  <p className="text-sm text-muted-foreground">{liveClass.instructor}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <Eye className="w-4 h-4 text-primary" />
                    {liveClass.viewers}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {liveClass.duration}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {startingClasses.length > 0 && (
        <div className="mt-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <p className="text-sm font-bold text-amber-500">
            {startingClasses.length} فصل قيد البدء
          </p>
        </div>
      )}
    </AdminCard>
  );
}
