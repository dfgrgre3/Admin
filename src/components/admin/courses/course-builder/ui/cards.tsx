"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card } from "./primitives";
import { Badge } from "./primitives";

// ─── SuggestionCard ────────────────────────────────────────────────────────────

interface SuggestionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  passed: boolean;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ icon, title, description, passed }) => (
  <Card className={`p-4 flex items-start gap-3 ${passed ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : ""}`}>
    <div className={cn(
      "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
      passed ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
    )}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={cn("font-medium", passed ? "text-green-700 dark:text-green-300" : "text-gray-900 dark:text-white")}>
        {title}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
    </div>
    <div className="flex-shrink-0">
      {passed ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
      )}
    </div>
  </Card>
);

// ─── ChecklistItemCard ──────────────────────────────────────────────────────────

interface ChecklistItemCardProps {
  item: {
    id: string;
    label: string;
    description?: string;
    passed: boolean;
    warning?: boolean;
    icon: React.ReactNode;
  };
}

export const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({ item }) => (
  <Card className={cn(
    "flex items-center gap-4 p-4 transition-colors",
    item.passed ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
    item.warning ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" :
    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
  )}>
    <div className={cn(
      "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
      item.passed ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
      item.warning ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
      "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
    )}>
      {item.passed ? (
        <CheckCircle className="w-5 h-5" />
      ) : item.warning ? (
        <AlertCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
      {item.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
      )}
    </div>
    <div className="flex-shrink-0">
      {item.passed ? (
        <Badge variant="success" className="text-xs">مكتمل</Badge>
      ) : item.warning ? (
        <Badge variant="warning" className="text-xs">تحذير</Badge>
      ) : (
        <Badge variant="destructive" className="text-xs">مطلوب</Badge>
      )}
    </div>
  </Card>
);
