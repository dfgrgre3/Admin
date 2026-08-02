import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminsPage } from "@/components/admin/admins/admins-page";
import * as adminUsersApiModule from "@/lib/api/admin-users-api";
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

vi.mock("@/lib/api/admin-users-api", () => ({
  adminUsersApi: {
    list: vi.fn(),
  },
}));

describe("AdminsPage", () => {
  it("renders the supervisors dashboard with backend data", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    vi.mocked(adminUsersApiModule.adminUsersApi.list).mockResolvedValue({
      users: [
        {
          id: "u-1",
          email: "youssef@thanawy.com",
          name: "يوسف محمد",
          username: "youssef",
          avatar: null,
          role: UserRole.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
          permissions: ["users:view", "users:manage"],
          emailVerified: true,
          createdAt: "2024-01-10T00:00:00Z",
          lastLogin: "2026-08-02T10:00:00Z",
          totalXP: 1040,
          level: 8,
          currentStreak: 5,
          _count: { tasks: 12, studySessions: 44, achievements: 7 },
        },
      ],
      summary: {
        totalUsers: 1,
        totalAdmins: 1,
        powerUsers: 1,
        totalStudents: 0,
        totalTeachers: 0,
        totalModerators: 0,
        verified: 1,
        notVerified: 0,
        suspended: 0,
        active: 1,
        blocked: 0,
        deleted: 0,
        newToday: 0,
        newThisWeek: 0,
        newThisMonth: 0,
        onlineNow: 1,
      },
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdminsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(adminUsersApiModule.adminUsersApi.list).toHaveBeenCalled();
    });

    expect(screen.getByRole("heading", { name: "إدارة المشرفين" })).toBeInTheDocument();
    expect(screen.getByText("إجمالي المشرفين")).toBeInTheDocument();
    expect(screen.getByLabelText("البحث عن مشرف")).toBeInTheDocument();
    expect(screen.getByText("قائمة المشرفين")).toBeInTheDocument();
  });
});
