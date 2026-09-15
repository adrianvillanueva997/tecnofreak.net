import { revalidatePath, revalidateTag } from "next/cache";
import type {
	CollectionAfterChangeHook,
	CollectionAfterDeleteHook,
} from "payload";

import type { Post } from "../../../payload-types";
import { createSlugRedirect } from "../../../utilities/createSlugRedirect";

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
	doc,
	previousDoc,
	req: { payload, context },
}) => {
	if (!context.disableRevalidate) {
		if (
			previousDoc?._status === "published" &&
			doc._status === "published" &&
			previousDoc.slug !== doc.slug
		) {
			await createSlugRedirect({
				payload,
				from: `/${previousDoc.slug}`,
				to: `/${doc.slug}`,
			});
			revalidatePath(`/${previousDoc.slug}`);
		}

		if (doc._status === "published") {
			const path = `/${doc.slug}`;

			payload.logger.info(`Revalidating post at path: ${path}`);

			revalidatePath(path);
			revalidateTag("posts-sitemap", "max");
		}

		// If the post was previously published, we need to revalidate the old path
		if (previousDoc?._status === "published" && doc._status !== "published") {
			const oldPath = `/${previousDoc.slug}`;

			payload.logger.info(`Revalidating old post at path: ${oldPath}`);

			revalidatePath(oldPath);
			revalidateTag("posts-sitemap", "max");
		}
	}
	return doc;
};

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({
	doc,
	req: { context },
}) => {
	if (!context.disableRevalidate) {
		const path = `/${doc?.slug}`;

		revalidatePath(path);
		revalidateTag("posts-sitemap", "max");
	}

	return doc;
};
