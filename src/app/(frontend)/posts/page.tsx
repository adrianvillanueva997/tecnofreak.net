import configPromise from "@payload-config";
import type { Metadata } from "next/types";
import { getPayload } from "payload";
import { PostsArchive } from "@/components/PostsArchive";

import { getYearCounts } from "@/utilities/getYearCounts";

export const revalidate = 600;

const PER_PAGE = 24;

export default async function Page() {
	const payload = await getPayload({ config: configPromise });

	const [posts, yearCounts] = await Promise.all([
		payload.find({
			collection: "posts",
			depth: 1,
			limit: PER_PAGE,
			overrideAccess: false,
			sort: "-publishedAt",
			where: { _status: { equals: "published" } },
		}),
		getYearCounts(),
	]);

	return (
		<PostsArchive
			docs={posts.docs}
			page={1}
			totalPages={Math.max(1, posts.totalPages)}
			totalDocs={posts.totalDocs}
			basePath="/posts"
			firstPageHref="/posts"
			yearCounts={yearCounts}
		/>
	);
}

export function generateMetadata(): Metadata {
	return {
		title: "Todas las noticias",
		description:
			"Archivo completo de artículos de tecnofreak.net, filtrable por año.",
	};
}
