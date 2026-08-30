import type {
	DefaultNodeTypes,
	DefaultTypedEditorState,
	SerializedBlockNode,
	SerializedLinkNode,
} from "@payloadcms/richtext-lexical";
import {
	RichText as ConvertRichText,
	type JSXConvertersFunction,
	LinkJSXConverter,
} from "@payloadcms/richtext-lexical/react";
import { BannerBlock } from "@/blocks/Banner/Component";
import { CallToActionBlock } from "@/blocks/CallToAction/Component";

import { CodeBlock, type CodeBlockProps } from "@/blocks/Code/Component";
import { MediaBlock } from "@/blocks/MediaBlock/Component";
import { ProductBoxBlock } from "@/blocks/ProductBox/Component";
import { Media } from "@/components/Media";
import type {
	BannerBlock as BannerBlockProps,
	CallToActionBlock as CTABlockProps,
	MediaBlock as MediaBlockProps,
	ProductBoxBlock as ProductBoxBlockProps,
} from "@/payload-types";
import { cn } from "@/utilities/ui";

type NodeTypes =
	| DefaultNodeTypes
	| SerializedBlockNode<
			| CTABlockProps
			| MediaBlockProps
			| BannerBlockProps
			| CodeBlockProps
			| ProductBoxBlockProps
	  >;

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
	const { value, relationTo } = linkNode.fields.doc!;
	if (typeof value !== "object") {
		throw new Error("Expected value to be an object");
	}
	const slug = value.slug;
	return relationTo === "posts" ? `/posts/${slug}` : `/${slug}`;
};

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({
	defaultConverters,
}) => ({
	...defaultConverters,
	...LinkJSXConverter({ internalDocToHref }),
	upload: ({ node }: any) => {
		const uploadDoc = node?.value;
		if (!uploadDoc || typeof uploadDoc !== "object") return null;
		const url = (uploadDoc as any).url as string | undefined;
		// Non-image files: render as link (parity with Payload default)
		if (!(uploadDoc as any).mimeType?.startsWith("image")) {
			return (
				<a href={url} rel="noopener noreferrer">
					{(uploadDoc as any).filename}
				</a>
			);
		}
		return (
			<Media
				resource={uploadDoc as any}
				size="(max-width: 768px) 100vw, 650px"
				imgClassName="h-auto w-full"
				pictureClassName="my-6 block max-w-full"
			/>
		);
	},
	blocks: {
		banner: ({ node }) => (
			<BannerBlock className="col-start-2 mb-4" {...node.fields} />
		),
		mediaBlock: ({ node }) => (
			<MediaBlock
				className="col-start-1 col-span-3"
				imgClassName="m-0"
				{...node.fields}
				captionClassName="mx-auto max-w-[48rem]"
				enableGutter={false}
				disableInnerContainer={true}
			/>
		),
		code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
		cta: ({ node }) => <CallToActionBlock {...node.fields} />,
		productBox: ({ node }) => <ProductBoxBlock {...node.fields} />,
	},
});

type Props = {
	data: DefaultTypedEditorState;
	enableGutter?: boolean;
	enableProse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function RichText(props: Props) {
	const { className, enableProse = true, enableGutter = true, ...rest } = props;
	return (
		<ConvertRichText
			converters={jsxConverters}
			className={cn(
				"payload-richtext",
				{
					container: enableGutter,
					"max-w-none": !enableGutter,
					"mx-auto prose md:prose-md dark:prose-invert": enableProse,
				},
				className,
			)}
			{...rest}
		/>
	);
}
