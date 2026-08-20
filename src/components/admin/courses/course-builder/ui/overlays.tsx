"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Loader2 } from "lucide-react";

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
