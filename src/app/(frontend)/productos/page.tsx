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
		<div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
			<header className="grid gap-6 border-b-2 border-teal pb-7 md:grid-cols-[1fr_16rem] md:items-end">
				<div>
					<p className="kicker text-teal">Selección editorial · Amazon</p>
					<h1 className="font-display mt-3 max-w-2xl text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[0.98] tracking-tight">
						Herramientas que recomendamos
					</h1>
				</div>
				<p className="max-w-prose text-sm leading-relaxed text-fog md:pb-1">
					Una selección de productos relacionados con nuestras guías y análisis.
					Los precios y la disponibilidad pueden cambiar en Amazon.
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
