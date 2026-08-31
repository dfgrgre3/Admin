"use client";

import { UploadCloud } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AVATAR_ACCEPTED_TYPES, AVATAR_MAX_SIZE_MB } from "./create-user-schema";

interface AvatarUploaderProps {
  preview: string | null;
  firstName: string;
  fileName?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export function AvatarUploader({
  preview,
  firstName,
  fileName,
  onUpload,
  onRemove,
}: AvatarUploaderProps) {
  return (
    <Card className="lg:col-span-1 h-fit">
      <CardHeader className="text-center">
        <Avatar className="h-28 w-28 mx-auto mb-4 border-2 border-primary/20">
          {preview ? (
            <AvatarImage src={preview} />
          ) : (
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              {firstName?.charAt(0) || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        <CardTitle>الصورة الشخصية</CardTitle>
        <CardDescription>
          JPG, PNG, WebP أو GIF — بحد أقصى {AVATAR_MAX_SIZE_MB}MB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30 p-6 cursor-pointer hover:border-primary/50 transition-colors">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-bold">اضغط لاختيار صورة</span>
          <input
            type="file"
            accept={AVATAR_ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
        {fileName ? (
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
            <span className="text-xs font-bold truncate">{fileName}</span>
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-destructive font-black hover:underline"
            >
              إزالة
            </button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}