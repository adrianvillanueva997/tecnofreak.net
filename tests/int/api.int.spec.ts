import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import config from "@/payload.config";

let payload: Payload;
let categoryId: number;
let productId: number;

describe("API", () => {
	beforeAll(async () => {
		const payloadConfig = await config;
		payload = await getPayload({ config: payloadConfig });
	});

	it("fetches users", async () => {
		const users = await payload.find({
			collection: "users",
		});
		expect(users).toBeDefined();
	});

	it("assigns a category to a product", async () => {
		const category = await payload.create({
			collection: "categories",
			data: {
				title: "Integration test category",
				slug: "integration-test-category",
			},
			draft: false,
			overrideAccess: true,
		});
		categoryId = category.id;

		const product = await payload.create({
			collection: "products",
			data: {
				asin: "INTEGRATION-TEST-ASIN",
				title: "Integration test product",
				category: category.id,
			},
			draft: false,
			overrideAccess: true,
		});
		productId = product.id;

		expect(product.category).toMatchObject({ id: category.id });
	});

	afterAll(async () => {
		if (productId) {
			await payload.delete({
				collection: "products",
				where: { id: { equals: productId } },
				overrideAccess: true,
			});
		}
		if (categoryId) {
			await payload.delete({
				collection: "categories",
				where: { id: { equals: categoryId } },
				overrideAccess: true,
			});
		}
	});
});
