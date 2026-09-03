export interface ArchivedCourseRow {
  id: string;
  title: string;
  slug?: string | null;
  thumbnailUrl?: string | null;
  description?: string | null;
  status: string;
  level?: string | null;
  language?: string | null;
  version?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ArchivedCoursesResponse {
  items: ArchivedCourseRow[];
  total: number;
  totalPages: number;
}
