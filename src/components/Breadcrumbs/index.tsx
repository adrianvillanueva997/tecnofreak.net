import Link from "next/link";
import type { Category } from "@/payload-types";

type Props = {
	category: Category | null;
	className?: string;
};

export const Breadcrumbs: React.FC<Props> = ({ category, className }) => {
	const crumbs: Array<{ label: string; href: string }> = [
		{ label: "Inicio", href: "/" },
	];

	if (category) {
		// plugin breadcrumbs are like [{label:"Consoles", url:"/consoles"}, {label:"Sony", url:"/consoles/sony"}, ...]
		// map to /etiquetas prefix
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

		// Ensure current category is last (when breadcrumbs empty or incomplete)
		const last = crumbs[crumbs.length - 1];
		const expectedHref = `/etiquetas/${category.slug}`;
		if (last.href !== expectedHref) {
			// Avoid duplicate if already added
			if (!crumbs.some((c) => c.href === expectedHref)) {
				crumbs.push({ label: category.title, href: expectedHref });
			}
		}
	}

	return (
		<nav aria-label="Migas de pan" className={className}>
			<ol className="flex flex-wrap items-center gap-1.5">
				{crumbs.map((c, i) => {
					const isLast = i === crumbs.length - 1;
					return (
						<li key={c.href} className="flex items-center gap-1.5">
							{isLast ? (
								<span
									aria-current="page"
									className="kicker text-ink"
								>
									{c.label}
								</span>
							) : (
								<Link
									href={c.href}
									className="kicker text-fog transition-colors duration-100 hover:text-teal"
								>
									{c.label}
								</Link>
							)}
							{!isLast && (
								<span aria-hidden="true" className="kicker text-fog opacity-50">
									/
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};
