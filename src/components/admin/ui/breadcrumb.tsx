"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center gap-2 text-sm", className)}>
      <Link
        href="/admin"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-primary font-medium">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
