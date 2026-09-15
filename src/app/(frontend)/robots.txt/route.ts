import { getServerSideURL } from "@/utilities/getURL";

export const dynamic = "force-dynamic";

export function GET() {
	const siteURL = getServerSideURL();
	const body = `User-agent: *
Disallow: /admin
Disallow: /api
Disallow: /search
Sitemap: ${siteURL}/sitemap.xml
`;

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
