"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox, FileX, SearchX, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EmptyStateVariant = "default" | "search" | "error" | "empty-inbox";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: React.ElementType;
  variant?: "default" | "outline" | "secondary";
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  variant?: EmptyStateVariant;
  actions?: EmptyStateAction[];
  className?: string;
  size?: "sm" | "default" | "lg";
}

const variantConfig: Record<EmptyStateVariant, { icon: React.ElementType; defaultTitle: string; defaultDescription: string }> = {
  default: {
    icon: Inbox,
    defaultTitle: "لا توجد بيانات",
    defaultDescription: "لم يتم العثور على أي عناصر بعد.",
  },
  search: {
    icon: SearchX,
    defaultTitle: "لا توجد نتائج بحث",
    defaultDescription: "حاول تعديل معايير البحث أو استخدام كلمات مختلفة.",
  },
  error: {
    icon: AlertCircle,
    defaultTitle: "حدث خطأ",
    defaultDescription: "تعذر تحميل البيانات. يرجى المحاولة مرة أخرى.",
  },
  "empty-inbox": {
    icon: FileX,
    defaultTitle: "صندوق الوارد فارغ",
    defaultDescription: "لا توجد رسائل أو إشعارات جديدة.",
  },
};

export function EmptyState({
  title,
  description,
  icon: CustomIcon,
  variant = "default",
  actions,
  className,
  size = "default",
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" && "gap-3 py-8",
        size === "default" && "gap-4 py-12",
        size === "lg" && "gap-6 py-20",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted/50 border border-muted",
          size === "sm" && "h-12 w-12",
          size === "default" && "h-16 w-16",
          size === "lg" && "h-24 w-24"
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground",
            size === "sm" && "h-6 w-6",
            size === "default" && "h-8 w-8",
            size === "lg" && "h-12 w-12"
          )}
        />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3
          className={cn(
            "font-bold text-foreground",
            size === "sm" && "text-sm",
            size === "default" && "text-base",
            size === "lg" && "text-lg"
          )}
        >
          {title || config.defaultTitle}
        </h3>
        {(description || config.defaultDescription) && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description || config.defaultDescription}
          </p>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="flex items-center gap-3 mt-2">
          {actions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || "default"}
                size={size === "sm" ? "sm" : "default"}
                onClick={action.onClick}
                className="rounded-xl"
              >
                {ActionIcon && <ActionIcon className="ml-2 h-4 w-4" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}