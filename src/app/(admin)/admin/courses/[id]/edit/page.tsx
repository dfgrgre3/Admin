import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api/api-client";
import { CourseEditor } from "@/components/admin/courses/course-editor";

interface EditCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

function extractCourse(payload: any) {
  return payload?.subject || payload?.course || payload?.data?.subject || payload?.data?.course || payload;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;

  const [coursePayload, categories, teachers, allCourses] = await Promise.all([
    apiClient.get<any>(`/courses/${id}`).catch(() => null),
    apiClient.get<any[]>("/categories?type=COURSE").catch(() => []),
    apiClient.get<any[]>("/teachers").catch(() => []),
    apiClient.get<any[]>("/subjects").catch(() => []),
  ]);

  const initialData = extractCourse(coursePayload);

  if (!initialData?.id) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <CourseEditor
        courseId={id}
        initialData={initialData}
        categories={categories}
        teachers={teachers}
        allCourses={allCourses}
      />
    </div>
  );
}
