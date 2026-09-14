import { expect, test } from "@playwright/test";

test.describe("Frontend", () => {
	test("can load homepage", async ({ page }) => {
		const response = await page.goto("/");
		await expect(response).not.toBeNull();
		await expect(response?.status()).toBe(200);
		await expect(page).toHaveTitle(/tecnofreak\.net/);
	});
});
