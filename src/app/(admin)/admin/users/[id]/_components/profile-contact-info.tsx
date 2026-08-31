"use client";

import { format, isValid, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Copy,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UserDetails } from "./types";

interface ProfileContactInfoProps {
  user: UserDetails;
  isOnline: boolean;
  onCopy: (text: string, label: string) => void;
}

interface InfoItemProps {
  icon: React.ElementType;
  iconClass: string;
  primary: React.ReactNode;
  secondary: string;
  onClick?: () => void;
  dir?: "ltr" | "rtl";
}

function InfoItem({ icon: Icon, iconClass, primary, secondary, onClick, dir }: InfoItemProps) {
  return (
    <div
      className={`flex items-center gap-3 text-sm p-2 -mx-2 ${onClick ? "cursor-pointer hover:bg-muted/30 rounded-xl transition-colors" : ""}`}
      onClick={onClick}
      dir={dir}
    >
      <div className={`p-2 rounded-lg shrink-0 ${iconClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-xs truncate">{primary}</p>
        <p className="text-[10px] text-muted-foreground">{secondary}</p>
      </div>
      {onClick && <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover/item:opacity-70 shrink-0 transition-opacity" />}
    </div>
  );
}

export function ProfileContactInfo({ user, isOnline, onCopy }: ProfileContactInfoProps) {
  const lastLoginText = user.lastLogin && isValid(new Date(user.lastLogin))
    ? formatDistanceToNow(new Date(user.lastLogin), { locale: ar, addSuffix: true })
    : "لم يسجل دخول بعد";

  return (
    <div className="pt-5 border-t w-full space-y-3 text-right mt-4">
      <InfoItem
        icon={Mail}
        iconClass="bg-primary/10 text-primary"
        primary={user.email}
        secondary="البريد الإلكتروني"
        onClick={() => onCopy(user.email, "البريد الإلكتروني")}
        dir="ltr"
      />
      {user.phone && (
        <InfoItem
          icon={Phone}
          iconClass="bg-green-500/10 text-green-600"
          primary={user.phone}
          secondary="رقم الهاتف"
          onClick={() => onCopy(user.phone!, "رقم الهاتف")}
          dir="ltr"
        />
      )}
      {user.country && (
        <InfoItem
          icon={Globe}
          iconClass="bg-cyan-500/10 text-cyan-600"
          primary={user.country}
          secondary="الدولة"
        />
      )}
      {user.school && (
        <InfoItem
          icon={MapPin}
          iconClass="bg-indigo-500/10 text-indigo-600"
          primary={user.school}
          secondary="المدرسة"
        />
      )}
      <InfoItem
        icon={Calendar}
        iconClass="bg-orange-500/10 text-orange-600"
        primary={user.createdAt && isValid(new Date(user.createdAt))
          ? format(new Date(user.createdAt), "d MMMM yyyy", { locale: ar })
          : "-"}
        secondary="تاريخ الانضمام"
      />
      <div className="flex items-center gap-3 text-sm p-2 -mx-2">
        <div className={`p-2 rounded-lg shrink-0 ${isOnline ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
          <Clock className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            {lastLoginText}
            {isOnline && (
              <Badge className="text-[8px] bg-green-500/10 text-green-600 border-none h-3.5 px-1.5 font-black">
                متصل الآن
              </Badge>
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">آخر تسجيل دخول</p>
        </div>
      </div>
    </div>
  );
}