import configPromise from "@payload-config";
import type { Metadata } from "next/types";
import { getPayload } from "payload";
import { TagsDirectory } from "@/components/TagsDirectory";

export const revalidate = 600;

export default async function Etiquetas() {
	const payload = await getPayload({ config: configPromise });
	const [tags, posts] = await Promise.all([
		payload.find({
			collection: "tags",
			depth: 0,
			limit: 0,
			sort: "title",
		}),
		payload.find({
			collection: "posts",
			draft: false,
			depth: 0,
			limit: 0,
			overrideAccess: false,
			select: { tags: true },
			where: { _status: { equals: "published" } },
		}),
	]);

	const counts = new Map<number, number>();
	for (const p of posts.docs) {
		for (const t of p.tags ?? []) {
			const id = typeof t === "object" ? t.id : t;
			if (typeof id === "number") counts.set(id, (counts.get(id) ?? 0) + 1);
		}
	}

	const tagItems = tags.docs
		.map((tag) => ({
			id: tag.id,
			title: tag.title,
			slug: tag.slug,
			count: counts.get(tag.id) ?? 0,
		}))
		.filter((tag) => tag.count > 0);

	return (
		<div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 pb-16">
			<header className="border-b-2 border-teal pb-5">
				<p className="kicker text-teal">Índice</p>
				<h1 className="font-display mt-2 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
					Etiquetas
				</h1>
				<p className="kicker mt-3 text-fog">
					{tagItems.length} etiquetas · explora los artículos por tema
				</p>
			</header>

			<TagsDirectory tags={tagItems} />
		</div>
	);
}

export function generateMetadata(): Metadata {
	return {
		title: "Etiquetas",
		description: "Explora los artículos de tecnofreak.net por etiqueta.",
	};
}
