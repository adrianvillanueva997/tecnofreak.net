import configPromise from "@payload-config";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { getPayload } from "payload";
import { PostRow } from "@/components/PostRow";

export const revalidate = 600;

type Args = {
	params: Promise<{
		tag: string;
	}>;
};

export default async function Etiqueta({ params: paramsPromise }: Args) {
	const { tag: tagSlug } = await paramsPromise;
	const payload = await getPayload({ config: configPromise });

	const match = await payload.find({
		collection: "categories",
		depth: 0,
		limit: 1,
		where: { slug: { equals: decodeURIComponent(tagSlug) } },
	});
	const category = match.docs[0];
	if (!category) notFound();

	const posts = await payload.find({
		collection: "posts",
		depth: 1,
		limit: 0,
		overrideAccess: false,
		sort: "-publishedAt",
		where: {
			and: [
				{ _status: { equals: "published" } },
				{ categories: { equals: category.id } },
			],
		},
		select: { title: true, slug: true, categories: true, publishedAt: true },
	});

	return (
		<div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 pb-16">
			<header className="border-b-2 border-teal pb-5">
				<p className="kicker text-teal">Etiqueta</p>
				<h1 className="font-display mt-2 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
					{category.title}
				</h1>
				<p className="kicker mt-3 text-fog">
					{posts.totalDocs} {posts.totalDocs === 1 ? "artículo" : "artículos"}
				</p>
			</header>

			<ul className="m-0 mt-6 list-none border-t border-rule p-0">
				{posts.docs.map((post, i) => (
					<PostRow key={post.id} post={post} first={i === 0} />
				))}
			</ul>

			<p className="mt-8">
				<Link href="/etiquetas" className="link-more text-sm">
					Todas las etiquetas
				</Link>
			</p>
		</div>
	);
}

export async function generateStaticParams() {
	const payload = await getPayload({ config: configPromise });
	const categories = await payload.find({
		collection: "categories",
		depth: 0,
		limit: 0,
		select: { slug: true },
	});
	return categories.docs.map((c) => ({ tag: c.slug }));
}

export async function generateMetadata({
	params: paramsPromise,
}: Args): Promise<Metadata> {
	const { tag: tagSlug } = await paramsPromise;
	return {
		title: `Etiqueta: ${decodeURIComponent(tagSlug)}`,
		description: `Artículos etiquetados en tecnofreak.net`,
	};
}
