import { describe, expect, it } from "vitest";
import { buildAudienceSummary, getNotificationTemplates, resolveNotificationTargets, validateNotificationDraft } from "@/lib/notifications/notification-draft";

describe("validateNotificationDraft", () => {
  it("marks empty drafts as invalid and explains missing fields", () => {
    const result = validateNotificationDraft({ title: "", body: "", channels: [] }, "أحد المستخدمين");

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining("عنوان")]))
    expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining("نص")]))
    expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining("قناة")]))
  });

  it("returns preview details for a valid draft", () => {
    const result = validateNotificationDraft({
      title: "إعلان جديد",
      body: "مرحباً بكم في المنصة",
      channels: ["IN_APP", "PUSH"],
    }, "10 مستخدمين");

    expect(result.isValid).toBe(true);
    expect(result.preview.summary).toContain("10 مستخدمين");
    expect(result.preview.channels).toContain("داخل التطبيق");
    expect(result.preview.channels).toContain("Push");
  });

  it("returns ready-made templates for quick messaging", () => {
    const templates = getNotificationTemplates();

    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]?.title).toBeTruthy();
    expect(templates[0]?.body).toBeTruthy();
  });

  it("builds a readable summary for role-based audiences", () => {
    const summary = buildAudienceSummary("roles", ["STUDENT", "TEACHER"]);

    expect(summary).toContain("الطلاب");
    expect(summary).toContain("المعلمون");
  });

  it("filters recipients to the selected roles", () => {
    const ids = resolveNotificationTargets(
      ["u1", "u2", "u3"],
      [
        { id: "u1", role: "STUDENT" },
        { id: "u2", role: "TEACHER" },
        { id: "u3", role: "STUDENT" },
      ],
      "roles",
      ["STUDENT"],
    );

    expect(ids).toEqual(["u1", "u3"]);
  });
});
