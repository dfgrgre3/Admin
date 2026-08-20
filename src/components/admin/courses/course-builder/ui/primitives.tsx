"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";

// ─── Section ───────────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, description, icon, children }) => (
  <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
    <div className="flex items-start gap-3">
      {icon && <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">{children}</div>
  </section>
);

// ─── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "success" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "default",
  size = "default",
  loading,
  icon,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",
    ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon}
      {children}
    </button>
  );
};

// ─── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = "default", children, ...props }) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-current",
    success: "border-transparent bg-green-500 text-white hover:bg-green-600",
    warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ─── Card ──────────────────────────────────────────────────────────────────────

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("rounded-2xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm transition-all duration-300", className)} {...props}>
    {children}
  </div>
);

// ─── Skeleton ──────────────────────────────────────────────────────────────────

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn("animate-pulse rounded bg-gray-200 dark:bg-gray-700", className)}
    {...props}
  />
);

// ─── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => (
  <div className={cn("text-center py-12", className)}>
    {icon && <div className="mx-auto mb-4 text-gray-300 dark:text-gray-600">{icon}</div>}
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
    {description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── Alert ─────────────────────────────────────────────────────────────────────

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success" | "info";
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ className, variant = "default", onClose, children, ...props }) => {
  const variants = {
    default: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    destructive: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    info: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200",
  };

  const icons = {
    default: <Info className="w-4 h-4" />,
    destructive: <AlertCircle className="w-4 h-4" />,
    warning: <AlertCircle className="w-4 h-4" />,
    success: <CheckCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[variant]}</div>
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Progress ──────────────────────────────────────────────────────────────────

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export const Progress: React.FC<ProgressProps> = ({ className, value, max = 100, ...props }) => (
  <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", className)} {...props}>
    <div
      className="h-full bg-primary-600 transition-all duration-300"
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
);

// ─── Avatar ────────────────────────────────────────────────────────────────────

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Avatar: React.FC<AvatarProps> = ({ className, src, fallback, size = "md", ...props }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  return (
    <div className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full", sizes[size], className)} {...props}>
      {src ? (
        <img src={src} alt="" loading="lazy" decoding="async" className="aspect-square h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          {fallback ? (
            <span className="font-medium text-gray-600 dark:text-gray-400">{fallback}</span>
          ) : (
            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
