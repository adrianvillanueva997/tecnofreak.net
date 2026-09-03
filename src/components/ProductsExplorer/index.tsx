"use client";

import type React from "react";
import { useMemo, useState } from "react";

import { ProductBoxBlock } from "@/blocks/ProductBox/Component";
import type { Product } from "@/payload-types";

export const ProductsExplorer: React.FC<{ products: Product[] }> = ({
	products,
}) => {
	const [query, setQuery] = useState("");
	const [brand, setBrand] = useState("Todas");
	const brands = [
		...new Set(
			products
				.map((product) => product.brand?.trim())
				.filter((value): value is string => Boolean(value)),
		),
	].sort((a, b) => a.localeCompare(b));

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q && brand === "Todas") return products;
		return products.filter((p) =>
			`${p.title} ${p.brand ?? ""}`.toLowerCase().includes(q) &&
				(brand === "Todas" || p.brand?.trim() === brand),
		);
	}, [products, query, brand]);
	const groups = filtered.reduce<Map<string, Product[]>>((result, product) => {
		const brand = product.brand?.trim() || "Otros";
		result.set(brand, [...(result.get(brand) ?? []), product]);
		return result;
	}, new Map());

	return (
		<>
			<div className="mt-8 flex flex-col gap-3 border-y border-rule py-4 sm:flex-row">
				<input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Filtrar por nombre o marca…"
					aria-label="Filtrar productos"
					className="min-h-11 w-full border border-rule bg-paper px-4 text-sm text-ink outline-none transition-colors duration-100 placeholder:text-fog/70 focus:border-teal sm:flex-1"
				/>
				{brands.length > 1 && (
					<select
						value={brand}
						onChange={(event) => setBrand(event.target.value)}
						aria-label="Filtrar por marca"
						className="min-h-11 border border-rule bg-paper px-4 text-sm text-ink outline-none focus:border-teal sm:w-52"
					>
						<option>Todas</option>
						{brands.map((item) => (
							<option key={item}>{item}</option>
						))}
					</select>
				)}
			</div>
			<p className="kicker mt-4 text-fog">
				{filtered.length} {filtered.length === 1 ? "producto" : "productos"}
			</p>

			<div className="mt-8 space-y-10">
				{[...groups.entries()]
					.sort(([brandA], [brandB]) => brandA.localeCompare(brandB))
					.map(([brand, brandProducts]) => (
					<section key={brand}>
						<h2 className="font-display border-b-2 border-teal pb-2 text-xl font-bold">
							{brand}
						</h2>
						<div className="mt-5">
							{brandProducts.map((p) => (
								<ProductBoxBlock key={p.id} product={p} />
							))}
						</div>
					</section>
					))}
				{filtered.length === 0 && (
					<p className="kicker mt-4 text-fog">
						{query
							? "Ningún producto coincide con tu búsqueda."
							: "Aún no hay productos."}
					</p>
				)}
			</div>
		</>
	);
};
