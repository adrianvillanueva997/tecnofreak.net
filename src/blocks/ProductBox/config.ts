import type { Block } from "payload";

export const ProductBox: Block = {
	slug: "productBox",
	interfaceName: "ProductBoxBlock",
	labels: {
		singular: "Producto Amazon",
		plural: "Productos Amazon",
	},
	fields: [
		{
			name: "product",
			type: "relationship",
			relationTo: "products",
			required: true,
			admin: {
				description:
					"Producto de la colección Productos; se muestra como tarjeta en el artículo.",
			},
		},
	],
};
