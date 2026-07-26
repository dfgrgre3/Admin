import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/api-client";
import { CourseEditor } from "@/components/admin/courses/course-editor";
import { extractCourseOptions } from "@/components/admin/courses/course-editor/course-options";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const cookieHeader = (await cookies()).toString();

  // Fetch data from Go Backend API
  const [categories, teachers, allCoursesPayload] = await Promise.all([
    apiClient.get<any[]>("/categories?type=COURSE").catch(() => []),
    apiClient.get<any[]>("/teachers").catch(() => []),
    apiClient.get<unknown>("/admin/subjects?limit=100", {
      headers: { Cookie: cookieHeader },
    }).catch(() => []),
  ]);
  const allCourses = extractCourseOptions(allCoursesPayload);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <CourseEditor 
        categories={categories} 
        teachers={teachers} 
        allCourses={allCourses}
      />
    </div>
  );
}
