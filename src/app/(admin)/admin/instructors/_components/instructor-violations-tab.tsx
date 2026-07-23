"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, Ban, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useInstructorViolations, useCreateViolation, useResolveViolation } from "@/hooks/use-instructors";
import { toast } from "sonner";

interface InstructorViolationsTabProps {
  instructorId: string;
}

export function InstructorViolationsTab({ instructorId }: InstructorViolationsTabProps) {
  const { data: violations = [], isLoading, refetch } = useInstructorViolations(instructorId);
  const createViolationMutation = useCreateViolation();
  const resolveViolationMutation = useResolveViolation();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      open: { label: "مفتوح", variant: "destructive", icon: AlertTriangle },
      investigating: { label: "قيد التحقيق", variant: "default", icon: Clock },
      resolved: { label: "تم الحل", variant: "default", icon: CheckCircle },
      dismissed: { label: "مرفوض", variant: "outline", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.open;
    if (!config) {
      return <Badge variant="secondary">مفتوح</Badge>;
    }
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig: Record<string, { label: string; variant: any }> = {
      low: { label: "منخفضة", variant: "outline" },
      medium: { label: "متوسطة", variant: "secondary" },
      high: { label: "عالية", variant: "default" },
      critical: { label: "حرجة", variant: "destructive" },
    };
    const config = severityConfig[severity] || severityConfig.low;
    if (!config) {
      return <Badge variant="outline">منخفضة</Badge>;
    }
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getViolationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      content_quality: "جودة المحتوى",
      late_response: "استجابة متأخرة",
      policy_violation: "انتهاك السياسات",
      student_complaint: "شكوى طالب",
      technical_issue: "مشكلة تقنية",
      other: "أخرى",
    };
    return labels[type] || type;
  };

  const getPenaltyLabel = (penalty?: { type: string; duration?: number; amount?: number }) => {
    if (!penalty) return null;
    const labels: Record<string, string> = {
      warning: "تحذير",
      suspension: "إيقاف",
      termination: "إنهاء عقد",
      fine: "غرامة",
    };
    const label = labels[penalty.type] || penalty.type;
    if (penalty.duration) return `${label} (${penalty.duration} يوم)`;
    if (penalty.amount) return `${label} (${penalty.amount} ر.س)`;
    return label;
  };

  const handleResolve = async (violationId: string) => {
    const resolution = prompt("أدخل قرار الحل:");
    if (!resolution) return;

    try {
      await resolveViolationMutation.mutateAsync({
        instructorId,
        violationId,
        data: { resolution }
      });
      await refetch();
      toast.success('تم حل المخالفة بنجاح');
    } catch (error) {
      toast.error('فشل في حل المخالفة');
    }
  };

  if (isLoading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي المخالفات</p>
              <p className="text-2xl font-black">{violations.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">مفتوحة</p>
              <p className="text-2xl font-black">
                {violations.filter((v) => v.status === "open" || v.status === "investigating").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">تم الحل</p>
              <p className="text-2xl font-black">
                {violations.filter((v) => v.status === "resolved").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <Ban className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">عقوبات</p>
              <p className="text-2xl font-black">
                {violations.filter((v) => v.penalty).length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Violations List */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">المخالفات</h3>
        {violations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد مخالفات</p>
        ) : (
          <div className="space-y-3">
            {violations.map((violation) => (
              <div
                key={violation.id}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{getViolationTypeLabel(violation.type)}</p>
                      <p className="text-xs text-muted-foreground">{violation.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(violation.severity)}
                    {getStatusBadge(violation.status)}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">تم الإبلاغ</p>
                    <p className="font-bold">{formatDate(violation.reportedAt)}</p>
                    <p className="text-xs text-muted-foreground">بواسطة {violation.reportedBy}</p>
                  </div>
                  {violation.resolvedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground font-bold">تم الحل</p>
                      <p className="font-bold">{formatDate(violation.resolvedAt)}</p>
                      {violation.resolvedBy && (
                        <p className="text-xs text-muted-foreground">بواسطة {violation.resolvedBy}</p>
                      )}
                    </div>
                  )}
                  {violation.penalty && (
                    <div>
                      <p className="text-xs text-muted-foreground font-bold">العقوبة</p>
                      <p className="font-bold text-red-500">{getPenaltyLabel(violation.penalty)}</p>
                    </div>
                  )}
                </div>
                {violation.resolution && (
                  <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground font-bold mb-1">القرار</p>
                    <p className="text-sm text-white">{violation.resolution}</p>
                  </div>
                )}
                {violation.status === "open" && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleResolve(violation.id)}
                      className="rounded-xl"
                    >
                      حل المخالفة
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}