import { dashboardColorConfig, type DashboardColor } from "@/lib/constants/colors";

describe("dashboardColorConfig", () => {
  it("exposes the shared color palette used by dashboard stat cards", () => {
    const expectedColors: DashboardColor[] = [
      "blue",
      "green",
      "yellow",
      "red",
      "purple",
      "cyan",
      "orange",
      "pink",
      "zinc",
    ];

    expect(expectedColors.every((color) => color in dashboardColorConfig)).toBe(true);
    expect(dashboardColorConfig.zinc).toMatchObject({
      bg: "bg-zinc-500/10",
      text: "text-zinc-500",
      border: "border-zinc-500/20",
      gradient: "from-zinc-500/20 to-transparent",
    });
  });
});
