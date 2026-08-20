"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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
