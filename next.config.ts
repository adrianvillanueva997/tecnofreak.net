import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

import { redirects } from "./redirects";

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
	? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
	: process.env.__NEXT_PRIVATE_ORIGIN || "http://localhost:3000";

const nextConfig: NextConfig = {
	compress: true,
	poweredByHeader: false,
	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"prism-react-renderer",
			"@payloadcms/richtext-lexical",
		],
	},
	// Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
	// See: https://github.com/vercel/next.js/issues/86431
	sassOptions: {
		loadPaths: ["./node_modules/@payloadcms/ui/dist/scss/"],
	},
	images: {
		contentDispositionType: "inline",
		localPatterns: [
			{
				pathname: "/api/media/file/**",
			},
			{
				pathname: "/media/**",
			},
		],
		formats: ["image/webp"],
		qualities: [75, 85, 100],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 31536000,
		remotePatterns: [
			...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
				const url = new URL(item);

				return {
					hostname: url.hostname,
					protocol: url.protocol.replace(":", "") as "http" | "https",
				};
			}),
		],
	},
	async headers() {
		return [
			{
				source: "/media/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/api/media/file/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
	webpack: (webpackConfig) => {
		webpackConfig.resolve.extensionAlias = {
			".cjs": [".cts", ".cjs"],
			".js": [".ts", ".tsx", ".js", ".jsx"],
			".mjs": [".mts", ".mjs"],
		};

		return webpackConfig;
	},
	reactStrictMode: true,
	redirects,
	turbopack: {
		root: path.resolve(dirname),
	},
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
