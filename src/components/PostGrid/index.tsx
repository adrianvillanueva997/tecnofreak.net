import type React from "react";

import { type CardPostData, PostCard } from "@/components/PostCard";

export const PostGrid: React.FC<{ posts: CardPostData[] }> = ({ posts }) => {
	return (
		<div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
			{posts.map((post, i) => (
				<PostCard key={i} post={post} />
			))}
		</div>
	);
};
