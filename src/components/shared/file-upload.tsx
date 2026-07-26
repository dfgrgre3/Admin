"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, FileText, File } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  value?: File[];
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  showPreview?: boolean;
}

export function FileUpload({
  accept = "image/*",
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  onFilesChange,
  value = [],
  disabled = false,
  className,
  label = "رفع الملفات",
  description = "اسحب وأفلت الملفات هنا أو انقر للاختيار",
  showPreview = true,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>(value);
  const [dragActive, setDragActive] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setFiles(value);
  }, [value]);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `الملف "${file.name}" يتجاوز الحد الأقصى (${(maxSize / 1024 / 1024).toFixed(1)}MB)`;
    }
    return null;
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    if (validFiles.length === 0) return;

    setErrors([]);

    if (multiple) {
      const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    } else {
      const firstFile = validFiles[0];
      if (firstFile) {
        setFiles([firstFile]);
        onFilesChange?.([firstFile]);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && !disabled) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (file.type.startsWith("text/")) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            dragActive ? "bg-primary/10" : "bg-muted"
          )}>
            <Upload className={cn("h-6 w-6", dragActive ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            الحد الأقصى: {formatFileSize(maxSize)} {multiple && `| الحد الأقصى للملفات: ${maxFiles}`}
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, i) => (
            <p key={i} className="text-xs text-destructive">{error}</p>
          ))}
        </div>
      )}

      {showPreview && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              {isImage(file) ? (
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                  {getFileIcon(file)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
