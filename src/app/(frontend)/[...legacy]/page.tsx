import configPromise from "@payload-config";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { PayloadRedirects } from "@/components/PayloadRedirects";

type Args = {
	params: Promise<{
		legacy: string[];
	}>;
};

/** Catches legacy WordPress-style URLs (/2018/04/slug, /slug.html, …)
 * and redirects to the matching post by final path segment. */
export default async function LegacyRedirect({ params: paramsPromise }: Args) {
	const { legacy = [] } = await paramsPromise;

	const last = decodeURIComponent(legacy[legacy.length - 1] ?? "")
		.replace(/\.html?$/i, "")
		.trim();

	if (last && !last.includes("?")) {
		const payload = await getPayload({ config: configPromise });
		const match = await payload.find({
			collection: "posts",
			depth: 0,
			limit: 1,
			overrideAccess: false,
			select: { slug: true },
			where: {
				and: [{ slug: { equals: last } }, { _status: { equals: "published" } }],
			},
		});
		if (match.docs[0]) redirect(`/posts/${match.docs[0].slug}`);
	}

	return <PayloadRedirects url={`/${legacy.join("/")}`} />;
}
