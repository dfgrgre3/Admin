import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
} from "@/lib/utils";

describe("Date Formatting", () => {
  it("formatDate should format date correctly in Arabic", () => {
    const date = new Date("2024-03-15");
    const formatted = formatDate(date);
    expect(formatted).toContain("٢٠٢٤");
    expect(formatted).toContain("مارس");
  });

  it("formatDateTime should include time", () => {
    const date = new Date("2024-03-15T14:30:00");
    const formatted = formatDateTime(date);
    expect(formatted).toContain("٢٠٢٤");
    expect(formatted).toMatch(/٠٢:٣٠|١٤:٣٠/);
  });

  it("formatRelativeTime should return 'الآن' for recent dates", () => {
    const now = new Date();
    const result = formatRelativeTime(now);
    expect(result).toBe("الآن");
  });

  it("formatRelativeTime should return minutes for recent past", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = formatRelativeTime(fiveMinutesAgo);
    expect(result).toContain("5");
    expect(result).toContain("دقيقة");
  });

  it("formatRelativeTime should handle hours", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = formatRelativeTime(twoHoursAgo);
    expect(result).toContain("2");
    expect(result).toContain("ساعة");
  });

  it("formatRelativeTime should handle days", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(threeDaysAgo);
    expect(result).toContain("3");
    expect(result).toContain("يوم");
  });

  it("formatRelativeTime should handle future dates", () => {
    const future = new Date(Date.now() + 5 * 60 * 1000);
    const result = formatRelativeTime(future);
    expect(result).toContain("5");
    expect(result).toContain("دقيقة");
  });

  it("formatRelativeTime should handle null/undefined", () => {
    expect(formatRelativeTime(null)).toBe("تاريخ غير صحيح");
    expect(formatRelativeTime(undefined)).toBe("تاريخ غير صحيح");
  });
});

describe("Number Formatting", () => {
  it("formatNumber should format with Arabic numerals", () => {
    expect(formatNumber(1234567)).toBe("١٬٢٣٤٬٥٦٧");
  });

  it("formatNumber should handle decimals", () => {
    expect(formatNumber(1234.56, 2)).toBe("١٬٢٣٤٫٥٦");
  });

  it("formatNumber should handle zero", () => {
    expect(formatNumber(0)).toBe("٠");
  });
});

describe("Currency Formatting", () => {
  it("formatCurrency should format EGP correctly", () => {
    const formatted = formatCurrency(1500, "EGP");
    expect(formatted).toBe("١٬٥٠٠ EGP");
  });

  it("formatCurrency should format USD correctly", () => {
    const formatted = formatCurrency(100, "USD");
    expect(formatted).toBe("١٠٠ USD");
  });

  it("formatCurrency should handle zero", () => {
    const formatted = formatCurrency(0);
    expect(formatted).toBe("٠ EGP");
  });
});

describe("Percentage Formatting", () => {
  it("formatPercentage should format correctly", () => {
    expect(formatPercentage(85.67, 1)).toBe("85.7%");
  });

  it("formatPercentage should handle 0", () => {
    expect(formatPercentage(0)).toBe("0.0%");
  });

  it("formatPercentage should handle 1", () => {
    expect(formatPercentage(100)).toBe("100.0%");
  });
});
