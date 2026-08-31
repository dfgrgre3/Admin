"use client";

import * as React from "react";
import { Timer, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  /** تاريخ الانتهاء (ISO string أو Date) */
  endsAt: string | Date;
  /** تاريخ البدء (اختياري) - قبله يظهر "قريباً" */
  startsAt?: string | Date;
  /** حجم العرض */
  size?: "sm" | "md" | "lg";
  /** إظهار أيقونة */
  showIcon?: boolean;
  /** تسمية مخصصة */
  label?: string;
  /** عند الوصول لـ 0 */
  onExpire?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const total = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds, total };
}

/**
 * عدّاد تنازلي يستخدم في بطاقات الإعلانات قبل النشر/الانتهاء
 */
export function CountdownTimer({
  endsAt,
  startsAt,
  size = "md",
  showIcon = true,
  label,
  onExpire,
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft | null>(null);
  const [hasExpired, setHasExpired] = React.useState(false);

  const target = React.useMemo(
    () => (endsAt instanceof Date ? endsAt : new Date(endsAt)),
    [endsAt]
  );
  const start = React.useMemo(
    () => (startsAt ? (startsAt instanceof Date ? startsAt : new Date(startsAt)) : null),
    [startsAt]
  );

  React.useEffect(() => {
    const update = () => {
      // إذا كان هناك تاريخ بدء ولم يحن بعد → "قريباً"
      if (start && start.getTime() > Date.now()) {
        setTimeLeft(null);
        return;
      }
      const tl = calcTimeLeft(target);
      setTimeLeft(tl);
      if (tl.total === 0 && !hasExpired) {
        setHasExpired(true);
        onExpire?.();
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target, start, hasExpired, onExpire]);

  const sizes = {
    sm: { box: "h-8 min-w-[2rem] text-[10px]", container: "gap-1.5", icon: "h-3 w-3" },
    md: { box: "h-10 min-w-[2.5rem] text-xs", container: "gap-2", icon: "h-4 w-4" },
    lg: { box: "h-14 min-w-[3.5rem] text-sm", container: "gap-3", icon: "h-5 w-5" },
  } as const;
  const s = sizes[size];

  // قبل البدء
  if (start && start.getTime() > Date.now()) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", s.container, className)} dir="rtl">
        {showIcon && <Calendar className={cn(s.icon, "text-blue-500")} />}
        <span className="text-[10px] font-black uppercase tracking-wider">يبدأ قريباً</span>
      </div>
    );
  }

  // انتهى
  if (hasExpired || (timeLeft && timeLeft.total === 0)) {
    return (
      <div className={cn("flex items-center gap-2 text-red-500", s.container, className)} dir="rtl">
        {showIcon && <AlertCircle className={s.icon} />}
        <span className="text-[10px] font-black uppercase tracking-wider">منتهي</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const parts: Array<[string, number]> = [
    ["يوم", timeLeft.days],
    ["ساعة", timeLeft.hours],
    ["دقيقة", timeLeft.minutes],
    ["ثانية", timeLeft.seconds],
  ];

  return (
    <div className={cn("flex items-center", s.container, className)} dir="rtl">
      {showIcon && <Timer className={cn(s.icon, "text-amber-500")} />}
      {label && <span className="text-[10px] font-black opacity-70">{label}</span>}
      <div className="flex items-center gap-1">
        {parts.map(([lbl, val]) =>
          val > 0 || lbl === "ثانية" ? (
            <div
              key={lbl}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-b from-white/10 to-white/2.5 px-2 font-mono font-black backdrop-blur",
                s.box
              )}
            >
              <span className="leading-none tabular-nums">{String(val).padStart(2, "0")}</span>
              <span className="mt-0.5 text-[8px] font-bold opacity-60">{lbl}</span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

/**
 * نسخة Inline بسيطة - نص فقط "5 أيام و3 ساعات"
 */
export function CountdownInline({
  endsAt,
  className,
}: {
  endsAt: string | Date;
  className?: string;
}) {
  const [text, setText] = React.useState<string>("—");

  React.useEffect(() => {
    const target = endsAt instanceof Date ? endsAt : new Date(endsAt);
    const update = () => {
      const tl = calcTimeLeft(target);
      if (tl.total === 0) {
        setText("منتهي");
        return;
      }
      const parts: string[] = [];
      if (tl.days > 0) parts.push(`${tl.days} يوم`);
      if (tl.hours > 0) parts.push(`${tl.hours} ساعة`);
      if (tl.days === 0 && tl.minutes > 0) parts.push(`${tl.minutes} دقيقة`);
      setText(parts.join(" و ") || "أقل من دقيقة");
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [endsAt]);

  return <span className={cn("font-bold tabular-nums", className)}>{text}</span>;
}