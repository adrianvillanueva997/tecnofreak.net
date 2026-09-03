import configPromise from "@payload-config";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { getPayload } from "payload";
import { PostsArchive } from "@/components/PostsArchive";

import { getYearCounts } from "@/utilities/getYearCounts";

export const dynamic = "force-dynamic";

type Args = {
	params: Promise<{
		year: string;
	}>;
};

export default async function PostsByYear({ params: paramsPromise }: Args) {
	const { year } = await paramsPromise;
	if (!/^\d{4}$/.test(year)) notFound();

	const payload = await getPayload({ config: configPromise });

	const start = `${year}-01-01T00:00:00.000Z`;
	const end = `${year}-12-31T23:59:59.999Z`;

	const [posts, yearCounts] = await Promise.all([
		payload.find({
			collection: "posts",
			depth: 1,
			limit: 500,
			overrideAccess: false,
			sort: "-publishedAt",
			where: {
				and: [
					{ _status: { equals: "published" } },
					{ publishedAt: { greater_than_equal: start } },
					{ publishedAt: { less_than_equal: end } },
				],
			},
		}),
		getYearCounts(),
	]);

	if (posts.totalDocs === 0) notFound();
	if (!yearCounts.some((y) => y.year === year)) notFound();

	return (
		<PostsArchive
			docs={posts.docs}
			page={1}
			totalPages={1}
			totalDocs={posts.totalDocs}
			basePath={`/posts/year/${year}`}
			firstPageHref={`/posts/year/${year}`}
			activeYear={year}
			yearCounts={yearCounts}
		/>
	);
}

export async function generateMetadata({
	params: paramsPromise,
}: Args): Promise<Metadata> {
	const { year } = await paramsPromise;
	return {
		title: `Noticias de ${year}`,
		description: `Todos los artículos de tecnofreak.net publicados en ${year}.`,
	};
}
