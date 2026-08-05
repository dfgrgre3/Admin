"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Download, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Certificate {
  id: string;
  title: string;
  titleAr?: string;
  courseName: string;
  courseNameAr?: string;
  issuedAt: string;
  expiresAt?: string;
  certificateUrl: string;
  verificationCode: string;
  grade?: number;
}

interface UserCertificatesTabProps {
  userId: string;
}

export function UserCertificatesTab({ userId: _userId }: UserCertificatesTabProps) {
  const [certificates] = React.useState<Certificate[]>([]);
  const [loading] = React.useState(false);

  if (loading) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي الشهادات</p>
              <p className="text-2xl font-black">{certificates.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">سارية</p>
              <p className="text-2xl font-black">
                {certificates.filter((c) => !c.expiresAt || new Date(c.expiresAt) > new Date()).length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">متوسط الدرجة</p>
              <p className="text-2xl font-black">
                {certificates.length > 0
                  ? Math.round(certificates.reduce((acc, c) => acc + (c.grade || 0), 0) / certificates.length)
                  : 0}
                %
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Certificates List */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">الشهادات</h3>
        {certificates.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد شهادات بعد</p>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-white">
                      {cert.titleAr || cert.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cert.courseNameAr || cert.courseName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      تاريخ الإصدار: {formatDate(cert.issuedAt)}
                      {cert.expiresAt && ` • ينتهي: ${formatDate(cert.expiresAt)}`}
                    </p>
                    {cert.grade && (
                      <p className="text-xs text-muted-foreground">
                        الدرجة: {cert.grade}%
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="gap-1">
                    <Eye className="h-3 w-3" />
                    {cert.verificationCode}
                  </Badge>
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}