import * as React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDashboardOperations } from "@/hooks/dashboard/use-dashboard-operations";
import { PERMISSIONS } from "@/lib/permissions";
import { adminApi } from "@/lib/api/admin-api";

vi.mock("@/lib/api/admin-api", () => ({
  adminApi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const authMock = vi.hoisted(() => ({ user: null as unknown }));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => authMock,
}));

/** Builds an admin whose grants are exactly the supplied permissions. */
function adminWith(...permissions: string[]) {
  return { id: "admin-1", role: "ADMIN", permissions };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockedGet = vi.mocked(adminApi.get);
const mockedPost = vi.mocked(adminApi.post);

beforeEach(() => {
  vi.clearAllMocks();
  authMock.user = null;
});

describe("useDashboardOperations — permission gating", () => {
  it("issues no requests for an admin with no dashboard permissions", async () => {
    authMock.user = adminWith();

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    expect(result.current.canViewAlerts).toBe(false);
    expect(result.current.canViewPending).toBe(false);
    expect(result.current.canViewHealth).toBe(false);
    // The backend enforces this too, but the client must not even ask.
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("requests only the slice the admin is permitted to see", async () => {
    authMock.user = adminWith(PERMISSIONS.DASHBOARD_VIEW_ALERTS);
    mockedGet.mockResolvedValue({ items: [], totalCount: 0 });

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    const requested = mockedGet.mock.calls.map((call) => call[0]);
    expect(requested).toContain("dashboard/alerts");
    expect(requested).not.toContain("dashboard/pending-actions");
    expect(requested).not.toContain("dashboard/system-health");
    expect(result.current.canViewPending).toBe(false);
  });

  it("does not grant acknowledge rights from view rights alone", () => {
    authMock.user = adminWith(PERMISSIONS.DASHBOARD_VIEW_ALERTS);

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    expect(result.current.canViewAlerts).toBe(true);
    expect(result.current.canAcknowledgeAlerts).toBe(false);
  });

  it("treats a logged-out user as having no access", () => {
    authMock.user = null;

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    expect(result.current.canViewAlerts).toBe(false);
    expect(mockedGet).not.toHaveBeenCalled();
  });
});

describe("useDashboardOperations — data handling", () => {
  it("unwraps the API envelope and exposes the item list", async () => {
    authMock.user = adminWith(PERMISSIONS.DASHBOARD_VIEW_ALERTS);
    mockedGet.mockResolvedValue({
      data: {
        items: [{ id: "alert-1", title: "Queue backlog", severity: "warning" }],
        totalCount: 1,
      },
    });

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    await waitFor(() => expect(result.current.alerts).toHaveLength(1));
    expect(result.current.alerts[0]?.id).toBe("alert-1");
    expect(result.current.alertsTotal).toBe(1);
  });

  it("accepts an already-unwrapped payload", async () => {
    authMock.user = adminWith(PERMISSIONS.DASHBOARD_VIEW_ALERTS);
    mockedGet.mockResolvedValue({ items: [{ id: "alert-2" }], totalCount: 1 });

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    await waitFor(() => expect(result.current.alerts).toHaveLength(1));
    expect(result.current.alerts[0]?.id).toBe("alert-2");
  });

  it("returns empty collections rather than undefined before data arrives", () => {
    authMock.user = adminWith(PERMISSIONS.DASHBOARD_VIEW_ALERTS);
    mockedGet.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    // Widgets must never render a fabricated zero-state as if it were data.
    expect(result.current.alerts).toEqual([]);
    expect(result.current.services).toEqual([]);
    expect(result.current.overallStatus).toBeNull();
    expect(result.current.alertsLoading).toBe(true);
  });
});

describe("useDashboardOperations — partial failure isolation", () => {
  it("keeps healthy panels working when one endpoint fails", async () => {
    authMock.user = adminWith(
      PERMISSIONS.DASHBOARD_VIEW_ALERTS,
      PERMISSIONS.DASHBOARD_VIEW_PENDING_ITEMS,
      PERMISSIONS.DASHBOARD_VIEW_SYSTEM_HEALTH,
    );

    mockedGet.mockImplementation(async (path: string) => {
      if (path === "dashboard/alerts") {
        throw new Error("500 Internal Server Error");
      }
      if (path === "dashboard/pending-actions") {
        return { items: [{ id: "pending-1", title: "Course review" }], totalCount: 1 };
      }
      return { overallStatus: "healthy", services: [{ serviceKey: "database" }] };
    });

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    // The hook retries once before giving up, so allow for the retry delay.
    await waitFor(() => expect(result.current.alertsError).toBe(true), { timeout: 5000 });

    // A failing alerts query must not blank the other two panels.
    expect(result.current.pendingActions).toHaveLength(1);
    expect(result.current.pendingError).toBe(false);
    expect(result.current.overallStatus).toBe("healthy");
    expect(result.current.healthError).toBe(false);
  });

  it("surfaces an error state instead of substituting fake data", async () => {
    authMock.user = adminWith(PERMISSIONS.DASHBOARD_VIEW_SYSTEM_HEALTH);
    mockedGet.mockRejectedValue(new Error("503 Service Unavailable"));

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    await waitFor(() => expect(result.current.healthError).toBe(true), { timeout: 5000 });
    expect(result.current.services).toEqual([]);
    expect(result.current.overallStatus).toBeNull();
  });
});

describe("useDashboardOperations — acknowledge", () => {
  it("posts to the acknowledge endpoint with an encoded id", async () => {
    authMock.user = adminWith(
      PERMISSIONS.DASHBOARD_VIEW_ALERTS,
      PERMISSIONS.DASHBOARD_ACKNOWLEDGE_ALERTS,
    );
    mockedGet.mockResolvedValue({ items: [], totalCount: 0 });
    mockedPost.mockResolvedValue({ alertId: "a/b", state: "acknowledged" });

    const { result } = renderHook(() => useDashboardOperations(), { wrapper });

    result.current.acknowledgeAlert({ alertId: "a/b" });

    await waitFor(() => expect(mockedPost).toHaveBeenCalled());
    // A raw slash would otherwise change the request path.
    expect(mockedPost).toHaveBeenCalledWith("dashboard/alerts/a%2Fb/acknowledge", { note: "" });
  });
});
