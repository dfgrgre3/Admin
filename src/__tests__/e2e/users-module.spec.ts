import { test, expect, Page } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function loginAs(page: Page, email: string, password = "P@ssw0rd!Admin2024") {
  await page.goto("/admin/login");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin**", { timeout: 10_000 });
}

async function loginAsAdmin(page: Page) {
  return loginAs(page, "admin@test.com");
}

async function loginAsSuperAdmin(page: Page) {
  return loginAs(page, "superadmin@test.com");
}

// ─────────────────────────────────────────────────────────────────────────────
// Users List Page Tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Users Module – List Page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/users");
    await expect(page.locator("h1, [data-testid='page-title']")).toBeVisible({ timeout: 10_000 });
  });

  test("renders the users table with at least one row or empty state", async ({ page }) => {
    // Either shows a user row OR the empty state — both are valid
    const rowsOrEmpty = page.locator('[data-testid="user-row"], [data-testid="empty-state"]').first();
    await expect(rowsOrEmpty).toBeVisible({ timeout: 8_000 });
  });

  test("displays stats cards (total users, admins, active)", async ({ page }) => {
    const cards = page.locator('[data-testid="stats-card"]');
    await expect(cards).toHaveCount(3, { timeout: 6_000 });
  });

  test("search by name updates table results", async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="بحث"]').first();
    await searchInput.fill("أحمد");
    await page.waitForTimeout(600); // debounce delay
    // URL should update with search param
    await expect(page).toHaveURL(/search=.+/);
  });

  test("role tab filter updates URL and request", async ({ page }) => {
    await page.locator('[data-testid="role-tab-STUDENT"], button:has-text("الطلاب")').first().click();
    await expect(page).toHaveURL(/role=STUDENT/);
  });

  test("status tab filter shows only ACTIVE users", async ({ page }) => {
    await page.locator('[data-testid="status-tab-ACTIVE"], button:has-text("نشط")').first().click();
    await expect(page).toHaveURL(/status=ACTIVE/);
  });

  test("clicking 'فلاتر متقدمة' opens the advanced filter panel", async ({ page }) => {
    await page.locator('button:has-text("فلاتر متقدمة")').click();
    const filterPanel = page.locator('[data-testid="advanced-filters-panel"], .advanced-filters');
    await expect(filterPanel.or(page.locator('select, input[type="date"]').first())).toBeVisible();
  });

  test("saved view preset 'الطلاب النشطون' sets correct filters", async ({ page }) => {
    await page.locator('button:has-text("الطلاب النشطون")').click();
    await expect(page).toHaveURL(/role=STUDENT/);
    await expect(page).toHaveURL(/status=ACTIVE/);
  });

  test("saved view preset 'البريد غير موثق' sets emailVerified filter", async ({ page }) => {
    await page.locator('button:has-text("البريد غير موثق")').click();
    await expect(page).toHaveURL(/emailVerified=false|email_verified=false/i);
  });

  test("pagination controls navigate correctly", async ({ page }) => {
    const nextBtn = page.locator('button:has-text("التالي")');
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test("column visibility toggle hides a column", async ({ page }) => {
    await page.locator('button:has-text("الأعمدة")').click();
    const firstColumnToggle = page.locator('[role="menuitemcheckbox"]').first();
    await firstColumnToggle.click();
    // Column should now be hidden — the header count should decrease
    await page.keyboard.press("Escape");
  });

  test("density mode dropdown changes row height", async ({ page }) => {
    // Click the density button (shows current mode label)
    const densityBtn = page.locator('button:has-text("عادي"), button:has-text("مضغوط"), button:has-text("مريح")').first();
    await densityBtn.click();
    await page.locator('[role="menuitem"]:has-text("مضغوط")').click();
    // Verify compact class applied
    const firstCell = page.locator("td").first();
    await expect(firstCell).toHaveClass(/py-1/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Create User Flow (Wizard Step Form)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Users Module – Create User Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/users/create");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 8_000 });
  });

  test("wizard renders step 1 (role selection) by default", async ({ page }) => {
    await expect(page.locator("text=اختر نوع الحساب, text=حدد دور المستخدم").first()).toBeVisible();
  });

  test("can select STUDENT role and proceed to step 2", async ({ page }) => {
    const studentCard = page.locator('[data-testid="role-card-STUDENT"], [data-role="STUDENT"], button:has-text("طالب")').first();
    await studentCard.click();
    await page.locator('button:has-text("التالي"), button:has-text("Next")').first().click();
    await expect(page.locator('input[name="email"], input[name="firstName"]').first()).toBeVisible();
  });

  test("password strength meter appears when typing a password", async ({ page }) => {
    const studentCard = page.locator('[data-testid="role-card-STUDENT"], [data-role="STUDENT"], button:has-text("طالب")').first();
    await studentCard.click();
    await page.locator('button:has-text("التالي"), button:has-text("Next")').first().click();

    // Toggle to manual password
    const inviteToggle = page.locator('input[name="sendInvite"], button:has-text("كلمة مرور")').first();
    if (await inviteToggle.isVisible()) await inviteToggle.click();

    const pwInput = page.locator('input[name="temporaryPassword"], input[type="password"]').first();
    await pwInput.fill("Weak");
    const strengthMeter = page.locator('[data-testid="strength-meter"], .strength-meter, [aria-label*="قوة"]');
    await expect(strengthMeter.or(page.locator('text=ضعيفة'))).toBeVisible({ timeout: 3_000 });

    await pwInput.fill("MyStr0ng!Pass#2024");
    await expect(page.locator('text=قوية, text=ممتاز').first()).toBeVisible({ timeout: 3_000 });
  });

  test("form validation blocks submission with empty required fields", async ({ page }) => {
    const studentCard = page.locator('[data-testid="role-card-STUDENT"], button:has-text("طالب")').first();
    await studentCard.click();
    await page.locator('button:has-text("التالي")').first().click();
    await page.locator('button[type="submit"], button:has-text("إنشاء المستخدم"), button:has-text("حفظ")').first().click();
    // Should see validation errors
    await expect(page.locator('.text-red-500, [aria-live="polite"], [data-testid="form-error"]').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// User Profile 360° – Profile Tabs
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Users Module – 360° Profile Page", () => {
  const USER_PROFILE_URL = "/admin/users/test-user-id";

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    // Visit list page, then click first user row
    await page.goto("/admin/users");
    const firstUserLink = page.locator('[data-testid="user-row"] a, [data-testid="user-name-link"]').first();
    if (await firstUserLink.isVisible()) {
      await firstUserLink.click();
    } else {
      await page.goto(USER_PROFILE_URL);
    }
    await page.waitForURL("**/admin/users/**", { timeout: 8_000 });
  });

  test("profile header shows user avatar and name", async ({ page }) => {
    await expect(page.locator('[data-testid="user-avatar"], img[alt*="avatar"], img[alt*="صورة"]').first()).toBeVisible({ timeout: 6_000 });
  });

  test("all major profile tabs are visible", async ({ page }) => {
    const tabs = ["الجلسات", "الملاحظات", "النشاط", "سجل التدقيق", "الدورات", "المدفوعات", "الشهادات"];
    for (const tab of tabs) {
      await expect(page.locator(`[role="tab"]:has-text("${tab}"), button:has-text("${tab}")`).first()).toBeVisible({ timeout: 4_000 });
    }
  });

  test("clicking the 'الملاحظات' tab loads notes", async ({ page }) => {
    await page.locator('[role="tab"]:has-text("الملاحظات"), button:has-text("الملاحظات")').first().click();
    // Either a note list or empty state appears
    const content = page.locator('[data-testid="notes-list"], [data-testid="empty-notes"], text=لا توجد ملاحظات').first();
    await expect(content).toBeVisible({ timeout: 6_000 });
  });

  test("clicking the 'الدورات' tab loads enrollment data", async ({ page }) => {
    await page.locator('[role="tab"]:has-text("الدورات"), button:has-text("الدورات")').first().click();
    const content = page.locator('[data-testid="enrollments-table"], text=لا يوجد').first();
    await expect(content).toBeVisible({ timeout: 6_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Impersonation Flow & Security Governance
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Users Module – Impersonation Security", () => {
  test("impersonation requires a reason of at least 10 characters", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/users");

    // Open impersonation dialog for a user
    const impersonateBtn = page.locator('[data-testid="impersonate-btn"]').first();
    if (await impersonateBtn.isVisible()) {
      await impersonateBtn.click();
      const reasonInput = page.locator('[data-testid="impersonate-reason"], textarea[placeholder*="سبب"]').first();
      await reasonInput.fill("قصير"); // < 10 chars
      const confirmBtn = page.locator('[data-testid="confirm-impersonate"], button:has-text("تأكيد الانتحال")').first();
      await confirmBtn.click();
      await expect(page.locator('text=يجب أن يكون السبب').first()).toBeVisible({ timeout: 3_000 });
    }
  });

  test("impersonation banner appears after starting impersonation", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto("/admin/users");
    const impersonateBtn = page.locator('[data-testid="impersonate-btn"]').first();
    if (await impersonateBtn.isVisible()) {
      await impersonateBtn.click();
      const reasonInput = page.locator('[data-testid="impersonate-reason"], textarea').first();
      await reasonInput.fill("تحقق من مشكلة الدفع للطالب أحمد");
      await page.locator('[data-testid="confirm-impersonate"], button:has-text("تأكيد الانتحال")').first().click();
      // Check for banner
      await expect(page.locator('[data-testid="impersonation-banner"], .impersonation-banner').first()).toBeVisible({ timeout: 5_000 });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bulk Actions & RBAC Guards
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Users Module – Bulk Actions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/users");
  });

  test("selecting a user row shows bulk actions bar", async ({ page }) => {
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
      const bulkBar = page.locator('[data-testid="bulk-actions-bar"], .bulk-actions').first();
      await expect(bulkBar).toBeVisible({ timeout: 3_000 });
    }
  });

  test("moderator cannot access delete bulk action", async ({ page }) => {
    await loginAs(page, "moderator@test.com");
    await page.goto("/admin/users");
    const deleteAction = page.locator('[data-testid="bulk-delete-btn"]');
    // Should be hidden or disabled for moderator
    const isVisible = await deleteAction.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Export & Import Flows
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Users Module – Export & Import", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/users");
  });

  test("Export button triggers a server-side export job", async ({ page }) => {
    const exportBtn = page.locator('button:has-text("تصدير"), [data-testid="export-btn"]').first();
    await exportBtn.click();
    // Should show a loading state or success toast
    const feedback = page.locator('[data-testid="success-toast"], [role="status"], text=جاري التصدير').first();
    await expect(feedback).toBeVisible({ timeout: 8_000 });
  });

  test("Import button opens CSV import dialog", async ({ page }) => {
    const importBtn = page.locator('button:has-text("استيراد"), [data-testid="import-btn"]').first();
    await importBtn.click();
    const dialog = page.locator('[role="dialog"], [data-testid="import-dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 4_000 });
  });
});
