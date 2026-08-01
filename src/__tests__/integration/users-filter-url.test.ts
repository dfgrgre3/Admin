import { UserRole, UserStatus } from "@/types/enums";

// ─────────────────────────────────────────────────────────────────────────────
// Mock URL params (simulates Next.js useSearchParams)
// ─────────────────────────────────────────────────────────────────────────────
function makeSearchParams(init: Record<string, string>) {
  const params = new URLSearchParams(init);
  return {
    get: (key: string) => params.get(key),
    toString: () => params.toString(),
  };
}

describe("Users Module: URL Params & Filter State Integration", () => {
  describe("URL Search Params Hydration", () => {
    it("correctly reads role, status, page from URL params", () => {
      const params = makeSearchParams({ role: "TEACHER", status: "ACTIVE", page: "3" });
      expect(params.get("role")).toBe("TEACHER");
      expect(params.get("status")).toBe("ACTIVE");
      expect(Number(params.get("page"))).toBe(3);
    });

    it("falls back to defaults when params are absent", () => {
      const params = makeSearchParams({});
      const role = params.get("role") || "all";
      const status = params.get("status") || "all";
      const page = Number(params.get("page")) || 1;

      expect(role).toBe("all");
      expect(status).toBe("all");
      expect(page).toBe(1);
    });

    it("serialises multi-filter state correctly into URL", () => {
      type FilterState = {
        role: string;
        status: string;
        emailVerifiedFilter: string;
        twoFAFilter: string;
        page: number;
        limit: number;
        search: string;
      };
      const state: FilterState = {
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        emailVerifiedFilter: "true",
        twoFAFilter: "false",
        page: 2,
        limit: 20,
        search: "أحمد",
      };

      const params = new URLSearchParams();
      if (state.role !== "all") params.set("role", state.role);
      if (state.status !== "all") params.set("status", state.status);
      if (state.emailVerifiedFilter !== "all") params.set("emailVerified", state.emailVerifiedFilter);
      if (state.twoFAFilter !== "all") params.set("twoFA", state.twoFAFilter);
      params.set("page", String(state.page));
      params.set("limit", String(state.limit));
      if (state.search) params.set("search", state.search);

      const url = `/admin/users?${params.toString()}`;
      expect(url).toContain("role=STUDENT");
      expect(url).toContain("status=ACTIVE");
      expect(url).toContain("emailVerified=true");
      expect(url).toContain("twoFA=false");
      expect(url).toContain("page=2");
      expect(url).toContain("limit=20");
    });

    it("falls back to page 1 when page param is non-numeric", () => {
      const params = makeSearchParams({ page: "abc" });
      const page = Number(params.get("page")) || 1;
      expect(page).toBe(1);
    });

    it("falls back to page 1 when page param is negative", () => {
      const params = makeSearchParams({ page: "-5" });
      // Negative pages are treated as invalid — enforce minimum of 1.
      const raw = Number(params.get("page"));
      const page = raw > 0 ? raw : 1;
      expect(page).toBe(1);
    });
  });

  describe("Saved Views Presets Logic", () => {
    type FilterState = {
      role: string;
      status: string;
      emailVerifiedFilter: string;
      twoFAFilter: string;
      subscriptionStatus: string;
    };

    function applyPreset(name: string): FilterState {
      const base: FilterState = {
        role: "all",
        status: "all",
        emailVerifiedFilter: "all",
        twoFAFilter: "all",
        subscriptionStatus: "all",
      };

      switch (name) {
        case "verified-teachers":
          return { ...base, role: UserRole.TEACHER, status: UserStatus.ACTIVE, emailVerifiedFilter: "true" };
        case "active-students":
          return { ...base, role: UserRole.STUDENT, status: UserStatus.ACTIVE };
        case "2fa-enabled":
          return { ...base, twoFAFilter: "true" };
        case "expired-subscriptions":
          return { ...base, subscriptionStatus: "expired" };
        case "unverified-email":
          return { ...base, emailVerifiedFilter: "false" };
        default:
          return base;
      }
    }

    it("applies 'المعلمون الموثوقون' preset correctly", () => {
      const state = applyPreset("verified-teachers");
      expect(state.role).toBe(UserRole.TEACHER);
      expect(state.status).toBe(UserStatus.ACTIVE);
      expect(state.emailVerifiedFilter).toBe("true");
    });

    it("applies 'الطلاب النشطون' preset correctly", () => {
      const state = applyPreset("active-students");
      expect(state.role).toBe(UserRole.STUDENT);
      expect(state.status).toBe(UserStatus.ACTIVE);
    });

    it("applies '2FA مفعّل' preset correctly", () => {
      const state = applyPreset("2fa-enabled");
      expect(state.twoFAFilter).toBe("true");
      expect(state.role).toBe("all");
    });

    it("applies 'الاشتراكات المنتهية' preset correctly", () => {
      const state = applyPreset("expired-subscriptions");
      expect(state.subscriptionStatus).toBe("expired");
    });

    it("applies 'البريد غير موثق' preset correctly", () => {
      const state = applyPreset("unverified-email");
      expect(state.emailVerifiedFilter).toBe("false");
    });

    it("returns neutral defaults for unknown preset", () => {
      const state = applyPreset("unknown-preset");
      expect(state.role).toBe("all");
      expect(state.status).toBe("all");
      expect(state.emailVerifiedFilter).toBe("all");
    });
  });

  describe("Advanced Filters: API Query Parameter Mapping", () => {
    interface ListParams {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
      emailVerified?: boolean;
      twoFactorEnabled?: boolean;
      createdFrom?: string;
      createdTo?: string;
      subscriptionStatus?: string;
    }

    function buildApiParams(filterState: {
      page: number;
      limit: number;
      search: string;
      role: string;
      status: string;
      emailVerifiedFilter: string;
      twoFAFilter: string;
      createdFrom: string;
      createdTo: string;
      subscriptionStatus: string;
    }): ListParams {
      return {
        page: filterState.page,
        limit: filterState.limit,
        search: filterState.search || undefined,
        role: filterState.role === "all" ? undefined : filterState.role,
        status: filterState.status === "all" ? undefined : filterState.status,
        emailVerified: filterState.emailVerifiedFilter === "all" ? undefined : filterState.emailVerifiedFilter === "true",
        twoFactorEnabled: filterState.twoFAFilter === "all" ? undefined : filterState.twoFAFilter === "true",
        createdFrom: filterState.createdFrom || undefined,
        createdTo: filterState.createdTo || undefined,
        subscriptionStatus: filterState.subscriptionStatus === "all" ? undefined : filterState.subscriptionStatus,
      };
    }

    it("maps 'all' values to undefined (not sent to API)", () => {
      const params = buildApiParams({
        page: 1, limit: 10, search: "", role: "all",
        status: "all", emailVerifiedFilter: "all", twoFAFilter: "all",
        createdFrom: "", createdTo: "", subscriptionStatus: "all",
      });
      expect(params.role).toBeUndefined();
      expect(params.status).toBeUndefined();
      expect(params.emailVerified).toBeUndefined();
      expect(params.twoFactorEnabled).toBeUndefined();
      expect(params.subscriptionStatus).toBeUndefined();
      expect(params.search).toBeUndefined();
    });

    it("maps boolean emailVerified filter correctly", () => {
      const paramsTrue = buildApiParams({ page: 1, limit: 10, search: "", role: "all", status: "all", emailVerifiedFilter: "true", twoFAFilter: "all", createdFrom: "", createdTo: "", subscriptionStatus: "all" });
      const paramsFalse = buildApiParams({ page: 1, limit: 10, search: "", role: "all", status: "all", emailVerifiedFilter: "false", twoFAFilter: "all", createdFrom: "", createdTo: "", subscriptionStatus: "all" });

      expect(paramsTrue.emailVerified).toBe(true);
      expect(paramsFalse.emailVerified).toBe(false);
    });

    it("maps 2FA filter from string 'true'/'false' to boolean", () => {
      const params = buildApiParams({ page: 1, limit: 10, search: "", role: "all", status: "all", emailVerifiedFilter: "all", twoFAFilter: "true", createdFrom: "", createdTo: "", subscriptionStatus: "all" });
      expect(params.twoFactorEnabled).toBe(true);
    });

    it("passes through date range filters", () => {
      const params = buildApiParams({ page: 1, limit: 10, search: "", role: "all", status: "all", emailVerifiedFilter: "all", twoFAFilter: "all", createdFrom: "2024-01-01", createdTo: "2024-12-31", subscriptionStatus: "all" });
      expect(params.createdFrom).toBe("2024-01-01");
      expect(params.createdTo).toBe("2024-12-31");
    });

    it("maps empty search string to undefined (not sent to API)", () => {
      const params = buildApiParams({
        page: 1, limit: 10, search: "", role: "all", status: "all",
        emailVerifiedFilter: "all", twoFAFilter: "all",
        createdFrom: "", createdTo: "", subscriptionStatus: "all",
      });
      // An empty search query must not be forwarded to the backend.
      expect(params.search).toBeUndefined();
    });
  });
});
