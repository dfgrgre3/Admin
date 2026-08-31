"use client";

import { toast } from "sonner";

export function useCopyToClipboard() {
  return (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`تم نسخ ${label}`);
    });
  };
}