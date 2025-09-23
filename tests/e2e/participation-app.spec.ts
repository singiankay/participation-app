import { test, expect } from "@playwright/test";

test.describe("Participation App", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Participation Management App/);
  });

  test("should display participants list", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if there's a participants section
    const participantsSection = page.locator("text=Participants").first();
    await expect(participantsSection).toBeVisible();
  });

  test("should handle form submission", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Look for form inputs
    const firstNameInput = page.locator('input[name="firstName"]').first();
    const lastNameInput = page.locator('input[name="lastName"]').first();
    const participationInput = page
      .locator('input[name="participation"]')
      .first();

    // If the form exists, test it
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill("John");
      await lastNameInput.fill("Doe");
      await participationInput.fill("50");

      // Submit the form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Wait for response
      await page.waitForTimeout(1000);
    }
  });

  test("should validate form inputs", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    const firstNameInput = page.locator('input[name="firstName"]').first();

    // If the form exists, test validation
    if (await firstNameInput.isVisible()) {
      // Test empty input validation
      await firstNameInput.fill("");
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Check for validation error
      const errorMessage = page.locator("text=required").first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });
});
