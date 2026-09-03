import type { BeforeSync, DocToSync } from "@payloadcms/plugin-search/types";

export const beforeSyncWithSearch: BeforeSync = async ({
	req,
	originalDoc,
	searchDoc,
}) => {
	const {
		doc: { relationTo: collection },
	} = searchDoc;

	const { slug, id, categories, tags, title, meta } = originalDoc;

	const modifiedDoc: DocToSync = {
		...searchDoc,
		slug,
		meta: {
			...meta,
			title: meta?.title || title,
			image: meta?.image?.id || meta?.image,
			description: meta?.description,
		},
		categories: [],
		tags: [],
	};

	if (categories && Array.isArray(categories) && categories.length > 0) {
		const populatedCategories: { id: string | number; title: string }[] = [];
		for (const category of categories) {
			if (!category) {
				continue;
			}

			if (typeof category === "object") {
				populatedCategories.push(category);
				continue;
			}

			const doc = await req.payload.findByID({
				collection: "categories",
				id: category,
				disableErrors: true,
				depth: 0,
				select: { title: true },
				req,
			});

			if (doc !== null) {
				populatedCategories.push(doc);
			} else {
				console.error(
					`Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`,
				);
			}
		}

		modifiedDoc.categories = populatedCategories.map((each) => ({
			relationTo: "categories",
			categoryID: String(each.id),
			title: each.title,
		}));
	}

	if (tags && Array.isArray(tags) && tags.length > 0) {
		const populatedTags: { id: string | number; title: string }[] = [];
		for (const tag of tags) {
			if (!tag) continue;
			if (typeof tag === "object") {
				populatedTags.push(tag);
				continue;
			}

			const doc = await req.payload.findByID({
				collection: "tags",
				id: tag,
				disableErrors: true,
				depth: 0,
				select: { title: true },
				req,
			});

			if (doc !== null) populatedTags.push(doc);
		}

		modifiedDoc.tags = populatedTags.map((each) => ({
			relationTo: "tags",
			tagID: String(each.id),
			title: each.title,
		}));
	}

	return modifiedDoc;
};
