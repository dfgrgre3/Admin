/**
 * Unit tests for the educational course-management API client (@/lib/api/course-api).
 *
 * These cover the two pieces of logic that *actually do work* on the client:
 *
 *  1. `prepareCoursePayload` — the unexported payload normalizer that converts
 *     array-valued `targetAudience` / `prerequisitesText` (and their snake_case
 *     aliases) into the newline-joined strings the upstream Go service expects.
 *  2. Each `courseApi` method routing: correct HTTP verb + path + body.
 *
 * The upstream `apiClient` is mocked so we isolate the client-library logic
 * from network/CSRF/auth machinery.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { courseApi } from "@/lib/api/course-api";

// Mock the whole api-client module so course-api.ts uses test doubles.
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/api/api-client", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

/** Returns the Nth argument of a mock's first call, failing loudly if it was never called. */
function argOf(mock: ReturnType<typeof vi.fn>, argIndex: number, callIndex = 0): unknown {
  const call = mock.mock.calls[callIndex];
  if (!call) throw new Error(`expected mock to have been called at least ${callIndex + 1} time(s)`);
  return call[argIndex];
}

const urlOf = (mock: ReturnType<typeof vi.fn>, callIndex = 0) =>
  argOf(mock, 0, callIndex) as string;

const bodyOf = (mock: ReturnType<typeof vi.fn>, callIndex = 0) =>
  argOf(mock, 1, callIndex) as Record<string, unknown>;

describe("courseApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: resolve with an empty envelope body.
    mockGet.mockResolvedValue({ ok: true } as unknown as Response);
    mockPost.mockResolvedValue({ ok: true } as unknown as Response);
    mockPatch.mockResolvedValue({ ok: true } as unknown as Response);
    mockDelete.mockResolvedValue({ ok: true } as unknown as Response);
  });

  describe("listCourses — query parameter building", () => {
    it("builds a query string from all supported filters", async () => {
      await courseApi.listCourses({
        status: "PUBLISHED",
        level: "BEGINNER",
        language: "ar",
        categoryId: "cat-1",
        instructorId: "inst-1",
        isFeatured: true,
        isTrending: false,
        isNew: true,
        search: "calculus",
        page: 2,
        limit: 10,
      });

      const calledUrl = urlOf(mockGet);
      const params = new URLSearchParams(calledUrl.split("?")[1]);

      expect(calledUrl.startsWith("/api/admin/courses?")).toBe(true);
      expect(params.get("status")).toBe("PUBLISHED");
      expect(params.get("level")).toBe("BEGINNER");
      expect(params.get("language")).toBe("ar");
      expect(params.get("categoryId")).toBe("cat-1");
      expect(params.get("instructorId")).toBe("inst-1");
      expect(params.get("isFeatured")).toBe("true");
      expect(params.get("isTrending")).toBe("false");
      expect(params.get("isNew")).toBe("true");
      expect(params.get("search")).toBe("calculus");
      expect(params.get("page")).toBe("2");
      expect(params.get("limit")).toBe("10");
    });

    it("omits optional filters that are not provided", async () => {
      await courseApi.listCourses();
      const calledUrl = urlOf(mockGet);
      // No filters => no query string content beyond the path
      expect(calledUrl).toBe("/api/admin/courses?");
    });

    it("passes pagination defaults through unchanged", async () => {
      await courseApi.listCourses({ page: 5, limit: 25 });
      const calledUrl = urlOf(mockGet);
      const params = new URLSearchParams(calledUrl.split("?")[1]);
      expect(params.get("page")).toBe("5");
      expect(params.get("limit")).toBe("25");
    });

    it("propagates the resolved value from the client", async () => {
      mockGet.mockResolvedValue({
        courses: [{ id: "c1", title: "Math" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      const result = await courseApi.listCourses();
      expect(result).toEqual({
        courses: [{ id: "c1", title: "Math" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    });
  });

  describe("CRUD routing", () => {
    it("getCourse calls GET /api/admin/courses/:id", async () => {
      await courseApi.getCourse("course-123");
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(urlOf(mockGet)).toBe("/api/admin/courses/course-123");
    });

    it("deleteCourse calls DELETE /api/admin/courses/:id", async () => {
      await courseApi.deleteCourse("course-123");
      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(urlOf(mockDelete)).toBe("/api/admin/courses/course-123");
    });
  });

  describe("prepareCoursePayload — targetAudience / prerequisitesText normalization", () => {
    it("joins a camelCase targetAudience array into a newline string on both keys", async () => {
      const payload = {
        title: "Math",
        slug: "math",
        level: "BEGINNER" as const,
        language: "ar",
        primaryInstructorId: "inst-1",
        targetAudience: ["Student A", "Student B"],
      };

      await courseApi.createCourse(payload);

      const sent = bodyOf(mockPost);
      expect(sent.targetAudience).toBe("Student A\nStudent B");
      expect(sent.target_audience).toBe("Student A\nStudent B");
      expect(urlOf(mockPost)).toBe("/api/admin/courses");
    });

    it("joins a snake_case target_audience array into a newline string on both keys", async () => {
      const payload = {
        title: "Math",
        slug: "math",
        level: "BEGINNER" as const,
        language: "ar",
        primaryInstructorId: "inst-1",
        target_audience: ["Student A", "", "Student B"],
      };

      await courseApi.createCourse(payload);

      const sent = bodyOf(mockPost);
      // falsy entries are filtered out before joining
      expect(sent.targetAudience).toBe("Student A\nStudent B");
      expect(sent.target_audience).toBe("Student A\nStudent B");
    });

    it("joins prerequisitesText arrays (camelCase) into a newline string on both keys", async () => {
      const payload = {
        title: "Math",
        slug: "math",
        level: "BEGINNER" as const,
        language: "ar",
        primaryInstructorId: "inst-1",
        prerequisitesText: ["Algebra I", "Basic fractions"],
      };

      await courseApi.createCourse(payload);

      const sent = bodyOf(mockPost);
      expect(sent.prerequisitesText).toBe("Algebra I\nBasic fractions");
      expect(sent.prerequisites_text).toBe("Algebra I\nBasic fractions");
    });

    it("joins prerequisites_text arrays (snake_case) into a newline string on both keys", async () => {
      const payload = {
        title: "Math",
        slug: "math",
        level: "BEGINNER" as const,
        language: "ar",
        primaryInstructorId: "inst-1",
        prerequisites_text: ["Algebra I", "Basic fractions"],
      };

      await courseApi.updateCourse("course-1", payload);

      const sent = bodyOf(mockPatch);
      expect(sent.prerequisitesText).toBe("Algebra I\nBasic fractions");
      expect(sent.prerequisites_text).toBe("Algebra I\nBasic fractions");
      expect(urlOf(mockPatch)).toBe("/api/admin/courses/course-1");
    });

    it("passes through string targetAudience unchanged while still adding the alias", async () => {
      const payload = {
        title: "Math",
        slug: "math",
        level: "BEGINNER" as const,
        language: "ar",
        primaryInstructorId: "inst-1",
        targetAudience: "Single string audience",
      };

      await courseApi.createCourse(payload);

      const sent = bodyOf(mockPost);
      expect(sent.targetAudience).toBe("Single string audience");
      expect(sent.target_audience).toBe("Single string audience");
    });

    it("leaves payloads without audience/prereqs untouched (apart from the spread copy)", async () => {
      const payload = {
        title: "Math",
        slug: "math",
        level: "BEGINNER" as const,
        language: "ar",
        primaryInstructorId: "inst-1",
      };

      await courseApi.createCourse(payload);

      const sent = bodyOf(mockPost);
      expect(sent.targetAudience).toBeUndefined();
      expect(sent.target_audience).toBeUndefined();
      expect(sent.prerequisitesText).toBeUndefined();
      expect(sent.prerequisites_text).toBeUndefined();
    });
  });

  describe("course lifecycle workflow routing", () => {
    it("submitForReview posts an empty body", async () => {
      await courseApi.submitForReview("course-1");
      expect(mockPost).toHaveBeenCalledWith("/api/admin/courses/course-1/submit-review", {});
    });

    it("approveCourse sends reviewerId + notes", async () => {
      await courseApi.approveCourse("course-1", "reviewer-9", "looks good");
      expect(urlOf(mockPost)).toBe("/api/admin/courses/course-1/approve");
      expect(bodyOf(mockPost)).toEqual({
        reviewerId: "reviewer-9",
        notes: "looks good",
      });
    });

    it("approveCourse omits notes when not provided", async () => {
      await courseApi.approveCourse("course-1", "reviewer-9");
      expect(bodyOf(mockPost)).toEqual({
        reviewerId: "reviewer-9",
        notes: undefined,
      });
    });

    it("rejectCourse sends reviewerId + reason", async () => {
      await courseApi.rejectCourse("course-1", "reviewer-9", "duplicate content");
      expect(urlOf(mockPost)).toBe("/api/admin/courses/course-1/reject");
      expect(bodyOf(mockPost)).toEqual({
        reviewerId: "reviewer-9",
        reason: "duplicate content",
      });
    });

    it("archiveCourse / unarchiveCourse post to their respective endpoints", async () => {
      await courseApi.archiveCourse("course-1");
      await courseApi.unarchiveCourse("course-1");
      expect(mockPost).toHaveBeenNthCalledWith(1, "/api/admin/courses/course-1/archive", {});
      expect(mockPost).toHaveBeenNthCalledWith(2, "/api/admin/courses/course-1/unarchive", {});
    });
  });

  describe("section management routing", () => {
    it("listSections GETs the sections collection", async () => {
      await courseApi.listSections("course-1");
      expect(mockGet).toHaveBeenCalledWith("/api/admin/courses/course-1/sections");
    });

    it("createSection POSTs the data to the sections collection", async () => {
      const data = { title: "Chapter 1", orderIndex: 0 };
      await courseApi.createSection("course-1", data);
      expect(mockPost).toHaveBeenCalledWith("/api/admin/courses/course-1/sections", data);
    });

    it("updateSection PATCHes a specific section", async () => {
      await courseApi.updateSection("course-1", "section-2", { title: "Updated" });
      expect(mockPatch).toHaveBeenCalledWith(
        "/api/admin/courses/course-1/sections/section-2",
        { title: "Updated" },
      );
    });

    it("deleteSection DELETEs a specific section", async () => {
      await courseApi.deleteSection("course-1", "section-2");
      expect(mockDelete).toHaveBeenCalledWith("/api/admin/courses/course-1/sections/section-2");
    });

    it("reorderSections POSTs an ordered id list", async () => {
      await courseApi.reorderSections("course-1", ["s3", "s1", "s2"]);
      expect(mockPost).toHaveBeenCalledWith(
        "/api/admin/courses/course-1/sections/reorder",
        { sectionIds: ["s3", "s1", "s2"] },
      );
    });
  });

  describe("lesson management routing", () => {
    it("listLessons GETs lessons for a section", async () => {
      await courseApi.listLessons("course-1", "section-2");
      expect(mockGet).toHaveBeenCalledWith("/api/admin/courses/course-1/sections/section-2/lessons");
    });

    it("createLesson POSTs lesson data to the lessons collection", async () => {
      const data = { title: "Intro", type: "VIDEO" as const };
      await courseApi.createLesson("course-1", "section-2", data);
      expect(mockPost).toHaveBeenCalledWith(
        "/api/admin/courses/course-1/sections/section-2/lessons",
        data,
      );
    });

    it("updateLesson PATCHes a specific lesson", async () => {
      await courseApi.updateLesson("course-1", "section-2", "lesson-3", { title: "Renamed" });
      expect(mockPatch).toHaveBeenCalledWith(
        "/api/admin/courses/course-1/sections/section-2/lessons/lesson-3",
        { title: "Renamed" },
      );
    });

    it("deleteLesson DELETEs a specific lesson", async () => {
      await courseApi.deleteLesson("course-1", "section-2", "lesson-3");
      expect(mockDelete).toHaveBeenCalledWith(
        "/api/admin/courses/course-1/sections/section-2/lessons/lesson-3",
      );
    });

    it("reorderLessons POSTs an ordered id list", async () => {
      await courseApi.reorderLessons("course-1", "section-2", ["l3", "l1", "l2"]);
      expect(mockPost).toHaveBeenCalledWith(
        "/api/admin/courses/course-1/sections/section-2/lessons/reorder",
        { lessonIds: ["l3", "l1", "l2"] },
      );
    });
  });

  describe("enrollment management routing", () => {
    it("enrollUser POSTs courseId + userId", async () => {
      await courseApi.enrollUser("course-1", "user-9");
      expect(mockPost).toHaveBeenCalledWith(
        "/api/admin/courses/course-1/enrollments",
        { courseId: "course-1", userId: "user-9" },
      );
    });

    it("getEnrollment GETs a user enrollment", async () => {
      await courseApi.getEnrollment("course-1", "user-9");
      expect(mockGet).toHaveBeenCalledWith("/api/admin/courses/course-1/enrollments/user-9");
    });

    it("updateProgress PATCHes progress for an enrollment", async () => {
      await courseApi.updateProgress("course-1", "user-9", 45);
      expect(mockPatch).toHaveBeenCalledWith(
        "/api/admin/courses/course-1/enrollments/user-9",
        { progress: 45 },
      );
    });

    it("listEnrollments builds query params when filters are provided", async () => {
      await courseApi.listEnrollments("course-1", { userId: "user-9", page: 1, limit: 20 });
      const calledUrl = urlOf(mockGet);
      expect(calledUrl.startsWith("/api/admin/courses/course-1/enrollments")).toBe(true);
      const params = new URLSearchParams(calledUrl.split("?")[1]);
      expect(params.get("userId")).toBe("user-9");
      expect(params.get("page")).toBe("1");
      expect(params.get("limit")).toBe("20");
    });
  });

  describe("pricing management routing", () => {
    it("getPricing GETs the pricing endpoint", async () => {
      await courseApi.getPricing("course-1");
      expect(mockGet).toHaveBeenCalledWith("/api/admin/courses/course-1/pricing");
    });

    it("setPricing POSTs pricing data", async () => {
      const data = {
        type: "ONE_TIME" as const,
        amount: 199,
        currencyCode: "SAR",
      };
      await courseApi.setPricing("course-1", data);
      expect(mockPost).toHaveBeenCalledWith("/api/admin/courses/course-1/pricing", data);
    });
  });
});
