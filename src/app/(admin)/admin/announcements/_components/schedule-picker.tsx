"use client";

import * as React from "react";
import {
  CalendarClock,
  TimerReset,
  X,
  Zap,
  Sparkles,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SchedulePickerProps {
  /** تاريخ النشر المجدول (ISO) */
  scheduledAt: string | null;
  onScheduledAtChange: (value: string | null) => void;
  /** تاريخ انتهاء الصلاحية (ISO) */
  expiresAt: string | null;
  onExpiresAtChange: (value: string | null) => void;
  className?: string;
  disabled?: boolean;
}

const QUICK_PRESETS: { label: string; minutes?: number; hours?: number; days?: number }[] = [
  { label: "بعد 15 دقيقة", minutes: 15 },
  { label: "بعد ساعة", hours: 1 },
  { label: "بعد 3 ساعات", hours: 3 },
  { label: "غداً 9 صباحاً", hours: 18 },
  { label: "بعد أسبوع", days: 7 },
];

const EXPIRY_PRESETS: { label: string; hours?: number; days?: number; weeks?: number }[] = [
  { label: "ساعة", hours: 1 },
  { label: "يوم", days: 1 },
  { label: "3 أيام", days: 3 },
  { label: "أسبوع", weeks: 1 },
  { label: "شهر", days: 30 },
];

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  // datetime-local يحتاج "YYYY-MM-DDTHH:mm" بدون ثوانٍ
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function applyPreset(
  preset: { minutes?: number; hours?: number; days?: number }
): string {
  const d = new Date();
  if (preset.minutes) d.setMinutes(d.getMinutes() + preset.minutes);
  if (preset.hours) d.setHours(d.getHours() + preset.hours);
  if (preset.days) d.setDate(d.getDate() + preset.days);
  return d.toISOString();
}

function applyExpiryPreset(preset: {
  hours?: number;
  days?: number;
  weeks?: number;
}): string {
  const d = new Date();
  if (preset.hours) d.setHours(d.getHours() + preset.hours);
  if (preset.days) d.setDate(d.getDate() + preset.days);
  if (preset.weeks) d.setDate(d.getDate() + preset.weeks * 7);
  return d.toISOString();
}

export function SchedulePicker({
  scheduledAt,
  onScheduledAtChange,
  expiresAt,
  onExpiresAtChange,
  className,
  disabled,
}: SchedulePickerProps) {
  const isScheduled = scheduledAt !== null;
  const hasExpiry = expiresAt !== null;

  return (
    <div className={cn("space-y-5 rounded-2xl border border-white/10 bg-white/2.5 p-5", className)}>
      {/* ── النشر المجدول ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-black">جدولة النشر</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                اختياري — انشره الآن أو لاحقاً
              </p>
            </div>
          </div>
          <Switch
            checked={isScheduled}
            onCheckedChange={(v) => onScheduledAtChange(v ? new Date().toISOString() : null)}
            disabled={disabled}
          />
        </div>

        {isScheduled && (
          <div className="space-y-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                value={toLocalInput(scheduledAt)}
                onChange={(e) => onScheduledAtChange(fromLocalInput(e.target.value))}
                className="h-10 rounded-xl border-white/10 bg-white/5 text-xs font-bold"
                disabled={disabled}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onScheduledAtChange(null)}
                disabled={disabled}
                title="إلغاء الجدولة"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onScheduledAtChange(new Date().toISOString())}
                className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-600 hover:bg-emerald-500/20 transition"
                disabled={disabled}
              >
                <Zap className="h-3 w-3" /> الآن
              </button>
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onScheduledAtChange(applyPreset(preset))}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-muted-foreground hover:bg-white/10 transition"
                  disabled={disabled}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {scheduledAt && new Date(scheduledAt).getTime() < Date.now() && (
              <p className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                <Info className="h-3 w-3" />
                الوقت في الماضي — سيتم النشر فوراً عند الحفظ
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── انتهاء الصلاحية ───────────────────────────────────────────────── */}
      <div className="space-y-3 border-t border-white/5 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <TimerReset className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-black">انتهاء الصلاحية</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                اختياري — إخفاء تلقائي بعد تاريخ معين
              </p>
            </div>
          </div>
          <Switch
            checked={hasExpiry}
            onCheckedChange={(v) =>
              onExpiresAtChange(v ? new Date(Date.now() + 7 * 86400000).toISOString() : null)
            }
            disabled={disabled}
          />
        </div>

        {hasExpiry && (
          <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                value={toLocalInput(expiresAt)}
                onChange={(e) => onExpiresAtChange(fromLocalInput(e.target.value))}
                className="h-10 rounded-xl border-white/10 bg-white/5 text-xs font-bold"
                disabled={disabled}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onExpiresAtChange(null)}
                disabled={disabled}
                title="إلغاء الانتهاء"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {EXPIRY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onExpiresAtChange(applyExpiryPreset(preset))}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-muted-foreground hover:bg-white/10 transition"
                  disabled={disabled}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {expiresAt && new Date(expiresAt).getTime() < Date.now() && (
              <p className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                <Info className="h-3 w-3" />
                تاريخ الانتهاء في الماضي — الإعلان سيُخفى فوراً
              </p>
            )}
          </div>
        )}
      </div>

      <p className="flex items-start gap-1.5 text-[10px] font-bold text-muted-foreground">
        <Sparkles className="h-3 w-3 mt-0.5 shrink-0" />
        النصائح: جدولة النشر مناسبة لإعلانات الفعاليات القادمة. انتهاء الصلاحية مثالي للتنبيهات العاجلة التي لا يجب أن تبقى بعد انتهاء الحدث.
      </p>
    </div>
  );
}