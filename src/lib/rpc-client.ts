import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { CourseService } from "@/gen/thanawy/v1/course_pb";
import { AuthService } from "@/gen/thanawy/v1/auth_pb";
import { AnalyticsService } from "@/gen/thanawy/v1/analytics_pb";
import { cache } from "react";
import { getRuntimeApiBaseUrl } from "@/lib/api/config";

const isBrowser = typeof window !== 'undefined';
const baseUrl = getRuntimeApiBaseUrl();

const transport = createConnectTransport({
  baseUrl,
  // ConnectRPC uses POST for reads and mutations. Never apply implicit Next.js
  // caching here; callers may explicitly cache known read-only operations.
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      cache: "no-store",
    });
  }
});

export const courseClient = createClient(CourseService, transport);
export const authClient = createClient(AuthService, transport);
export const analyticsClient = createClient(AnalyticsService, transport);

// React cache deduplicates identical calls during one server render without
// cross-user persistence or fragile JSON serialization.
export const cachedGetCourse = cache(
  async (req: Parameters<typeof courseClient.getCourse>[0]) => await courseClient.getCourse(req!),
);

export const cachedGetCourses = cache(
  async (req: Parameters<typeof courseClient.getCourses>[0]) => await courseClient.getCourses(req!),
);

// Legacy export for backward compatibility if needed
export const rpcClient = {
  ...courseClient,
  getCourse: isBrowser ? courseClient.getCourse : cachedGetCourse,
  getCourses: isBrowser ? courseClient.getCourses : cachedGetCourses,
};
