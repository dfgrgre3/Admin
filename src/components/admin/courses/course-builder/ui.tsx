"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, ChevronDown, Loader2, AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

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

// ─── Label ────────────────────────────────────────────────────────────────────

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, htmlFor, required, ...props }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1" {...props}>
    {children}
    {required && <span className="text-red-500" aria-hidden="true">*</span>}
  </label>
);

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ className, error, ...props }) => (
  <div className="space-y-1">
    <input
      className={cn(
        "w-full px-4 py-2.5 rounded-lg border transition-colors",
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
        "dark:border-gray-600 dark:bg-gray-800 dark:text-white",
        className
      )}
      {...props}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

// ─── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: React.ReactNode;
}

export const Textarea: React.FC<TextareaProps> = ({ className, error, ...props }) => (
  <div className="space-y-1">
    <textarea
      className={cn(
        "w-full px-4 py-2.5 rounded-lg border transition-colors",
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
        "dark:border-gray-600 dark:bg-gray-800 dark:text-white",
        className
      )}
      {...props}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

// ─── Select ────────────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  placeholder?: string;
  error?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ className, error, options = [], placeholder, ...props }) => (
  <div className="space-y-1">
    <select
      className={cn(
        "w-full px-4 py-2.5 rounded-lg border transition-colors appearance-none",
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
        "dark:border-gray-600 dark:bg-gray-800 dark:text-white",
        className
      )}
      {...props}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
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

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => (
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
        <img src={src} alt="" className="aspect-square h-full w-full object-cover" />
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

// ─── Tooltip ───────────────────────────────────────────────────────────────────

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<{ className?: string }>;
  side?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = "top" }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="relative inline-block" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      {React.cloneElement(children, { className: cn(children.props.className, "relative") })}
      {isOpen && (
        <div className={cn(
          "absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg shadow-lg whitespace-nowrap",
          side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
          side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
          side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
          side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
        )}>
          {content}
        </div>
      )}
    </div>
  );
};

// ─── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children, footer, size = "md" }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw]",
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full", sizes[size])}>
        {(title || description) && (
          <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
              {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Table ─────────────────────────────────────────────────────────────────────

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, children, ...props }) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <thead className={cn("[&_tr]:border-b", className)} {...props}>{children}</thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>{children}</tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, children, ...props }) => (
  <tr className={cn("border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 data-[state=selected]:bg-muted", className)} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <th className={cn("h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400 [&:has([role=checkbox])]:pr-0", className)} {...props}>{children}</th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props}>{children}</td>
);

// ─── TabList/Tab/TabPanel ──────────────────────────────────────────────────────

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{ value: string; onValueChange: (value: string) => void } | null>(null);

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div className={cn("w-full", className)} data-tabs>{children}</div>
  </TabsContext.Provider>
);

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400", className)} role="tablist">
    {children}
  </div>
);

export const Tab: React.FC<TabProps> = ({ value, children, disabled, className }) => {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && context?.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>{children}</div>;
};

export const TabPanel = TabsContent;
export const TabPanels: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

// ─── LoadingOverlay ────────────────────────────────────────────────────────────

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message = "جاري التحميل..." }) => (
  isLoading && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center max-w-md mx-4">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
      </div>
    </div>
  )
);

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