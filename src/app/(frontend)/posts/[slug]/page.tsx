import configPromise from "@payload-config";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { getPayload } from "payload";
import { cache } from "react";
import { ProductBoxBlock } from "@/blocks/ProductBox/Component";
import { AdBanner } from "@/components/AdBanner";
import { CommentsSection } from "@/components/Comments";
import { LivePreviewListener } from "@/components/LivePreviewListener";
import { Media } from "@/components/Media";
import { PayloadRedirects } from "@/components/PayloadRedirects";
import { PostCard } from "@/components/PostCard";
import RichText from "@/components/RichText";
import { ShareButtons } from "@/components/ShareButtons";

import type { Category, Post, Product, Tag } from "@/payload-types";
import { formatDate } from "@/utilities/formatDate";
import { generateMeta } from "@/utilities/generateMeta";

export const dynamic = "force-dynamic";

function categoryPath(category: Category): Category[] {
	const path: Category[] = [];
	let current: Category | null = category;
	const seen = new Set<number>();

	while (current && !seen.has(current.id)) {
		path.unshift(current);
		seen.add(current.id);
		current = typeof current.parent === "object" && current.parent ? current.parent : null;
	}

	return path;
}

function categoryGroups(categories: Category[]) {
	const groups = new Map<number, { parent: Category; children: Category[] }>();

	for (const category of categories) {
		const path = categoryPath(category);
		const parent = path[0];
		if (!parent) continue;

		const group = groups.get(parent.id) ?? { parent, children: [] };
		const child = path[path.length - 1];
		if (child.id !== parent.id && !group.children.some((item) => item.id === child.id)) {
			group.children.push(child);
		}
		groups.set(parent.id, group);
	}

	return [...groups.values()];
}

type Args = {
	params: Promise<{
		slug?: string;
	}>;
};

export default async function Post({ params: paramsPromise }: Args) {
	const { isEnabled: draft } = await draftMode();
	const { slug = "" } = await paramsPromise;
	// Decode to support slugs with special characters
	const decodedSlug = decodeURIComponent(slug);
	const url = `/posts/${decodedSlug}`;
	const post = await queryPostBySlug({ slug: decodedSlug });

	if (!post) return <PayloadRedirects url={url} />;

	const cats = Array.isArray(post.categories)
		? post.categories.filter((category): category is Category => typeof category === "object")
		: [];
	const categoryRows = categoryGroups(cats);
	const tags = Array.isArray(post.tags)
		? post.tags.filter((tag): tag is Tag => typeof tag === "object")
		: [];
	const hero =
		post.heroImage && typeof post.heroImage === "object"
			? post.heroImage
			: null;

	const payload = await getPayload({ config: configPromise });

	// Sigue leyendo: manual picks first, then same-tag news, then latest as filler
	const related = Array.isArray(post.relatedPosts)
		? (post.relatedPosts.filter((p) => typeof p === "object") as Post[])
		: [];

	if (related.length < 3 && !draft && cats.length > 0) {
		const byTag = await payload.find({
			collection: "posts",
			draft: false,
			depth: 1,
			limit: 6,
			overrideAccess: false,
			sort: "-publishedAt",
			where: {
				and: [
					{ _status: { equals: "published" } },
					{ slug: { not_equals: post.slug } },
					{ categories: { in: cats.map((c) => c.id) } },
				],
			},
		});
		for (const p of byTag.docs as Post[]) {
			if (related.length >= 3) break;
			if (!related.some((r) => r.id === p.id)) related.push(p);
		}
	}

	if (related.length < 3 && !draft) {
		const recent = await payload.find({
			collection: "posts",
			draft: false,
			depth: 1,
			limit: 6,
			overrideAccess: false,
			sort: "-publishedAt",
			where: {
				and: [
					{ _status: { equals: "published" } },
					{ slug: { not_equals: post.slug } },
					...(related.length
						? [{ id: { not_in: related.map((r) => r.id) } }]
						: []),
				],
			},
		});
		for (const p of recent.docs as Post[]) {
			if (related.length >= 3) break;
			if (!related.some((r) => r.id === p.id)) related.push(p);
		}
	}

	let affiliate: Product[] = [];
	if (Array.isArray(post.affiliateProducts))
		affiliate = post.affiliateProducts.filter(
			(p): p is Product => typeof p === "object",
		);
	const hasInlineAffiliates =
		affiliate.length > 0 ||
		JSON.stringify(post.content ?? {}).includes('"productBox"');

	return (
		<>
			{/* Allows redirects for valid pages too */}
			<PayloadRedirects disableNotFound url={url} />

			{draft && <LivePreviewListener />}

			<article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
				<header>
					<p className="kicker text-teal">Artículo</p>
					<h1 className="font-display mt-3 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
						{post.title}
					</h1>
					<div className="mt-5 border-b border-rule pb-5">
						{post.publishedAt && (
							<time className="kicker mr-4 text-fog" dateTime={post.publishedAt}>
								{formatDate(post.publishedAt)}
							</time>
						)}
						{cats.length > 0 && (
							<nav aria-label="Categorías" className="mt-3 space-y-2">
								{categoryRows.map(({ parent, children }) => (
									<div
										key={parent.id}
										className="kicker flex flex-wrap items-center gap-x-3 gap-y-2 border-l-2 border-teal pl-3"
									>
										<Link
											href={`/categorias/${parent.slug}`}
											className="font-semibold text-ink transition-colors duration-100 hover:text-teal"
										>
											{parent.title}
										</Link>
										{children.length > 0 && (
											<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-fog">
												{children.map((child, index) => (
													<span key={child.id} className="inline-flex items-center gap-2">
														{index > 0 && <span aria-hidden="true">·</span>}
														<Link
															href={`/categorias/${child.slug}`}
															className="transition-colors duration-100 hover:text-teal"
														>
															{child.title}
														</Link>
													</span>
												))}
											</span>
										)}
									</div>
								))}
							</nav>
						)}
					</div>
				</header>

				{hero && (
					<div className="mt-8 aspect-[16/9] overflow-hidden border border-rule">
						<Media
							resource={hero}
							className="h-full w-full"
							imgClassName="h-full w-full object-cover"
							loading="eager"
							priority
							size="(max-width: 768px) 100vw, 768px"
						/>
					</div>
				)}

				<RichText className="mt-8" data={post.content} enableGutter={false} />

				{affiliate.length > 0 && (
					<section aria-label="Productos destacados" className="mt-10">
						<h2 className="kicker border-t-2 border-ink pt-3 text-fog">
							Productos destacados
						</h2>
						<div className="mt-5 grid gap-5 sm:grid-cols-2">
							{affiliate.map((p) => (
								<ProductBoxBlock key={p.id} product={p} />
							))}
						</div>
					</section>
				)}

				{hasInlineAffiliates && (
					<p className="kicker mt-8 text-fog">
						Como afiliado de Amazon, tecnofreak.net percibe una comisión por las
						compras cualificadas. Esto no afecta al precio que pagas.
					</p>
				)}

				{tags.length > 0 && (
					<section aria-label="Etiquetas" className="mt-10 border-t border-rule pt-5">
						<h2 className="kicker text-fog">Etiquetas</h2>
						<div className="mt-3 flex flex-wrap gap-2">
							{tags.map((tag) => (
								<Link
									key={tag.id}
									href={`/etiquetas/${tag.slug}`}
									className="kicker border border-rule px-2.5 py-1 text-teal transition-colors duration-100 hover:border-teal hover:text-ink"
								>
									#{tag.title}
								</Link>
							))}
						</div>
					</section>
				)}

				<div className="mt-10 border-t border-rule pt-5">
					<ShareButtons />
				</div>

				<AdBanner />

				<CommentsSection postId={post.id} />
			</article>

			{related.length > 0 && (
				<section
					aria-label="Sigue leyendo"
					className="mx-auto max-w-6xl px-4 pb-16 sm:px-6"
				>
					<h2 className="font-display border-b-2 border-teal pb-2 text-lg font-bold uppercase tracking-wide">
						Sigue leyendo
					</h2>
					<div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
						{related.slice(0, 3).map((p) => (
							<PostCard key={p.id} post={p} />
						))}
					</div>
				</section>
			)}
		</>
	);
}

export async function generateMetadata({
	params: paramsPromise,
}: Args): Promise<Metadata> {
	const { slug = "" } = await paramsPromise;
	// Decode to support slugs with special characters
	const decodedSlug = decodeURIComponent(slug);
	const post = await queryPostBySlug({ slug: decodedSlug });

	return generateMeta({ doc: post });
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
	const { isEnabled: draft } = await draftMode();

	const payload = await getPayload({ config: configPromise });

	const result = await payload.find({
		collection: "posts",
		draft,
		depth: 2,
		limit: 1,
		overrideAccess: draft,
		pagination: false,
		where: {
			slug: {
				equals: slug,
			},
		},
	});

	return result.docs?.[0] || null;
});
