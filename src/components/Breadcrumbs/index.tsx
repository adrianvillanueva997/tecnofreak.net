import Link from "next/link";
import type { Category } from "@/payload-types";

type Props = {
	category: Category | null;
	tags?: Array<{ id: number; title: string; slug: string }>;
	className?: string;
};

export const Breadcrumbs: React.FC<Props> = ({
	category,
	tags = [],
	className,
}) => {
	const crumbs: Array<{ label: string; href: string }> = [];

	if (category) {
		const chain = category.breadcrumbs?.length
			? category.breadcrumbs
			: category.parent && typeof category.parent === "object"
				? [
						{
							label: (category.parent as Category).title,
							url: (category.parent as Category).slug
								? `/${(category.parent as Category).slug}`
								: undefined,
						},
						{ label: category.title, url: `/${category.slug}` },
					]
				: [{ label: category.title, url: `/${category.slug}` }];

		for (const b of chain) {
			if (!b.label || !b.url) continue;
			crumbs.push({ label: b.label, href: `/etiquetas${b.url}` });
		}

		const expectedLastHref = `/etiquetas/${category.slug}`;
		const alreadyHasLast = crumbs.some((c) => c.href === expectedLastHref);
		if (!alreadyHasLast) {
			crumbs.push({ label: category.title, href: expectedLastHref });
		}
	}

	return (
		<nav
			aria-label="Migas de pan"
			className={`flex items-center gap-2 rounded-md border bg-paper/50 px-3 py-1.5 ${className ?? ""}`}
		>
			<ol className="flex flex-wrap items-center gap-0.5">
				{crumbs.map((c, i) => {
					const isLast = i === crumbs.length - 1;
					return (
						<li key={c.href} className="flex items-center gap-1">
							{isLast ? (
								<Link
									href={c.href}
									className="text-[var(--color-ink)] font-medium hover:text-[var(--color-teal)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-[var(--color-paper)] rounded"
								>
									{c.label}
								</Link>
							) : i === 0 ? (
								<Link
									href={c.href}
									className="text-[var(--color-teal)] hover:text-[var(--color-ink)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-[var(--color-paper)] rounded"
								>
									{c.label}
								</Link>
							) : (
								<>
									<Link
										href={c.href}
										className="text-[var(--color-teal)] hover:text-[var(--color-ink)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-[var(--color-paper)] rounded"
									>
										{c.label}
									</Link>
									<span
										aria-hidden="true"
										className="text-[var(--color-fog)] opacity-60"
									>
										/
									</span>
								</>
							)}
						</li>
					);
				})}
			</ol>

			{tags.length > 0 && (
				<>
					<span
						aria-hidden="true"
						className="text-[var(--color-fog)] opacity-60 mr-1 hidden sm:inline"
					>
						·
					</span>
					<ul className="flex flex-wrap items-center gap-1.5">
						{tags.map((t) => (
							<li key={t.id}>
								<Link
									href={`/etiquetas/${t.slug}`}
									className="rounded-full border border-[var(--color-rule)] px-2 py-0.5 text-xs font-medium text-[var(--color-fog)] transition-all duration-100 hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] hover:bg-[var(--color-paper-1)] focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-[var(--color-paper)]"
								>
									{t.title}
								</Link>
							</li>
						))}
					</ul>
				</>
			)}
		</nav>
	);
};
