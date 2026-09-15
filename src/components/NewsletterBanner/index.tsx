import Link from "next/link";

export function NewsletterBanner() {
	return (
		<section
			aria-labelledby="newsletter-banner-title"
			className="mt-12 border-y-2 border-teal bg-teal-soft px-5 py-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-7"
		>
			<div>
				<p className="kicker text-teal">Mantente al día</p>
				<h2
					id="newsletter-banner-title"
					className="font-display mt-2 text-xl font-bold tracking-tight text-ink"
				>
					Recibe los nuevos artículos
				</h2>
				<p className="mt-2 max-w-xl text-sm leading-relaxed text-fog">
					Suscríbete al feed RSS de tecnofreak.net y sigue las novedades sin perderte
					nada.
				</p>
			</div>
			<Link
				href="/rss.xml"
				className="mt-5 inline-flex min-h-11 shrink-0 items-center justify-center bg-teal px-5 text-sm font-semibold text-paper transition-colors duration-100 hover:bg-ink sm:mt-0"
			>
				Suscribirme al RSS
			</Link>
		</section>
	);
}
