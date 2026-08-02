import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";

const { mockAdminFetch } = vi.hoisted(() => ({ mockAdminFetch: vi.fn() }));

vi.mock("@/lib/api/admin-api", () => ({
  adminFetch: mockAdminFetch,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/admin/broadcast/broadcast-editor", () => ({
  BroadcastEditor: ({ formData, updateField }: any) => (
    <div data-testid="broadcast-editor">
      <input
        aria-label="عنوان الرسالة"
        value={formData.title}
        onChange={(e) => updateField("title", e.target.value)}
      />
      <textarea
        aria-label="نص الرسالة"
        value={formData.message}
        onChange={(e) => updateField("message", e.target.value)}
      />
    </div>
  ),
}));

vi.mock("@/components/admin/broadcast/broadcast-channels", () => ({
  BroadcastChannels: () => <div data-testid="broadcast-channels" />,
}));

vi.mock("@/components/admin/broadcast/broadcast-templates", () => ({
  BroadcastTemplates: () => <div data-testid="broadcast-templates" />,
}));

vi.mock("@/components/admin/broadcast/broadcast-preview", () => ({
  BroadcastPreview: () => <div data-testid="broadcast-preview" />,
}));

vi.mock("@/components/admin/broadcast/broadcast-audience", () => ({
  BroadcastAudience: ({ selectedUserIds, onSelectAll, onDeselectAll }: any) => (
    <div>
      <div data-testid="selected-count">{selectedUserIds.length}</div>
      <button type="button" onClick={onSelectAll}>
        اختيار الكل
      </button>
      <button type="button" onClick={onDeselectAll}>
        إلغاء الكل
      </button>
    </div>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  m: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

import { BroadcastModal } from "@/components/admin/broadcast/broadcast-modal";

describe("BroadcastModal", () => {
  it("allows clearing the selected audience without immediately restoring all users", async () => {
    const users = [
      { id: "u-1", name: "أحمد", email: "ahmed@example.com", role: "STUDENT" },
      { id: "u-2", name: "سارة", email: "sara@example.com", role: "STUDENT" },
      { id: "u-3", name: "محمد", email: "mohamed@example.com", role: "TEACHER" },
    ] as any;

    render(<BroadcastModal open onOpenChange={vi.fn()} users={users} />);

    fireEvent.click(screen.getByRole("button", { name: /التالي/i }));
    fireEvent.change(screen.getByLabelText("عنوان الرسالة"), { target: { value: "عنوان اختبار" } });
    fireEvent.change(screen.getByLabelText("نص الرسالة"), { target: { value: "محتوى اختبار" } });
    fireEvent.click(screen.getByRole("button", { name: /التالي/i }));

    expect(screen.getByTestId("selected-count")).toHaveTextContent("3");

    fireEvent.click(screen.getByRole("button", { name: /إلغاء الكل/i }));

    await waitFor(() => {
      expect(screen.getByTestId("selected-count")).toHaveTextContent("0");
    });
  });
});
