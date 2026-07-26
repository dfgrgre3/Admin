"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { format, isSameDay, isSameMonth, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, getDay } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  size?: "sm" | "default" | "lg";
  clearable?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "اختر تاريخاً...",
  className,
  disabled = false,
  disabledDates = [],
  minDate,
  maxDate,
  size = "default",
  clearable = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date());

  React.useEffect(() => {
    if (value) {
      setCurrentMonth(value);
    }
  }, [value]);

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      if (disabledDates.some((d) => isSameDay(d, date))) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    },
    [disabledDates, minDate, maxDate]
  );

  const handleSelect = React.useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;
      onChange(date);
      setOpen(false);
    },
    [onChange, isDateDisabled]
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    },
    [onChange]
  );

  const goToPreviousMonth = React.useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const goToNextMonth = React.useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const renderDays = React.useCallback(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 6 }); // Saturday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 6 });

    const days: React.ReactNode[] = [];
    let day = calendarStart;

    // Day headers
    const dayHeaders = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];
    days.push(
      <div key="header" className="grid grid-cols-7 mb-1">
        {dayHeaders.map((header, i) => (
          <div
            key={i}
            className="flex h-8 w-full items-center justify-center text-[11px] font-bold text-muted-foreground"
          >
            {header}
          </div>
        ))}
      </div>
    );

    // Day cells
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];

    while (day <= calendarEnd) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isCurrentMonth = isSameMonth(currentDay, currentMonth);
        const isSelected = value ? isSameDay(currentDay, value) : false;
        const isTodayDate = isToday(currentDay);
        const disabled = isDateDisabled(currentDay);

        cells.push(
          <button
            key={currentDay.toISOString()}
            type="button"
            disabled={disabled || !isCurrentMonth}
            onClick={() => handleSelect(currentDay)}
            className={cn(
              "flex h-9 w-full items-center justify-center rounded-lg text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              !isCurrentMonth && "text-muted-foreground/30 cursor-default",
              isCurrentMonth && !isSelected && !disabled && "hover:bg-accent hover:text-accent-foreground cursor-pointer",
              isSelected && "bg-primary text-primary-foreground font-bold shadow-sm",
              isTodayDate && !isSelected && "border border-primary/50 font-semibold text-primary",
              disabled && "opacity-30 cursor-not-allowed"
            )}
          >
            {format(currentDay, "d")}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7 gap-0.5">
          {cells}
        </div>
      );
      cells = [];
    }

    return (
      <div className="space-y-0.5">
        {dayHeaders && (
          <div className="grid grid-cols-7 mb-1">
            {dayHeaders.map((header, i) => (
              <div
                key={i}
                className="flex h-8 w-full items-center justify-center text-[11px] font-bold text-muted-foreground"
              >
                {header}
              </div>
            ))}
          </div>
        )}
        {rows}
      </div>
    );
  }, [currentMonth, value, handleSelect, isDateDisabled]);

  const sizeClasses = {
    sm: "h-8 text-xs px-2",
    default: "h-10 text-sm px-3",
    lg: "h-12 text-base px-4",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-input bg-background text-right",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-primary/50",
            sizeClasses[size],
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            {value ? (
              <span className="font-medium">
                {format(value, "yyyy/MM/dd", { locale: ar })}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          {clearable && value && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 hover:bg-muted mr-1"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3 rounded-xl"
        align="start"
        sideOffset={4}
      >
        <div className="space-y-3">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="text-sm font-bold">
              {format(currentMonth, "MMMM yyyy", { locale: ar })}
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          {renderDays()}
        </div>
      </PopoverContent>
    </Popover>
  );
}