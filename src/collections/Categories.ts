import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";

export const Categories: CollectionConfig = {
	slug: "categories",
	access: {
		create: authenticated,
		delete: authenticated,
		read: anyone,
		update: authenticated,
	},
	admin: {
		useAsTitle: "title",
	},
	fields: [
		{
			name: "title",
			type: "text",
			required: true,
		},
		{
			name: "parent",
			type: "relationship",
			admin: {
				position: "sidebar",
			},
			relationTo: "categories",
		},
		slugField({
			position: undefined,
		}),
	],
};
