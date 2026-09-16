import { expect, test } from "@playwright/test";

test.describe("Frontend", () => {
	test("can load homepage", async ({ page }) => {
		const response = await page.goto("/");
		await expect(response).not.toBeNull();
		await expect(response?.status()).toBe(200);
		await expect(page).toHaveTitle(/tecnofreak\.net/);
	});

	test("keeps content within narrow viewports", async ({ page }) => {
		for (const width of [320, 375, 414, 768]) {
			await page.setViewportSize({ width, height: 900 });
			await page.goto("/");
			await expect
				.poll(async () => page.evaluate(() => document.documentElement.scrollWidth))
				.toBeLessThanOrEqual(width);
		}
	});
});
