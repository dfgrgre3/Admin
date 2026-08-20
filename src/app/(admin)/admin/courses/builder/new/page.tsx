"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { draftApi } from "@/components/admin/courses/course-builder/api";
import { Loader2 } from "lucide-react";

export default function NewCourseBuilderPage() {
  const router = useRouter();
  
  // Redirect to create new draft
  useEffect(() => {
    const createNew = async () => {
      try {
        const response = await draftApi.createDraft({ status: "DRAFT" });
        if (response.data?.id) {
          router.push(`/admin/courses/builder/${response.data.id}`);
        } else if (response.error) {
          console.error("Failed to create draft:", response.error);
        }
      } catch (err) {
        console.error("Failed to create draft:", err);
      }
    };
    
    createNew();
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">جاري إنشاء كورس جديد...</p>
      </div>
    </div>
  );
}