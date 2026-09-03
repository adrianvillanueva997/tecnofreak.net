import configPromise from "@payload-config";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { getPayload } from "payload";
import { PostRow } from "@/components/PostRow";
import type { Category } from "@/payload-types";

export const dynamic = "force-dynamic";

type Args = {
	params: Promise<{ category: string }>;
	searchParams: Promise<{ all?: string }>;
};
type CategorySummary = Pick<Category, "id" | "title" | "slug" | "parent">;

function parentID(category: CategorySummary) {
	return typeof category.parent === "object" && category.parent
		? category.parent.id
		: typeof category.parent === "number"
			? category.parent
			: null;
}

function descendantIDs(categoryID: number, children: Map<number, number[]>) {
	const ids = [categoryID];
	for (const childID of children.get(categoryID) ?? []) {
		ids.push(...descendantIDs(childID, children));
	}
	return ids;
}

export default async function Categoria({ params: paramsPromise, searchParams }: Args) {
	const { category: categorySlug } = await paramsPromise;
	const { all } = await searchParams;
	const payload = await getPayload({ config: configPromise });
	const allCategories = await payload.find({
		collection: "categories",
		depth: 1,
		limit: 0,
		select: { title: true, slug: true, parent: true },
	});
	const category = allCategories.docs.find(
		({ slug }) => slug === decodeURIComponent(categorySlug),
	);
	if (!category) notFound();
	const parent = typeof category.parent === "object" && category.parent ? category.parent : null;

	const children = new Map<number, number[]>();
	for (const item of allCategories.docs) {
		const parent = parentID(item);
		if (parent !== null) children.set(parent, [...(children.get(parent) ?? []), item.id]);
	}
	const childCategories = allCategories.docs.filter(
		(item) => parentID(item) === category.id,
	);
	const categoryIDs = descendantIDs(category.id, children);
	const showAll = all === "1";
	const previewLimit = showAll ? 0 : 5;

	const posts = await payload.find({
		collection: "posts",
		draft: false,
		depth: 1,
		limit: 1,
		overrideAccess: false,
		sort: "-publishedAt",
		where: {
			and: [
				{ _status: { equals: "published" } },
				{ categories: { in: categoryIDs } },
			],
		},
	});

	const findPosts = (ids: number[]) =>
		payload.find({
			collection: "posts",
			draft: false,
			depth: 1,
			limit: previewLimit,
			overrideAccess: false,
			sort: "-publishedAt",
			where: {
				and: [
					{ _status: { equals: "published" } },
					{ categories: { in: ids } },
				],
			},
			select: {
				title: true,
				slug: true,
				heroImage: true,
				categories: true,
				publishedAt: true,
			},
		});

	const childPosts = (
		await Promise.all(
			childCategories.map(async (child) => ({
				category: child,
				result: await findPosts(descendantIDs(child.id, children)),
			})),
		)
	).filter(({ result }) => result.totalDocs > 0);
	const assignedToParent = await findPosts([category.id]);

	return (
		<div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
			<nav aria-label="Navegación de categorías" className="kicker mb-5 flex flex-wrap items-center gap-2 text-fog">
				<Link href="/categorias" className="transition-colors duration-100 hover:text-teal">
					Categorías
				</Link>
				<span aria-hidden="true">›</span>
				{parent && (
					<>
						<Link
							href={`/categorias/${parent.slug}`}
							className="transition-colors duration-100 hover:text-teal"
						>
							{parent.title}
						</Link>
						<span aria-hidden="true">›</span>
					</>
				)}
				<span className="text-ink">{category.title}</span>
			</nav>
			<header className="border-b-2 border-teal pb-5">
				<p className="kicker text-teal">Categoría</p>
				<h1 className="font-display mt-2 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
					{category.title}
				</h1>
				<p className="kicker mt-3 text-fog">
					{posts.totalDocs} {posts.totalDocs === 1 ? "artículo" : "artículos"}
				</p>
			</header>
				{childPosts.map(({ category: child, result }) => (
				<section key={child.id} className="mt-8">
					<h2 className="font-display border-b-2 border-teal pb-2 text-xl font-bold">
						<Link href={`/categorias/${child.slug}`} className="hover:text-teal">
							{child.title}
						</Link>
					</h2>
					<ul className="m-0 list-none border-t border-rule p-0">
						{result.docs.map((post, index) => (
							<PostRow key={post.id} post={post} first={index === 0} />
						))}
					</ul>
					{!showAll && result.totalDocs > previewLimit && (
						<p className="mt-3 text-right">
							<Link href={`/categorias/${child.slug}?all=1`} className="link-more text-sm">
								Ver más ({result.totalDocs})
							</Link>
						</p>
					)}
				</section>
			))}
			{assignedToParent.totalDocs > 0 && (
				<section className="mt-8">
					<h2 className="font-display border-b-2 border-teal pb-2 text-xl font-bold">
						Otros artículos
					</h2>
					<ul className="m-0 list-none border-t border-rule p-0">
						{assignedToParent.docs.map((post, index) => (
							<PostRow key={post.id} post={post} first={index === 0} />
						))}
					</ul>
					{!showAll && assignedToParent.totalDocs > previewLimit && (
						<p className="mt-3 text-right">
							<Link href={`/categorias/${category.slug}?all=1`} className="link-more text-sm">
								Ver más ({assignedToParent.totalDocs})
							</Link>
						</p>
					)}
				</section>
			)}
			<p className="mt-8">
				<Link href="/categorias" className="link-more text-sm">
					Todas las categorías
				</Link>
			</p>
		</div>
	);
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
