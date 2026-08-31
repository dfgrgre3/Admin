export type CourseStatus = "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" | string;

export interface Course {
  id: string;
  title: string;
  titleAr?: string;
  status: CourseStatus;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  grade?: number;
  certificateUrl?: string;
}

export interface UserCoursesTabProps {
  userId: string;
}