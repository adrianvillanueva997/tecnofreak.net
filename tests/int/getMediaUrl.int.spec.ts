import { describe, expect, it } from "vitest";
import { getMediaUrl } from "@/utilities/getMediaUrl";

describe("getMediaUrl", () => {
	it("preserves Payload media API paths", () => {
		expect(getMediaUrl("/api/media/file/image.webp")).toBe(
			"/api/media/file/image.webp",
		);
	});

	it("appends an encoded cache tag", () => {
		expect(getMediaUrl("/api/media/file/image.webp", "updated at")).toBe(
			"/api/media/file/image.webp?updated%20at",
		);
	});
});
