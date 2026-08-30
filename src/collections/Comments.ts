import type { CollectionConfig } from "payload";
import { APIError } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";

export const Comments: CollectionConfig = {
	slug: "comments",
	access: {
		create: anyone,
		delete: authenticated,
		read: anyone, // el frontend filtra por approved; el panel ve todo
		update: authenticated,
	},
	admin: {
		useAsTitle: "author",
		defaultColumns: ["author", "post", "approved", "createdAt"],
	},
	fields: [
		{
			name: "post",
			type: "relationship",
			relationTo: "posts",
			required: true,
		},
		{
			name: "author",
			type: "text",
			required: true,
			maxLength: 60,
		},
		{
			name: "email",
			type: "email",
			admin: {
				description: "Opcional, no se publica.",
			},
		},
		{
			name: "body",
			type: "textarea",
			required: true,
			maxLength: 2000,
		},
		{
			name: "approved",
			type: "checkbox",
			defaultValue: false,
			label: "Aprobado",
			admin: {
				position: "sidebar",
				description: "Solo los comentarios aprobados se muestran públicamente.",
			},
		},
		{
			// Honeypot anti-spam: debe llegar vacío
			name: "website",
			type: "text",
			hidden: true,
		},
	],
	hooks: {
		beforeOperation: [
			({ operation, args }) => {
				if (operation !== "create") return args;
				const data = args.data ?? {};
				if (data.website) throw new APIError("Comentario rechazado.", 400);
				if (!args.req.user) {
					// Limita la longitud de ráfagas simples desde la API pública
					data.author = String(data.author ?? "")
						.trim()
						.slice(0, 60);
					data.body = String(data.body ?? "")
						.trim()
						.slice(0, 2000);
				}
				return args;
			},
		],
	},
};
