import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import * as adminApi from "@/lib/api/admin-api";

const websocketMock = vi.hoisted(() => {
  const listeners = new Map<string, Set<EventListener>>();
  const socket = {
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      const registered = listeners.get(type) ?? new Set<EventListener>();
      registered.add(listener);
      listeners.set(type, registered);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      listeners.get(type)?.delete(listener);
    }),
  };
  return {
    socket,
    emit(type: string, event: Event) {
      listeners.get(type)?.forEach((listener) => listener(event));
    },
  };
});

vi.mock("@/contexts/websocket-context", () => ({
  useWebSocket: () => ({ socket: websocketMock.socket, isConnected: true }),
}));

// Mock the admin API
vi.mock("@/lib/api/admin-api", () => ({
  adminFetch: vi.fn(),
}));

describe("useAdminNotifications", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    QueryClientProvider({ client: queryClient, children })
  );

  it("should fetch notifications on mount", async () => {
    const mockNotifications = [
      { id: "1", message: "Test notification", read: false, createdAt: new Date().toISOString() },
    ];

    vi.mocked(adminApi.adminFetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          notifications: mockNotifications,
          unreadCount: 1,
        },
      }),
    } as Response);

    const { result } = renderHook(() => useAdminNotifications(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    expect(result.current.unreadCount).toBe(1);
    expect(result.current.notifications[0]!.description).toBe("Test notification");
  });

  it("should handle WebSocket messages", async () => {
    vi.mocked(adminApi.adminFetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: { notifications: [], unreadCount: 0 },
      }),
    } as Response);

    const { result } = renderHook(() => useAdminNotifications(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.notifications).toHaveLength(0);
    });

    // Simulate WebSocket message
    act(() => {
      websocketMock.emit("message", new MessageEvent("message", {
        data: JSON.stringify({
          type: "notification",
          notification: { id: "2", message: "New notification", read: false },
        }),
      }));
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]!.description).toBe("New notification");
  });

  it("should mark notification as read", async () => {
    const mockNotifications = [
      { id: "1", message: "Test", read: false, createdAt: new Date().toISOString() },
    ];

    vi.mocked(adminApi.adminFetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { notifications: mockNotifications, unreadCount: 1 },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

    const { result } = renderHook(() => useAdminNotifications(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    await act(async () => {
      await result.current.markAsRead("1");
    });

    expect(adminApi.adminFetch).toHaveBeenCalledWith(
      "/admin/notifications/1/read",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should handle error states", async () => {
    vi.mocked(adminApi.adminFetch).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAdminNotifications(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it("should refetch notifications", async () => {
    vi.mocked(adminApi.adminFetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { notifications: [], unreadCount: 0 },
      }),
    } as Response);

    const { result } = renderHook(() => useAdminNotifications(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.refetch();
    });

    await vi.waitFor(() => {
      expect(adminApi.adminFetch).toHaveBeenCalledTimes(2);
    });
  });
});
