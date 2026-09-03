import configPromise from "@payload-config";
import type { Metadata } from "next/types";
import { getPayload } from "payload";
import { ProductsExplorer } from "@/components/ProductsExplorer";

export const dynamic = "force-dynamic";

export default async function Productos() {
	const payload = await getPayload({ config: configPromise });
	const products = await payload.find({
		collection: "products",
		depth: 1,
		limit: 0,
		sort: "title",
	});

	return (
		<div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 pb-16">
			<header className="border-b-2 border-teal pb-5">
				<p className="kicker text-teal">Recomendados por tecnofreak.net</p>
				<h1 className="font-display mt-3 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
					Productos destacados
				</h1>
				<p className="mt-3 max-w-prose text-sm leading-relaxed text-fog">
					Gadgets, componentes y herramientas que merecen la pena, con enlace
					directo a Amazon. Los precios se revisan periódicamente y pueden
					variar.
				</p>
			</header>

			<ProductsExplorer products={products.docs} />

			<p className="kicker mt-10 text-fog">
				Como afiliado de Amazon, tecnofreak.net percibe una comisión por las
				compras cualificadas. Esto no afecta al precio que pagas.
			</p>
		</div>
	);
}

export function generateMetadata(): Metadata {
	return {
		title: "Productos destacados",
		description:
			"Gadgets y herramientas recomendadas en tecnofreak.net, con enlaces de afiliado.",
	};
}
