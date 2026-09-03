import type React from "react";

import { Media } from "@/components/Media";
import type { Product } from "@/payload-types";
import { buildAmazonUrl } from "@/utilities/amazon";

type Props = {
	className?: string;
	product: Product | number | null;
	imgClassName?: string;
};

/** Tarjeta-banner de producto afiliado. Debe recibir el producto poblado (depth ≥ 1);
 *  si la imagen llega solo como ID se muestra la losa tipográfica. */
export const ProductBoxBlock: React.FC<Props> = ({ product }) => {
	if (!product || typeof product === "number") return null;

	// Títulos estilo Amazon traen especificaciones tras «|»: mostramos solo el nombre principal
	const [mainTitle] = product.title.split("|");
	const cardTitle = (mainTitle || product.title).trim();

	return (
		<article className="not-prose group my-6 break-words overflow-hidden border-t-2 border-teal bg-paper transition-colors duration-100 hover:bg-paper-2">
			<div className="flex h-full flex-col sm:flex-row">
				<div className="flex aspect-[4/3] w-full items-center justify-center bg-white p-5 sm:aspect-auto sm:w-36 sm:shrink-0 sm:self-stretch">
					{product.image && typeof product.image === "object" ? (
						<Media
							resource={product.image}
							className="h-full w-full"
							imgClassName="max-h-full min-h-0 w-full object-contain"
						/>
					) : (
						<span
							aria-hidden="true"
							className="tile-letter select-none text-[5rem]"
						>
							{product.title.charAt(0).toUpperCase()}
						</span>
					)}
				</div>

				<div className="flex min-w-0 grow flex-col p-5">
					{product.brand && <p className="kicker text-teal">{product.brand}</p>}
					<h3
						className="font-display mt-1 line-clamp-3 text-lg font-bold leading-snug tracking-tight text-ink transition-colors duration-100 group-hover:text-teal sm:text-xl"
						title={product.title}
					>
						{cardTitle}
					</h3>
					{product.features && (
						<ul className="m-0 mt-3 list-none space-y-1 p-0 text-sm leading-relaxed text-fog">
							{product.features
								.split("\n")
								.filter(Boolean)
								.slice(0, 2)
								.map((f, i) => (
									<li key={i} className="flex gap-2">
										<span aria-hidden="true" className="text-teal">
											✓
										</span>
										{f.trim()}
									</li>
								))}
						</ul>
					)}
				</div>

				<div className="flex items-center justify-between gap-4 border-t border-rule px-5 py-4 sm:flex-col sm:items-stretch sm:justify-center sm:gap-3 sm:border-l sm:border-t-0 sm:p-5">
					<div className="min-w-0">
						{product.price ? (
							<p className="font-display text-xl font-bold leading-none">
								{product.price}
							</p>
						) : (
							<p className="kicker text-fog">Disponible en Amazon</p>
						)}
						<p className="kicker mt-1 text-fog/70">Enlace afiliado</p>
					</div>
					<a
						href={buildAmazonUrl(product.asin)}
						target="_blank"
						rel="sponsored nofollow noopener"
						className="inline-flex h-11 grow items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-colors duration-100 hover:bg-teal md:grow-0"
					>
						Ver en Amazon
						<svg
							viewBox="0 0 24 24"
							width="14"
							height="14"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							aria-hidden="true"
						>
							<path d="M7 17 17 7M9 7h8v8" />
						</svg>
					</a>
				</div>
			</div>
		</article>
	);
};
