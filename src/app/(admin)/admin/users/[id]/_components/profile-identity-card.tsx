"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Camera, Loader2, CheckCircle } from "lucide-react";
import type { UserDetails } from "./types";

interface ProfileIdentityCardProps {
  user: UserDetails;
  canManage: boolean;
  isUploading: boolean;
  isOnline: boolean;
  onAvatarClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCopy: (text: string, label: string) => void;
}

export function ProfileIdentityCard({
  user,
  canManage,
  isUploading,
  isOnline,
  onAvatarClick,
  fileInputRef,
  onFileChange,
  onCopy,
}: ProfileIdentityCardProps) {
  return (
    <Card className="border-none shadow-2xl bg-gradient-to-b from-card to-card/50 overflow-hidden">
      <div className="h-28 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_40%,white_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      </div>

      <div className="px-6 pb-6 text-center -mt-16 flex flex-col items-center">
        <div className="relative group">
          {isOnline && (
            <span className="absolute top-1 right-1 z-10 h-4 w-4 rounded-full border-2 border-background bg-green-500 shadow-sm shadow-green-500/50" />
          )}
          <Avatar className="h-28 w-28 border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-105">
            <AvatarImage src={user.avatar || undefined} className="object-cover" />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-black">
              {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {canManage && (
            <>
              <button
                type="button"
                onClick={onAvatarClick}
                disabled={isUploading}
                className="absolute bottom-1 left-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-background shadow-lg transition-transform hover:scale-110 disabled:opacity-60"
                title="تغيير الصورة الشخصية"
                aria-label="تغيير الصورة الشخصية"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
                aria-label="رفع صورة شخصية"
              />
            </>
          )}
          {user.emailVerified && (
            <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 border shadow-sm">
              <CheckCircle className="h-5 w-5 text-success fill-success/10" />
            </div>
          )}
        </div>

        <div className="mt-5 space-y-1 w-full">
          <h2 className="text-xl font-black tracking-tight leading-tight">
            {user.name || "مستخدم غير معروف"}
          </h2>
          <button
            className="flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors mx-auto group/copy"
            onClick={() => onCopy(user.username || user.id, "اسم المستخدم")}
          >
            <span className="text-sm font-medium">@{user.username || "بدون_اسم"}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}