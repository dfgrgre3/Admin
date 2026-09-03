"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEVEL_LABELS, LANGUAGE_LABELS, PAGE_SIZE_OPTIONS } from "./utils";

interface ArchivedToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterLevel: string;
  onFilterLevelChange: (value: string) => void;
  filterLanguage: string;
  onFilterLanguageChange: (value: string) => void;
  total: number;
  perPage: number;
  onPerPageChange: (value: number) => void;
}

export function ArchivedToolbar({
  search,
  onSearchChange,
  filterLevel,
  onFilterLevelChange,
  filterLanguage,
  onFilterLanguageChange,
  total,
  perPage,
  onPerPageChange,
}: ArchivedToolbarProps) {
  return (
    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
      <div className="relative w-full lg:max-w-sm">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ابحث بالعنوان أو الرابط المختصر..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 rounded-xl pr-9"
        />
      </div>

      <Select value={filterLevel} onValueChange={onFilterLevelChange}>
        <SelectTrigger className="h-10 w-40 rounded-xl">
          <SelectValue placeholder="المستوى" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">جميع المستويات</SelectItem>
          {Object.entries(LEVEL_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterLanguage} onValueChange={onFilterLanguageChange}>
        <SelectTrigger className="h-10 w-40 rounded-xl">
          <SelectValue placeholder="اللغة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">جميع اللغات</SelectItem>
          {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-1 items-center justify-between gap-3">
        <p className="hidden text-sm text-muted-foreground sm:block">
          إجمالي المؤرشف: <span className="font-bold text-foreground">{total}</span>
        </p>

        <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
          <SelectTrigger className="h-10 w-28 rounded-xl">
            <SelectValue placeholder="لكل صفحة" />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / صفحة
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
