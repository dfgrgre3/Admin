import { describe, it, expect } from "vitest";
import {
  createCourseSchema,
  updateCourseSchema,
  courseListFiltersSchema,
  sectionInputSchema,
  sectionUpdateSchema,
  lessonInputSchema,
  lessonUpdateSchema,
  reorderSectionsSchema,
  reorderLessonsSchema,
  enrollmentUpdateSchema,
  pricingInputSchema,
} from "@/lib/validations/course-validations";

describe("course-validations", () => {
  describe("createCourseSchema", () => {
    const validCore = {
      title: "Calculus I",
      slug: "calculus-i",
      level: "BEGINNER" as const,
      language: "ar",
      primaryInstructorId: "inst-1",
    };

    it("accepts a minimal valid payload", () => {
      expect(createCourseSchema.safeParse(validCore).success).toBe(true);
    });

    it("accepts a fully-populated payload", () => {
      const full = {
        ...validCore,
        shortDescription: "An intro course",
        longDescription: "Detailed description".padEnd(250),
        coverImageUrl: "https://example.com/cover.jpg",
        promoVideoUrl: "https://example.com/promo.mp4",
        estimatedDurationMins: 1200,
        hasCertificate: true,
        certificateTemplate: "cert-template",
        maxStudents: 500,
        isFeatured: true,
        isTrending: false,
        isNew: true,
        seoTitle: "SEO title",
        seoDescription: "SEO description within limit",
        seoKeywords: ["math", "calculus"],
        prerequisitesText: "Algebra I",
        targetAudience: "High school students",
        learningOutcomes: ["Learn limits", "Learn derivatives"],
        categoryIds: ["1c9f7a3e-2b4d-4c8a-9f1e-5d6b7a8c9d0e"],
      };
      expect(createCourseSchema.safeParse(full).success).toBe(true);
    });

    it("rejects a missing title", () => {
      const { success, error } = createCourseSchema.safeParse({
        ...validCore,
        title: "",
      });
      expect(success).toBe(false);
      expect(error?.issues.some((i) => i.path[0] === "title")).toBe(true);
    });

    it("rejects a slug with disallowed characters", () => {
      const { success, error } = createCourseSchema.safeParse({
        ...validCore,
        slug: "Calculus I",
      });
      expect(success).toBe(false);
      expect(error?.issues.some((i) => i.path[0] === "slug")).toBe(true);
    });

    it("rejects an invalid level", () => {
      const { success, error } = createCourseSchema.safeParse({
        ...validCore,
        level: "EXPERT",
      });
      expect(success).toBe(false);
      expect(error?.issues.some((i) => i.path[0] === "level")).toBe(true);
    });

    it("rejects a language shorter than 2 chars", () => {
      const { success } = createCourseSchema.safeParse({
        ...validCore,
        language: "a",
      });
      expect(success).toBe(false);
    });

    it("rejects a missing primaryInstructorId", () => {
      const { success, error } = createCourseSchema.safeParse({
        ...validCore,
        primaryInstructorId: "",
      });
      expect(success).toBe(false);
      expect(error?.issues.some((i) => i.path[0] === "primaryInstructorId")).toBe(true);
    });

    it("rejects too many seoKeywords", () => {
      const { success } = createCourseSchema.safeParse({
        ...validCore,
        seoKeywords: Array.from({ length: 51 }, (_, i) => `k${i}`),
      });
      expect(success).toBe(false);
    });
  });

  describe("updateCourseSchema", () => {
    it("accepts a partial update", () => {
      expect(updateCourseSchema.safeParse({ isFeatured: true }).success).toBe(true);
    });

    it("rejects an invalid slug", () => {
      const { success } = updateCourseSchema.safeParse({ slug: "Bad Slug!" });
      expect(success).toBe(false);
    });

    it("rejects a negative estimatedDurationMins", () => {
      const { success } = updateCourseSchema.safeParse({ estimatedDurationMins: -10 });
      expect(success).toBe(false);
    });

    it("rejects a non-uuid primaryInstructorId", () => {
      const { success } = updateCourseSchema.safeParse({ primaryInstructorId: "not-a-uuid" });
      expect(success).toBe(false);
    });
  });

  describe("courseListFiltersSchema", () => {
    it("accepts a fully-specified filter set", () => {
      const ok = courseListFiltersSchema.safeParse({
        status: "PUBLISHED",
        level: "ADVANCED",
        language: "en",
        categoryId: "c-1",
        instructorId: "i-1",
        isFeatured: true,
        isTrending: false,
        isNew: true,
        search: "limits",
        page: 1,
        limit: 12,
        sort: "popular",
      });
      expect(ok.success).toBe(true);
    });

    it("accepts an empty filter object", () => {
      expect(courseListFiltersSchema.safeParse({}).success).toBe(true);
    });

    it("rejects an out-of-range page", () => {
      expect(courseListFiltersSchema.safeParse({ page: 0 }).success).toBe(false);
    });

    it("rejects a limit exceeding the maximum", () => {
      expect(courseListFiltersSchema.safeParse({ limit: 201 }).success).toBe(false);
      expect(courseListFiltersSchema.safeParse({ limit: 200 }).success).toBe(true);
    });

    it("rejects an unsupported sort value", () => {
      expect(courseListFiltersSchema.safeParse({ sort: "relevance" }).success).toBe(false);
    });
  });

  describe("section schemas", () => {
    it("sectionInputSchema accepts a valid section", () => {
      expect(
        sectionInputSchema.safeParse({ title: "Chapter 1", orderIndex: 0 }).success,
      ).toBe(true);
    });

    it("sectionInputSchema rejects an empty title", () => {
      expect(sectionInputSchema.safeParse({ title: "" }).success).toBe(false);
    });

    it("sectionInputSchema rejects negative durations", () => {
      expect(sectionInputSchema.safeParse({ title: "x", availableFrom: -1 }).success).toBe(
        false,
      );
      expect(sectionInputSchema.safeParse({ title: "x", dripDelayDays: -5 }).success).toBe(
        false,
      );
    });

    it("sectionUpdateSchema accepts a partial update", () => {
      expect(sectionUpdateSchema.safeParse({ title: "Renamed" }).success).toBe(true);
      expect(sectionUpdateSchema.safeParse({}).success).toBe(true);
    });

    it("reorderSectionsSchema requires at least one sectionId", () => {
      expect(reorderSectionsSchema.safeParse({ sectionIds: [] }).success).toBe(false);
      expect(
        reorderSectionsSchema.safeParse({
          sectionIds: ["8f3b1c2d-4e5a-4b6c-8d9e-0a1b2c3d4e5f"],
        }).success,
      ).toBe(true);
    });
  });

  describe("lesson schemas", () => {
    const validLesson = {
      title: "Introduction",
      type: "VIDEO" as const,
      durationSeconds: 360,
      orderIndex: 0,
      isFreePreview: true,
      availabilityType: "ENROLLMENT_RELATIVE" as const,
      dripDelayDays: 1,
    };

    it("lessonInputSchema accepts a valid lesson", () => {
      expect(lessonInputSchema.safeParse(validLesson).success).toBe(true);
    });

    it("lessonInputSchema rejects an invalid type", () => {
      expect(
        lessonInputSchema.safeParse({ ...validLesson, type: "PDF" }).success,
      ).toBe(false);
    });

    it("lessonInputSchema rejects a negative duration", () => {
      expect(
        lessonInputSchema.safeParse({ ...validLesson, durationSeconds: -1 }).success,
      ).toBe(false);
    });

    it("lessonUpdateSchema accepts a partial update", () => {
      expect(lessonUpdateSchema.safeParse({ title: "Updated" }).success).toBe(true);
      expect(lessonUpdateSchema.safeParse({ durationSeconds: 120 }).success).toBe(true);
    });

    it("reorderLessonsSchema requires at least one lessonId", () => {
      expect(reorderLessonsSchema.safeParse({ lessonIds: [] }).success).toBe(false);
      expect(
        reorderLessonsSchema.safeParse({
          lessonIds: ["8f3b1c2d-4e5a-4b6c-8d9e-0a1b2c3d4e5f"],
        }).success,
      ).toBe(true);
    });
  });

  describe("enrollment schema", () => {
    it("accepts progress within bounds", () => {
      expect(enrollmentUpdateSchema.safeParse({ progress: 0 }).success).toBe(true);
      expect(enrollmentUpdateSchema.safeParse({ progress: 100 }).success).toBe(true);
      expect(enrollmentUpdateSchema.safeParse({ progress: 57 }).success).toBe(true);
    });

    it("rejects progress out of [0, 100]", () => {
      expect(enrollmentUpdateSchema.safeParse({ progress: -1 }).success).toBe(false);
      expect(enrollmentUpdateSchema.safeParse({ progress: 101 }).success).toBe(false);
    });
  });

  describe("pricing schema", () => {
    it("accepts a FREE pricing", () => {
      expect(
        pricingInputSchema.safeParse({
          type: "FREE",
          amount: 0,
          currencyCode: "SAR",
        }).success,
      ).toBe(true);
    });

    it("accepts a ONE_TIME pricing with a discount window", () => {
      expect(
        pricingInputSchema.safeParse({
          type: "ONE_TIME",
          amount: 199,
          currencyCode: "SAR",
          discountPrice: 149,
          discountStartAt: 1000,
          discountEndAt: 2000,
        }).success,
      ).toBe(true);
    });

    it("rejects a negative amount", () => {
      expect(
        pricingInputSchema.safeParse({ type: "ONE_TIME", amount: -5, currencyCode: "SAR" })
          .success,
      ).toBe(false);
    });

    it("rejects a malformed currency code", () => {
      expect(
        pricingInputSchema.safeParse({ type: "FREE", amount: 0, currencyCode: "usd" })
          .success,
      ).toBe(false);
      expect(
        pricingInputSchema.safeParse({ type: "FREE", amount: 0, currencyCode: "US" })
          .success,
      ).toBe(false);
    });

    it("rejects a discount price >= amount", () => {
      expect(
        pricingInputSchema.safeParse({
          type: "ONE_TIME",
          amount: 199,
          currencyCode: "SAR",
          discountPrice: 199,
        }).success,
      ).toBe(false);
    });

    it("rejects a discount window where start > end", () => {
      expect(
        pricingInputSchema.safeParse({
          type: "ONE_TIME",
          amount: 199,
          currencyCode: "SAR",
          discountStartAt: 2000,
          discountEndAt: 1000,
        }).success,
      ).toBe(false);
    });

    it("requires subscriptionDurationDays >= 1 for subscription pricing context", () => {
      expect(
        pricingInputSchema.safeParse({
          type: "SUBSCRIPTION",
          amount: 99,
          currencyCode: "SAR",
          subscriptionDurationDays: 0,
        }).success,
      ).toBe(false);
    });
  });
});
