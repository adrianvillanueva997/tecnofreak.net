import configPromise from "@payload-config";
import { getPayload } from "payload";

export async function getYearCounts(): Promise<
	{ year: string; count: number }[]
> {
	const payload = await getPayload({ config: configPromise });
	const posts = await payload.find({
		collection: "posts",
		draft: false,
		depth: 0,
		limit: 0,
		overrideAccess: false,
		select: { publishedAt: true },
		where: { _status: { equals: "published" } },
	});

	const counts = new Map<string, number>();
	for (const p of posts.docs) {
		if (!p.publishedAt) continue;
		const year = p.publishedAt.slice(0, 4);
		counts.set(year, (counts.get(year) ?? 0) + 1);
	}

	return [...counts.entries()]
		.map(([year, count]) => ({ year, count }))
		.sort((a, b) => b.year.localeCompare(a.year));
}
