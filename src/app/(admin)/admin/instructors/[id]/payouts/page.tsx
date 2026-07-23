"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ArrowLeft } from "lucide-react";
import { InstructorPayoutsTab } from "@/app/(admin)/admin/instructors/_components/instructor-payouts-tab";

export default function InstructorPayoutsPage() {
  const router = useRouter();
  const params = useParams();
  const instructorId = params.id as string;

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <PageHeader
        title="المدفوعات والعمولات"
        description="عرض وإدارة مدفوعات المدرّس"
      >
        <AdminButton variant="outline" icon={ArrowLeft} onClick={() => router.push(`/admin/instructors/${instructorId}`)} className="rounded-xl border-white/10">
          العودة للمدرّس
        </AdminButton>
      </PageHeader>

      <InstructorPayoutsTab instructorId={instructorId} />
    </div>
  );
}