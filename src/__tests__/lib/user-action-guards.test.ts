import { getUserActionBlockReason } from "@/lib/user-action-guards";

describe("getUserActionBlockReason", () => {
  it("blocks actions against the current account", () => {
    expect(getUserActionBlockReason(
      { id: "same", role: "ADMIN" },
      { id: "same", role: "ADMIN" },
      "delete",
    )).toContain("حسابك الحالي");
  });

  it("blocks actors from managing a higher role", () => {
    expect(getUserActionBlockReason(
      { id: "moderator", role: "MODERATOR" },
      { id: "admin", role: "ADMIN" },
      "suspend",
    )).toContain("أعلى منك صلاحية");
  });

  it("allows actors to manage a lower role", () => {
    expect(getUserActionBlockReason(
      { id: "admin", role: "ADMIN" },
      { id: "student", role: "STUDENT" },
      "suspend",
    )).toBeNull();
  });

  it("fails closed for unknown target roles", () => {
    expect(getUserActionBlockReason(
      { id: "admin", role: "ADMIN" },
      { id: "unknown", role: "FUTURE_PRIVILEGED_ROLE" },
      "impersonate",
    )).not.toBeNull();
  });
});
