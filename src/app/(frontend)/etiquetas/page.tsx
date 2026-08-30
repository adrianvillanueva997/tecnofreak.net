import configPromise from "@payload-config";
import type { Metadata } from "next/types";
import { getPayload } from "payload";
import { TagsDirectory } from "@/components/TagsDirectory";

export const revalidate = 600;

export default async function Etiquetas() {
	const payload = await getPayload({ config: configPromise });
	const [categories, posts] = await Promise.all([
		payload.find({
			collection: "categories",
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
			select: { categories: true },
			where: { _status: { equals: "published" } },
		}),
	]);

	const counts = new Map<number, number>();
	for (const p of posts.docs) {
		for (const c of p.categories ?? []) {
			const id = typeof c === "object" ? c.id : c;
			if (typeof id === "number") counts.set(id, (counts.get(id) ?? 0) + 1);
		}
	}

	const tags = categories.docs
		.map((c) => ({
			id: c.id,
			title: c.title,
			slug: c.slug,
			count: counts.get(c.id) ?? 0,
		}))
		.filter((c) => c.count > 0);

	return (
		<div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 pb-16">
			<header className="border-b-2 border-teal pb-5">
				<p className="kicker text-teal">Índice</p>
				<h1 className="font-display mt-2 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
					Etiquetas
				</h1>
				<p className="kicker mt-3 text-fog">
					{tags.length} etiquetas · explora los artículos por tema
				</p>
			</header>

			<TagsDirectory tags={tags} />
		</div>
	);
}

export function generateMetadata(): Metadata {
	return {
		title: "Etiquetas",
		description: "Explora los artículos de tecnofreak.net por etiqueta.",
	};
}
