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
		<nav
			aria-label="Migas de pan"
			className={`rounded-md border border-rule bg-paper-2 px-3 py-2 ${className ?? ""}`}
		>
			<ol className="flex flex-wrap items-center gap-1.5">
				{crumbs.map((c, i) => {
					const isLast = i === crumbs.length - 1;
					return (
						<li key={c.href} className="flex items-center gap-1.5">
							{isLast ? (
								<span
									aria-current="page"
									className="kicker text-ink font-bold"
								>
									{c.label}
								</span>
							) : (
								<Link
									href={c.href}
									className="kicker text-teal underline decoration-teal/30 underline-offset-4 transition-colors duration-100 hover:text-ink hover:decoration-teal"
								>
									{c.label}
								</Link>
							)}
							{!isLast && (
								<span
									aria-hidden="true"
									className="text-fog opacity-40 text-xs leading-none"
								>
									›
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};
