import type { Payload } from "payload";

export async function createSlugRedirect({
	payload,
	from,
	to,
}: {
	payload: Payload;
	from: string;
	to: string;
}) {
	if (from === to) return;

	const existing = await payload.find({
		collection: "redirects",
		limit: 1,
		overrideAccess: true,
		where: { from: { equals: from } },
	});

	if (!existing.docs[0]) {
		await payload.create({
			collection: "redirects",
			overrideAccess: true,
			data: { from, to: { type: "custom", url: to } },
		});
	}
}
