"use client";

import { CourseBuilderWizard } from "@/components/admin/courses/course-builder/CourseBuilderWizard";

export default function CourseBuilderPage({ params }: { params: { id: string } }) {
  return <CourseBuilderWizard courseId={params.id} />;
}