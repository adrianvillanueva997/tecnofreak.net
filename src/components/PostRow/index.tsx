import Link from "next/link";
import type React from "react";
import { Media } from "@/components/Media";
import type { Post } from "@/payload-types";
import { formatDate } from "@/utilities/formatDate";

export type PostRowData = Pick<
	Post,
	"slug" | "title" | "heroImage" | "categories" | "publishedAt"
>;

export const PostRow: React.FC<{ post: PostRowData; first?: boolean }> = ({
	post,
	first = false,
}) => {
	const tag =
		post.categories &&
		Array.isArray(post.categories) &&
		typeof post.categories[0] === "object"
			? (post.categories[0] as { title: string })
			: null;
	const hero = post.heroImage && typeof post.heroImage === "object" ? post.heroImage : null;

	return (
		<li className={`border-b border-rule ${first ? "border-t" : ""}`}>
			<Link
				href={`/posts/${post.slug}`}
				className="group grid grid-cols-[5rem_1fr] items-center gap-x-4 py-4 sm:grid-cols-[7rem_8.5rem_1fr_auto]"
			>
				<div className="relative row-span-2 aspect-video overflow-hidden bg-paper-2 sm:row-span-1">
					{hero ? (
						<Media
							resource={hero}
							className="absolute inset-0 h-full w-full"
							imgClassName="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
							size="(min-width: 640px) 7rem, 5rem"
						/>
					) : (
						<span aria-hidden="true" className="tile-letter absolute -bottom-2 right-1 text-[3rem]">
							{post.title.charAt(0).toUpperCase()}
						</span>
					)}
				</div>
				<time
					className="kicker col-start-2 row-start-2 text-fog sm:col-start-2 sm:row-start-1"
					dateTime={post.publishedAt ?? undefined}
				>
					{formatDate(post.publishedAt)}
				</time>
				<span className="col-start-2 row-start-1 font-display text-lg font-medium leading-snug tracking-tight transition-colors duration-100 group-hover:text-teal sm:col-start-3">
					{post.title}
				</span>
				{tag && (
					<span className="kicker hidden text-right text-fog sm:col-start-4 sm:inline">
						{tag.title}
					</span>
				)}
			</Link>
		</li>
	);
};
