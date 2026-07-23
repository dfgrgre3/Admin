"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useInstructorContracts, useCreateContract } from "@/hooks/use-instructors";
import { toast } from "sonner";

interface InstructorContractTabProps {
  instructorId: string;
}

export function InstructorContractTab({ instructorId }: InstructorContractTabProps) {
  const { data: contracts = [], isLoading, refetch } = useInstructorContracts(instructorId);
  const createContractMutation = useCreateContract();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      draft: { label: "مسودة", variant: "secondary", icon: FileText },
      pending_signature: { label: "بانتظار التوقيع", variant: "default", icon: Clock },
      active: { label: "نشط", variant: "default", icon: CheckCircle },
      expired: { label: "منتهي", variant: "outline", icon: XCircle },
      terminated: { label: "منهي", variant: "destructive", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.draft;
    if (!config) {
      return <Badge variant="secondary">مسودة</Badge>;
    }
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getContractTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      standard: "قياسي",
      custom: "مخصص",
      renewal: "تجديد",
    };
    return labels[type] || type;
  };

  const handleCreateContract = async () => {
    try {
      await createContractMutation.mutateAsync({
        instructorId,
        data: {
          type: 'standard',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          commissionRate: 50,
          terms: 'Standard contract terms',
        }
      });
      await refetch();
      toast.success('تم إنشاء العقد بنجاح');
    } catch (error) {
      toast.error('فشل في إنشاء العقد');
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
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي العقود</p>
              <p className="text-2xl font-black">{contracts.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">عقود نشطة</p>
              <p className="text-2xl font-black">
                {contracts.filter((c) => c.status === "active").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">بانتظار التوقيع</p>
              <p className="text-2xl font-black">
                {contracts.filter((c) => c.status === "pending_signature").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">قابلة للتجديد</p>
              <p className="text-2xl font-black">
                {contracts.filter((c) => c.status === "active" && new Date(c.endDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Contracts List */}
      <AdminCard variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">العقود</h3>
          <Button onClick={handleCreateContract} className="rounded-xl" disabled={createContractMutation.isPending}>
            <FileText className="h-4 w-4 ml-2" />
            إنشاء عقد جديد
          </Button>
        </div>
        {contracts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد عقود</p>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <p className="font-bold text-white">{getContractTypeLabel(contract.type)}</p>
                    {getStatusBadge(contract.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-green-500 hover:text-green-500 hover:bg-green-500/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">تاريخ البداية</p>
                    <p className="font-bold">{formatDate(contract.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">تاريخ النهاية</p>
                    <p className="font-bold">{formatDate(contract.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">نسبة العمولة</p>
                    <p className="font-bold text-primary">{contract.commissionRate}%</p>
                  </div>
                </div>
                {contract.terms && (
                  <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground font-bold mb-1">الشروط والأحكام</p>
                    <p className="text-sm text-white">{contract.terms}</p>
                  </div>
                )}
                {contract.signedAt && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    تم التوقيع: {formatDate(contract.signedAt)} بواسطة {contract.signedBy}
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