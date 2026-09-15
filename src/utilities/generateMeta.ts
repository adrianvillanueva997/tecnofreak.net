import type { Metadata } from "next";

import type { Config, Media, Page, Post } from "../payload-types";
import { getServerSideURL } from "./getURL";
import { mergeOpenGraph } from "./mergeOpenGraph";

const getImageURL = (image?: Media | Config["db"]["defaultIDType"] | null) => {
	const serverUrl = getServerSideURL();

	let url = `${serverUrl}/website-template-OG.webp`;

	if (image && typeof image === "object" && "url" in image) {
		const ogUrl = image.sizes?.og?.url;

		url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url;
	}

	return url;
};

export const generateMeta = async (args: {
	doc: Partial<Page> | Partial<Post> | null;
}): Promise<Metadata> => {
	const { doc } = args;

	const ogImage = getImageURL(doc?.meta?.image);
	const path =
		doc?.slug === "home" ? "/" : typeof doc?.slug === "string" ? `/${doc.slug}` : "/";
	const description =
		doc?.meta?.description ||
		(typeof doc?.title === "string"
			? `${doc.title} en tecnofreak.net.`
			: "Noticias, análisis y opiniones sobre tecnología en español.");

	const title = doc?.meta?.title
		? doc.meta.title
		: doc?.title || "tecnofreak.net";

	return {
		alternates: { canonical: path },
		description,
		openGraph: mergeOpenGraph({
			description,
			images: ogImage
				? [
						{
							url: ogImage,
							alt: title,
						},
					]
				: undefined,
			title,
			url: path,
		}),
		title,
		twitter: { card: "summary_large_image", title, description },
	};
};
