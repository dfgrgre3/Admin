"use client";

import * as React from "react";
import {
  Repeat,
  Calendar,
  Clock,
  RotateCw,
  CalendarDays,
  Info,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  RECURRENCE_OPTIONS,
  RecurrenceConfig,
  RecurrenceFrequency,
  WEEKDAY_LABELS,
} from "./types";

interface RecurrencePickerProps {
  value?: RecurrenceConfig;
  onChange: (config: RecurrenceConfig | undefined) => void;
}

export function RecurrencePicker({ value, onChange }: RecurrencePickerProps) {
  const enabled = value?.frequency && value.frequency !== "none";
  const config: RecurrenceConfig = value || {
    frequency: "none",
    count: 0,
    hour: 9,
    minute: 0,
  };

  const update = (patch: Partial<RecurrenceConfig>) => {
    onChange({ ...config, ...patch });
  };

  const toggleEnabled = (on: boolean) => {
    if (on) {
      onChange({ ...config, frequency: "daily" });
    } else {
      onChange({ frequency: "none", count: 0, hour: 9, minute: 0 });
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4 space-y-4">
      {/* المفتاح الرئيسي */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
            <Repeat className="h-4 w-4 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-black">التكرار التلقائي</p>
            <p className="text-[10px] text-muted-foreground font-bold">
              انشر الإعلان تلقائياً على فترات منتظمة
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={toggleEnabled}
        />
      </div>

      {enabled && (
        <div className="space-y-4 pt-2 border-t border-white/5">
          {/* نوع التكرار */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 block">
              نوع التكرار
            </label>
            <Select
              value={config.frequency}
              onValueChange={(v: RecurrenceFrequency) => update({ frequency: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.filter((o) => o.value !== "none").map(
                  (opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <p className="font-bold">{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {opt.description}
                        </p>
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* يوم الأسبوع (للأسبوعي) */}
          {config.frequency === "weekly" && (
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                أيام الأسبوع
              </label>
              <div className="flex gap-1 flex-wrap">
                {WEEKDAY_LABELS.map((label, idx) => {
                  const active = config.weekdays?.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const current = config.weekdays || [];
                        const next = active
                          ? current.filter((d) => d !== idx)
                          : [...current, idx];
                        update({ weekdays: next });
                      }}
                      className={cn(
                        "h-9 w-9 rounded-full text-[10px] font-black transition border",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-white/10 hover:border-white/30 bg-white/2.5"
                      )}
                      title={label}
                    >
                      {label.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* يوم الشهر (للشهري) */}
          {config.frequency === "monthly" && (
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                يوم الشهر
              </label>
              <Input
                type="number"
                min={1}
                max={31}
                value={config.dayOfMonth || 1}
                onChange={(e) =>
                  update({ dayOfMonth: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          )}

          {/* وقت النشر */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                الساعة
              </label>
              <Select
                value={config.hour.toString()}
                onValueChange={(v) => update({ hour: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {Array.from({ length: 24 }).map((_, h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                الدقيقة
              </label>
              <Select
                value={config.minute.toString()}
                onValueChange={(v) => update({ minute: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 15, 30, 45].map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* عدد التكرارات */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <RotateCw className="h-3 w-3" />
                عدد التكرارات
              </label>
              <Input
                type="number"
                min={0}
                placeholder="0 = لا نهائي"
                value={config.count}
                onChange={(e) =>
                  update({ count: parseInt(e.target.value) || 0 })
                }
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                {config.count === 0 ? "تكرار لا نهائي" : `${config.count} مرة`}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                تاريخ الانتهاء
              </label>
              <Input
                type="datetime-local"
                value={config.endDate || ""}
                onChange={(e) => update({ endDate: e.target.value || undefined })}
              />
            </div>
          </div>

          {/* ملخص */}
          <div className="flex items-start gap-2 rounded-lg bg-violet-500/10 border border-violet-500/20 p-3 text-[11px]">
            <Info className="h-3.5 w-3.5 text-violet-500 shrink-0 mt-0.5" />
            <p className="text-violet-700 dark:text-violet-300 font-bold">
              سيتم نشر الإعلان تلقائياً كل{" "}
              {RECURRENCE_OPTIONS.find((o) => o.value === config.frequency)?.label}{" "}
              في الساعة {config.hour.toString().padStart(2, "0")}:
              {config.minute.toString().padStart(2, "0")}
              {config.count > 0 && ` (${config.count} مرة)`}
              {config.endDate && ` حتى ${new Date(config.endDate).toLocaleDateString("ar-EG")}`}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}