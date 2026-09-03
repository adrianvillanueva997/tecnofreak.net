import configPromise from "@payload-config";
import Link from "next/link";
import type { Metadata } from "next/types";
import { getPayload } from "payload";

export const revalidate = 600;

export default async function Categorias() {
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
	for (const post of posts.docs) {
		for (const category of post.categories ?? []) {
			const id = typeof category === "object" ? category.id : category;
			if (typeof id === "number") counts.set(id, (counts.get(id) ?? 0) + 1);
		}
	}
	const activeCategories = categories.docs.filter((category) => counts.has(category.id));

	return (
		<div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6">
			<header className="border-b-2 border-teal pb-5">
				<p className="kicker text-teal">Índice</p>
				<h1 className="font-display mt-2 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
					Categorías
				</h1>
				<p className="kicker mt-3 text-fog">
					{activeCategories.length} categorías con artículos publicados · explora por tema
				</p>
			</header>
			<ul className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
				{activeCategories.map((category) => (
					<li key={category.id}>
						<Link
							href={`/categorias/${category.slug}`}
							className="inline-flex min-h-9 items-center gap-1.5 border border-rule bg-paper px-3 text-sm font-medium text-ink transition-colors duration-100 hover:border-teal hover:text-teal"
						>
							{category.title}
							<span className="kicker text-fog">
								{counts.get(category.id) ?? 0}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

export function generateMetadata(): Metadata {
	return {
		title: "Categorías",
		description: "Explora los artículos de tecnofreak.net por categoría.",
	};
}
