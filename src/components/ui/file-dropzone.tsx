"use client";

import React, { useCallback } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { UploadCloud, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: DropzoneOptions["accept"];
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  label?: string;
}

export function FileDropzone({
  onFilesSelected,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  className,
  label = "اسحب الملفات هنا أو اضغط للاختيار",
}: FileDropzoneProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedFiles(acceptedFiles);
      onFilesSelected?.(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  });

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected?.(updated);
  };

  return (
    <div className={cn("space-y-3 dir-rtl", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-accent/30",
          isDragActive && "border-primary bg-primary/5 scale-[0.99]",
          isDragReject && "border-destructive bg-destructive/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            {multiple ? "يمكنك رفع أكثر من ملف" : "ملف واحد فقط"} (الحد الأقصى: {Math.round(maxSize / (1024 * 1024))}MB)
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs"
            >
              <div className="flex items-center space-x-2 space-x-reverse truncate">
                <File className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium truncate">{file.name}</span>
                <span className="text-muted-foreground shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="p-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                title="حذف"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
