import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminsPage } from "@/components/admin/admins/admins-page";
import { adminFetch } from "@/lib/api/admin-api";
import { UserRole, UserStatus } from "@/types/enums";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock("@/lib/api/admin-api", () => ({
  adminFetch: vi.fn(),
}));

function jsonResponse(data: unknown) {
  return { ok: true, status: 200, json: async () => ({ success: true, data }) } as Response;
}

function mockAdminFetch(total: number) {
  vi.mocked(adminFetch).mockImplementation(async (path: string) => {
    if (path.startsWith("/api/admin/admins")) {
      return jsonResponse({
        admins: [
          {
            id: "u-1",
            email: "youssef@thanawy.com",
            name: "يوسف محمد",
            role: UserRole.SUPER_ADMIN,
            status: UserStatus.ACTIVE,
            permissions: ["users:view", "users:manage"],
            createdAt: "2024-01-10T00:00:00Z",
            lastLogin: "2026-08-02T10:00:00Z",
          },
        ],
        pagination: { page: 1, limit: 100, total, totalPages: 1 },
        statistics: { total, active: 1, suspended: 0, blocked: 0, online: 1 },
      });
    }
    return jsonResponse({ sessions: [] });
  });
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminsPage />
    </QueryClientProvider>
  );
}

describe("AdminsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the supervisors dashboard with backend data", async () => {
    mockAdminFetch(1);
    renderPage();

    await waitFor(() => {
      expect(adminFetch).toHaveBeenCalled();
    });

    expect(screen.getByRole("heading", { name: "إدارة المشرفين" })).toBeInTheDocument();
    expect(screen.getByText("إجمالي المشرفين")).toBeInTheDocument();
    expect(screen.getByLabelText("البحث عن مشرف")).toBeInTheDocument();
    expect(screen.getByText("قائمة المشرفين")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("يوسف محمد")).toBeInTheDocument();
    });
  });

  it("renders the header badge from backend statistics", async () => {
    mockAdminFetch(3);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("3 عضو")).toBeInTheDocument();
    });
  });
});
