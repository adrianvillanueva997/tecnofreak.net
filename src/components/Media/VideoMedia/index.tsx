"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { getMediaUrl } from "@/utilities/getMediaUrl";
import { cn } from "@/utilities/ui";
import type { Props as MediaProps } from "../types";

export const VideoMedia: React.FC<MediaProps> = (props) => {
	const { onClick, resource, videoClassName } = props;

	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		if ("IntersectionObserver" in window) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const source = video.querySelector("source");
							if (source && (source as HTMLSourceElement).dataset.src) {
								const src = (source as HTMLSourceElement).dataset.src;
								if (src) (source as HTMLSourceElement).src = src;
								video.load();
							}
							observer.unobserve(video);
						}
					});
				},
				{ rootMargin: "200px" },
			);
			observer.observe(video);
			return () => observer.disconnect();
		}
	}, []);

	if (resource && typeof resource === "object") {
		const { filename, url, thumbnailURL } = resource as any;
		const src = url ? getMediaUrl(url) : getMediaUrl(`/media/${filename}`);
		const poster = thumbnailURL ? getMediaUrl(thumbnailURL) : undefined;

		return (
			<video
				autoPlay
				className={cn("h-auto max-w-full w-full", videoClassName)}
				controls={false}
				loop
				muted
				onClick={onClick}
				playsInline
				preload="metadata"
				poster={poster}
				ref={videoRef}
			>
				<source data-src={src} src={src} />
			</video>
		);
	}

	return null;
};
