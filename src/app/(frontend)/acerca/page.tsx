import Link from "next/link";
import type { Metadata } from "next/types";

export const metadata: Metadata = {
	title: "Acerca de",
	description: "Qué es tecnofreak.net y cómo está hecho.",
};

export default function Acerca() {
	return (
		<div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 pb-16">
			<p className="kicker text-teal">Sobre el sitio</p>
			<h1 className="font-display mt-3 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
				Acerca de tecnofreak.net
			</h1>

			<div className="prose mx-auto mt-8">
				<p>
					tecnofreak.net es un blog independiente sobre tecnología en español:
					noticias del sector, análisis de gadgets y software, y opiniones sin
					ruido ni jerga innecesaria.
				</p>
				<p>
					Si quieres seguir las novedades, suscríbete al{" "}
					<a href="/rss.xml">feed RSS</a> o explora los artículos por{" "}
					<Link href="/etiquetas">etiqueta</Link>.
				</p>
			</div>
		</div>
	);
}
