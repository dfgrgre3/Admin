"use client";

import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryLabels } from "../_lib/event-config";

interface ActivityFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  onReset: () => void;
}

export function ActivityFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onReset,
}: ActivityFiltersProps) {
  const showReset = !!search || category !== "all";
  return (
    <Card className="border-white/10 bg-card/30 backdrop-blur">
      <CardContent className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="بحث في الأحداث، الـ IP، التفاصيل..."
            className="pr-9 rounded-xl h-10 bg-accent/10 border-white/10"
          />
        </div>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40 rounded-xl h-10 bg-accent/10 border-white/10">
            <Filter className="h-4 w-4 ml-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="rounded-xl">
            مسح الفلاتر
          </Button>
        )}
      </CardContent>
    </Card>
  );
}