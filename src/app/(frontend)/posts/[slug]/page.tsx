import { permanentRedirect } from "next/navigation";

type Args = {
	params: Promise<{
		slug?: string;
	}>;
};

export default async function LegacyPost({ params: paramsPromise }: Args) {
	const { slug = "" } = await paramsPromise;
	permanentRedirect(`/${encodeURIComponent(slug)}`);
}
