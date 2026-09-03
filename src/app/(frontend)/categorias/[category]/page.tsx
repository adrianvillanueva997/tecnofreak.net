import configPromise from "@payload-config";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { getPayload } from "payload";
import { PostRow } from "@/components/PostRow";

export const revalidate = 600;

type Args = { params: Promise<{ category: string }> };

export default async function Categoria({ params: paramsPromise }: Args) {
	const { category: categorySlug } = await paramsPromise;
	const payload = await getPayload({ config: configPromise });
	const match = await payload.find({
		collection: "categories",
		depth: 0,
		limit: 1,
		where: { slug: { equals: decodeURIComponent(categorySlug) } },
	});
	const category = match.docs[0];
	if (!category) notFound();

	const posts = await payload.find({
		collection: "posts",
		draft: false,
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
		<div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
			<header className="border-b-2 border-teal pb-5">
				<p className="kicker text-teal">Categoría</p>
				<h1 className="font-display mt-2 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
					{category.title}
				</h1>
				<p className="kicker mt-3 text-fog">
					{posts.totalDocs} {posts.totalDocs === 1 ? "artículo" : "artículos"}
				</p>
			</header>
			<ul className="m-0 mt-6 list-none border-t border-rule p-0">
				{posts.docs.map((post, index) => (
					<PostRow key={post.id} post={post} first={index === 0} />
				))}
			</ul>
			<p className="mt-8">
				<Link href="/categorias" className="link-more text-sm">
					Todas las categorías
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
	return categories.docs.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
	params: paramsPromise,
}: Args): Promise<Metadata> {
	const { category } = await paramsPromise;
	return {
		title: `Categoría: ${decodeURIComponent(category)}`,
		description: "Artículos de tecnofreak.net por categoría.",
	};
}
