import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserNotificationsTab } from "@/app/(admin)/admin/users/[id]/_components/user-notifications-tab";
import { adminUsersApi } from "@/lib/api/admin-users-api";

vi.mock("@/lib/api/admin-users-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/admin-users-api")>("@/lib/api/admin-users-api");
  return {
    ...actual,
    adminUsersApi: {
      ...actual.adminUsersApi,
      getUserNotifications: vi.fn(),
    },
  };
});

describe("UserNotificationsTab", () => {
  it("renders the latest notifications for the user", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    vi.mocked(adminUsersApi.getUserNotifications).mockResolvedValue({
      total: 2,
      items: [
        {
          id: "n-1",
          type: "IN_APP",
          title: "مرحباً بك",
          body: "تمت إضافتك إلى المنصة",
          readAt: null,
          createdAt: "2026-08-02T10:00:00Z",
        },
        {
          id: "n-2",
          type: "EMAIL",
          title: "تحديث مهم",
          body: "تم تجهيز الحساب الخاص بك",
          readAt: "2026-08-02T11:00:00Z",
          createdAt: "2026-08-02T11:00:00Z",
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <UserNotificationsTab user={{ id: "u-1", name: "يوسف" } as any} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(adminUsersApi.getUserNotifications).toHaveBeenCalledWith("u-1", { limit: 20, page: 1 });
    });

    await waitFor(() => {
      expect(screen.getByText("مرحباً بك")).toBeInTheDocument();
    });

    expect(screen.getByText("الإشعارات")).toBeInTheDocument();
    expect(screen.getByText("مرحباً بك")).toBeInTheDocument();
    expect(screen.getByText("تمت إضافتك إلى المنصة")).toBeInTheDocument();
  });
});
