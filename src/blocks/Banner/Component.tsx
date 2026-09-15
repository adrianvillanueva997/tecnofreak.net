import type React from "react";
import RichText from "@/components/RichText";
import type { BannerBlock as BannerBlockProps } from "@/payload-types";
import { cn } from "@/utilities/ui";

type Props = {
	className?: string;
} & BannerBlockProps;

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
	return (
		<div className={cn("mx-auto my-8 w-full", className)}>
			<div
				className={cn("border py-3 px-6 flex items-center rounded bg-paper-2 text-ink", {
					"border-border": style === "info",
					"border-error": style === "error",
					"border-success": style === "success",
					"border-warning": style === "warning",
				})}
			>
				<RichText data={content} enableGutter={false} enableProse={false} />
			</div>
		</div>
	);
};
