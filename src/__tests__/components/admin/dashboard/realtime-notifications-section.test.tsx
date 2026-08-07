import { render, screen } from "@testing-library/react";
import { RealtimeNotificationsSection } from "@/components/admin/dashboard/sections/realtime-notifications-section";

describe("RealtimeNotificationsSection", () => {
  it("renders the realtime notifications list and unread count", () => {
    render(
      <RealtimeNotificationsSection
        notifications={[
          {
            id: "1",
            title: "تمت إضافة مستخدم جديد",
            description: "تم تسجيل طالب جديد في المنصة",
            timestamp: new Date("2026-08-02T10:00:00Z"),
            read: false,
            type: "user",
          },
        ]}
        unreadCount={1}
        onMarkAsRead={() => {}}
        onDismiss={() => {}}
      />
    );

    expect(screen.getByText("الإشعارات الفورية")).toBeTruthy();
    expect(screen.getByText("1 غير مقروءة")).toBeTruthy();
    expect(screen.getByText("تمت إضافة مستخدم جديد")).toBeTruthy();
    expect(screen.getByText("تم تسجيل طالب جديد في المنصة")).toBeTruthy();
  });

  it("renders an empty state when there are no notifications", () => {
    render(
      <RealtimeNotificationsSection
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={() => {}}
        onDismiss={() => {}}
      />
    );

    expect(screen.getByText("الإشعارات الفورية")).toBeTruthy();
    expect(screen.queryByText("1 غير مقروءة")).toBeNull();
  });
});
