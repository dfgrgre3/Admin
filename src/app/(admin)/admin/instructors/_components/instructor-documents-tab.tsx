"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useInstructorDocuments, useReviewDocument } from "@/hooks/use-instructors";
import { toast } from "sonner";

interface InstructorDocumentsTabProps {
  instructorId: string;
}

export function InstructorDocumentsTab({ instructorId }: InstructorDocumentsTabProps) {
  const { data: documents = [], isLoading, refetch } = useInstructorDocuments(instructorId);
  const reviewMutation = useReviewDocument();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      pending: { label: "معلق", variant: "secondary", icon: Clock },
      approved: { label: "موافق عليه", variant: "default", icon: CheckCircle },
      rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
      under_review: { label: "قيد المراجعة", variant: "default", icon: AlertTriangle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    if (!config) {
      return <Badge variant="secondary">معلق</Badge>;
    }
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      id: "هوية",
      cv: "سيرة ذاتية",
      certificate: "شهادات",
      video: "فيديو تعريفي",
      experience: "خبرة",
      other: "أخرى",
    };
    return labels[type] || type;
  };

  const handleReview = async (documentId: string, status: 'approved' | 'rejected') => {
    try {
      await reviewMutation.mutateAsync({
        instructorId,
        documentId,
        data: { status }
      });
      await refetch();
      toast.success(`تم ${status === 'approved' ? 'اعتماد' : 'رفض'} المستند بنجاح`);
    } catch (error) {
      toast.error('فشل في تحديث حالة المستند');
    }
  };

  if (isLoading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
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
              <p className="text-xs text-muted-foreground font-bold">إجمالي المستندات</p>
              <p className="text-2xl font-black">{documents.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">قيد المراجعة</p>
              <p className="text-2xl font-black">
                {documents.filter((d) => d.status === "under_review" || d.status === "pending").length}
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
              <p className="text-xs text-muted-foreground font-bold">موافق عليها</p>
              <p className="text-2xl font-black">
                {documents.filter((d) => d.status === "approved").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">مرفوضة</p>
              <p className="text-2xl font-black">
                {documents.filter((d) => d.status === "rejected").length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Documents List */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">المستندات</h3>
        {documents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد مستندات</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white">{doc.name}</p>
                      <Badge variant="outline">{getDocumentTypeLabel(doc.type)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      تاريخ الرفع: {formatDate(doc.uploadedAt)}
                      {doc.reviewedAt && ` • تاريخ المراجعة: ${formatDate(doc.reviewedAt)}`}
                    </p>
                    {doc.reviewNotes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ملاحظات: {doc.reviewNotes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(doc.status)}
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-green-500 hover:text-green-500 hover:bg-green-500/10"
                    onClick={() => handleReview(doc.id, 'approved')}
                    disabled={reviewMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleReview(doc.id, 'rejected')}
                    disabled={reviewMutation.isPending}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}