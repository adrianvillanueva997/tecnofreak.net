import configPromise from "@payload-config";
import Link from "next/link";
import { getPayload } from "payload";
import { AdBanner } from "@/components/AdBanner";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

const SECONDARY = 3;
const FEED = 9;
const TOP_TAGS = 12;

export default async function HomePage() {
	const payload = await getPayload({ config: configPromise });

	const [featuredSet, allPosts, categoriesSet] = await Promise.all([
		payload.find({
			collection: "posts",
			draft: false,
			depth: 1,
			limit: 1 + SECONDARY + FEED,
			overrideAccess: false,
			sort: "-publishedAt",
			where: { _status: { equals: "published" } },
			select: {
				title: true,
				slug: true,
				heroImage: true,
				meta: true,
				categories: true,
				publishedAt: true,
			},
		}),
		payload.find({
			collection: "posts",
			draft: false,
			depth: 0,
			limit: 0,
			overrideAccess: false,
			select: { categories: true },
		}),
		payload.find({
			collection: "categories",
			limit: 0,
			depth: 0,
			sort: "title",
		}),
	]);

	const posts = featuredSet.docs;
	const featured = posts[0];
	const secondary = posts.slice(1, 1 + SECONDARY);
	const feed = posts.slice(1 + SECONDARY);

	// Top themes by number of linked posts
	const counts = new Map<number, number>();
	for (const p of allPosts.docs) {
		for (const c of p.categories ?? []) {
			const id = typeof c === "object" ? c.id : c;
			if (typeof id === "number") counts.set(id, (counts.get(id) ?? 0) + 1);
		}
	}
	const catById = new Map(categoriesSet.docs.map((c) => [c.id, c]));
	const topTags = [...catById.values()]
		.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))
		.filter((c) => c.count > 0)
		.sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "es"))
		.slice(0, TOP_TAGS);

	return (
		<div className="mx-auto max-w-6xl px-4 sm:px-6">
			{/* Portada: historia destacada + secundarias compactas */}
			{featured ? (
				<section
					aria-label="Portada"
					className="grid gap-x-8 gap-y-10 py-8 md:grid-cols-[7fr_5fr] md:items-start md:py-10"
				>
					<PostCard post={featured} variant="lead" loading="eager" />
					{secondary.length > 0 && (
						<div className="grid content-start gap-6 md:border-l md:border-rule md:pl-8">
							<p className="kicker text-fog">También destacamos</p>
							{secondary.map((post) => (
								<PostCard key={post.id} post={post} variant="compact" />
							))}
							<AdBanner className="mt-2 border-t border-rule pt-6" />
						</div>
					)}
				</section>
			) : (
				<section className="py-16 text-center">
					<h1 className="font-display text-3xl font-bold tracking-tight">
						Aún no hay artículos
					</h1>
					<p className="mt-2 text-fog">
						Publica tu primer artículo desde el panel.
					</p>
				</section>
			)}

			{/* Últimas noticias en tarjetas */}
			{feed.length > 0 && (
				<section aria-label="Últimas noticias" className="mt-6">
					<div className="grid gap-x-8 md:grid-cols-[7fr_5fr]">
						<div>
							<h2 className="font-display border-b-2 border-teal pb-2 text-lg font-bold uppercase tracking-wide">
								Últimas noticias
							</h2>
							<div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2">
								{feed.map((post) => (
									<PostCard key={post.id} post={post} />
								))}
							</div>
							{featuredSet.totalDocs > posts.length && (
								<p className="mt-8 border-t border-rule pt-5">
									<Link href="/posts/page/2" className="link-more text-sm">
										Ver todas las noticias
									</Link>
								</p>
							)}
						</div>

						<aside className="mt-10 hidden md:mt-[52px] md:block md:border-l md:border-rule md:pl-8">
							<h2 className="kicker border-b-2 border-teal pb-2 text-fog">
								Temas
							</h2>
							<ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
								{topTags.map((tag) => (
									<li key={tag.id}>
										<Link
											href={`/categorias/${tag.slug}`}
											className="inline-flex min-h-11 items-center border border-rule bg-paper px-3 kicker transition-colors duration-100 hover:border-teal hover:text-teal"
										>
											{tag.title}
										</Link>
									</li>
								))}
							</ul>
							<p className="mt-3">
								<Link href="/etiquetas" className="link-more text-sm">
									Todas las categorías
								</Link>
							</p>
							<div className="mt-8 border border-rule bg-paper-2 p-5">
								<p className="kicker text-teal">RSS</p>
								<p className="mt-2 text-sm leading-relaxed text-fog">
									Sigue todas las novedades en tu lector favorito.
								</p>
								<a
									href="/rss.xml"
									className="link-more mt-3 inline-block text-sm"
								>
									Suscribirse
								</a>
							</div>
						</aside>
					</div>
				</section>
			)}

			<AdBanner />
		</div>
	);
}
