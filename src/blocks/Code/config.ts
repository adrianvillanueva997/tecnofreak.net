import type { Block } from "payload";

export const Code: Block = {
	slug: "code",
	interfaceName: "CodeBlock",
	fields: [
		{
			name: "language",
			type: "select",
			defaultValue: "typescript",
			options: [
				{
					label: "Typescript",
					value: "typescript",
				},
				{
					label: "Javascript",
					value: "javascript",
				},
				{
					label: "CSS",
					value: "css",
				},
			],
		},
		{
			name: "code",
			type: "textarea",
			label: false,
			required: true,
			admin: {
				description: "Escribe o pega el código. Se formatea en el artículo según el lenguaje elegido.",
			},
		},
	],
};
