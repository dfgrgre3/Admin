"use client";

import {
  ArrowRight,
  Edit,
  ExternalLink,
  KeyRound,
  LogIn,
  Shield,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserDetails } from "./types";

interface ProfileQuickActionsProps {
  user: UserDetails;
  onEdit: () => void;
  onChangePassword: () => void;
  onPermissions: () => void;
  onSecurity: () => void;
  onImpersonate?: () => void;
  onAdvancedEdit: () => void;
  onBack: () => void;
}

interface ActionItem {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "outline" | "destructive";
  iconColor: string;
  iconBg: string;
  hoverClass: string;
}

export function ProfileQuickActions({
  onEdit,
  onChangePassword,
  onPermissions,
  onSecurity,
  onImpersonate,
  onAdvancedEdit,
  onBack,
}: ProfileQuickActionsProps) {
  const actions: ActionItem[] = [
    { icon: Edit, label: "تعديل البيانات", onClick: onEdit, variant: "outline", iconColor: "text-primary", iconBg: "bg-primary/10", hoverClass: "hover:bg-primary/5 hover:border-primary/30" },
    { icon: KeyRound, label: "تغيير كلمة المرور", onClick: onChangePassword, variant: "outline", iconColor: "text-amber-600", iconBg: "bg-amber-500/10", hoverClass: "hover:bg-amber-500/5 hover:border-amber-500/30" },
    { icon: ShieldCheck, label: "إدارة الصلاحيات", onClick: onPermissions, variant: "outline", iconColor: "text-blue-600", iconBg: "bg-blue-500/10", hoverClass: "hover:bg-blue-500/5 hover:border-blue-500/30" },
    { icon: Shield, label: "الأمان والحظر", onClick: onSecurity, variant: "outline", iconColor: "text-red-600", iconBg: "bg-red-500/10", hoverClass: "hover:bg-red-500/5 hover:border-red-500/30" },
    { icon: LogIn, label: "تسجيل الدخول كـ (Impersonate)", onClick: () => onImpersonate?.(), variant: "destructive", iconColor: "text-danger", iconBg: "bg-danger/10", hoverClass: "hover:bg-danger hover:text-white" },
    { icon: ExternalLink, label: "تعديل متقدم", onClick: onAdvancedEdit, variant: "outline", iconColor: "text-muted-foreground", iconBg: "bg-muted", hoverClass: "hover:bg-muted/60" },
    { icon: ArrowRight, label: "عرض الملف الشخصي", onClick: onBack, variant: "outline", iconColor: "text-muted-foreground", iconBg: "bg-muted", hoverClass: "hover:bg-muted/60" },
  ];

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-black flex items-center gap-2">
          <Settings className="h-4 w-4" />
          إجراءات سريعة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant || "outline"}
              className={`w-full justify-start rounded-xl gap-3 h-11 text-sm font-medium transition-all ${action.hoverClass}`}
              onClick={action.onClick}
            >
              <div className={`p-1.5 rounded-lg ${action.iconBg}`}>
                <Icon className={`h-3.5 w-3.5 ${action.iconColor}`} />
              </div>
              {action.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}