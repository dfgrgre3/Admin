import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api/api-client";
import { CourseEditor } from "@/components/admin/courses/course-editor";
import { extractCourseOptions } from "@/components/admin/courses/course-editor/course-options";

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
  const cookieHeader = (await cookies()).toString();
  const [coursePayload, categories, teachers, allCoursesPayload] = await Promise.all([
    apiClient.get<any>(`/admin/courses/${id}`, {
      headers: { Cookie: cookieHeader },
    }).catch(() => null),
    apiClient.get<any[]>("/categories?type=COURSE").catch(() => []),
    apiClient.get<any[]>("/teachers").catch(() => []),
    apiClient.get<unknown>("/admin/subjects?limit=100", {
      headers: { Cookie: cookieHeader },
    }).catch(() => []),
  ]);

  const initialData = extractCourse(coursePayload);
  const allCourses = extractCourseOptions(allCoursesPayload);

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
