"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, LogOut, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImpersonationBannerProps {
  targetUser?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
  reason?: string | null;
  expiresInSeconds?: number;
  onStopImpersonation: () => void;
}

export function ImpersonationBanner({
  targetUser,
  reason,
  expiresInSeconds = 900, // 15 minutes default limit
  onStopImpersonation,
}: ImpersonationBannerProps) {
  const [timeLeft, setTimeLeft] = useState(expiresInSeconds);

  useEffect(() => {
    if (!targetUser) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onStopImpersonation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetUser, onStopImpersonation]);

  if (!targetUser) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      role="region"
      aria-label="Sticky Impersonation Warning Banner"
      className="bg-amber-600 dark:bg-amber-700 text-white px-4 py-2.5 text-xs sm:text-sm flex flex-col md:flex-row items-center justify-between shadow-lg z-50 sticky top-0 border-b-2 border-amber-400 font-sans backdrop-blur animate-in fade-in slide-in-from-top duration-300"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="p-1.5 bg-white/20 rounded-full animate-pulse flex-none">
          <ShieldAlert className="w-4 h-4 text-amber-100" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black bg-black/20 px-2 py-0.5 rounded text-[11px] tracking-wide uppercase">
              وضع المحاكاة نشط (IMPERSONATING)
            </span>
            <span className="font-bold">
              تتصفح المنصة باسم:{" "}
              <span className="underline font-extrabold text-white">
                {targetUser.name || targetUser.email || targetUser.id}
              </span>{" "}
              ({targetUser.role || "STUDENT"})
            </span>
          </div>
          {reason && (
            <p className="opacity-90 text-[11px] text-amber-100 flex items-center gap-1">
              <span>السبب المعين:</span> <span className="font-semibold italic">{reason}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 md:mt-0 flex-wrap">
        <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-amber-100 border border-white/10">
          <Clock className="w-3.5 h-3.5 text-amber-200" />
          <span>ينتهي خلال: {formattedTime}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[10px] bg-amber-800/60 px-2 py-1 rounded text-amber-100 border border-amber-500/40">
          <Lock className="w-3 h-3" />
          <span>الإجراءات المالية والأمنية معطلة</span>
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="bg-white text-amber-950 hover:bg-amber-100 h-8 font-black gap-1.5 text-xs shadow-md rounded-xl transition-transform active:scale-95"
          onClick={onStopImpersonation}
        >
          <LogOut className="w-3.5 h-3.5 text-amber-900" />
          إنهاء المحاكاة والعودة كمدير
        </Button>
      </div>
    </div>
  );
}
