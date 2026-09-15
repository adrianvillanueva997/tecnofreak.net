import { getServerSideURL } from "@/utilities/getURL";

export const dynamic = "force-dynamic";

export function GET() {
	const siteURL = getServerSideURL();
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${siteURL}/pages-sitemap.xml</loc></sitemap>
  <sitemap><loc>${siteURL}/posts-sitemap.xml</loc></sitemap>
</sitemapindex>`;

	return new Response(xml, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
}
