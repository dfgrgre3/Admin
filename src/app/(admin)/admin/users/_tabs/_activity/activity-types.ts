export type ActivityType =
  | "study"
  | "exam"
  | "achievement"
  | "course_completed"
  | "login";

export interface ActivityItem {
  id: string;
  type: ActivityType | string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UserActivityTabProps {
  userId: string;
}