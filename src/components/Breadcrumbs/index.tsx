import Link from "next/link";
import type { Category } from "@/payload-types";

type Props = {
	category: Category | null;
	className?: string;
};

// Responsive breadcrumb separator constants
const SEPARATOR = ">";
const MOBILE_WRAP_BREAKPOINT = "sm";

export const Breadcrumbs: React.FC<Props> = ({ category, className }) => {
	const crumbs: Array<{ label: string; href: string }> = [
		{ label: "Inicio", href: "/" },
	];

	if (category) {
		// Build hierarchy from nestedDocs breadcrumbs, mapped under /etiquetas
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

		// Ensure the current category page is always the last crumb
		const expectedLastHref = `/etiquetas/${category.slug}`;
		const alreadyHasLast = crumbs.some((c) => c.href === expectedLastHref);
		if (!alreadyHasLast) {
			crumbs.push({ label: category.title, href: expectedLastHref });
		}
	}

	// Determine if we're on a narrow viewport where we should stack vertically
	const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

	return (
		<nav
			aria-label="Migas de pan"
			className={`
				rounded-md border border-rule bg-paper-2 px-3 py-2 flex flex-col sm:flex-row gap-2 ${className ?? ""}
				shadow-sm transition-colors duration-200 hover:border-teal/30
			`}
		>
			<ol className={`
				flex flex-col sm:flex-row gap-1.5 text-sm ${isMobile ? "w-full" : "gap-2"}
				`}
			>
				{crumbs.map((c, i) => {
					const isLast = i === crumbs.length - 1;
					const isFirst = i === 0;

					return (
						<li
							key={c.href}
							className={`
								flex items-center gap-1.5 ${isFirst && "pr-1"}
								${isLast && "text-center"}
							`}
						>
							{isLast ? (
								// Current page - primary action
								<Link
									href={c.href}
									className={`
										text-ink font-medium
										${isMobile ? "hover:text-teal hover:underline" : "hover:text-teal hover:underline decoration-teal/30"}
										focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-paper-2
									`}
									aria-current="page"
								>
									{c.label}
								</Link>
							) : (
								// Intermediate crumb - link
								<Link
									href={c.href}
									className={`
										text-teal underline underline-offset-4
										hover:text-ink hover:decoration-ink
										 focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-paper-2
									`}
								>
									{c.label}
								</Link>
							)}
							{!isLast && (
								// Separator between crumbs
								<span
									aria-hidden="true"
									className={`
										text-fog/60
										${isMobile ? "hidden" : "block"}
										text-xs leading-none
									`}
								>
									{SEPARATOR}
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};