/**
 * Rebuilds Payload taxonomy relationships from a WordPress WXR export.
 *
 * Run:
 *   pnpm payload run scripts/migrate-wordpress-taxonomy.ts
 *   pnpm payload run scripts/migrate-wordpress-taxonomy.ts --dry-run
 *
 * Override the input file with WORDPRESS_EXPORT_FILE.
 */

import fs from "node:fs";
import path from "node:path";
import configPromise from "@payload-config";
import { getPayload } from "payload";

const inputFile =
	process.env.WORDPRESS_EXPORT_FILE ??
	path.resolve("backup/WordPress.2026-08-23.xml");
const dryRun = process.argv.includes("--dry-run");

type Taxonomy = "category" | "post_tag";
type Collection = "categories" | "tags";

type Term = {
	taxonomy: Taxonomy;
	slug: string;
	title: string;
};

type WordPressPost = {
	slug: string;
	terms: Array<{ taxonomy: Taxonomy; slug: string }>;
};

function collectionFor(taxonomy: Taxonomy): Collection {
	return taxonomy === "category" ? "categories" : "tags";
}

function valueOf(block: string, name: string): string {
	const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(
		block,
	);
	if (!match) return "";
	return match[1]
		.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.trim();
}

function parseTerms(xml: string): Term[] {
	const terms: Term[] = [];
	const definitions = [
		{
			tag: "wp:category",
			taxonomy: "category" as const,
			slug: "wp:category_nicename",
			title: "wp:cat_name",
		},
		{
			tag: "wp:tag",
			taxonomy: "post_tag" as const,
			slug: "wp:tag_slug",
			title: "wp:tag_name",
		},
	];

	for (const definition of definitions) {
		const re = new RegExp(
			`<${definition.tag}>([\\s\\S]*?)</${definition.tag}>`,
			"g",
		);
		for (const match of xml.matchAll(re)) {
			const block = match[1];
			const slug = valueOf(block, definition.slug);
			const title = valueOf(block, definition.title);
			if (slug && title)
				terms.push({ taxonomy: definition.taxonomy, slug, title });
		}
	}
	return terms;
}

function parsePosts(xml: string): WordPressPost[] {
	const posts: WordPressPost[] = [];
	for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
		const block = match[1];
		if (valueOf(block, "wp:post_type") !== "post") continue;
		const slug = valueOf(block, "wp:post_name");
		if (!slug) continue;

		const terms: WordPressPost["terms"] = [];
		for (const term of block.matchAll(
			/<category\s+domain="(category|post_tag)"\s+nicename="([^"]+)"[^>]*>([\s\S]*?)<\/category>/g,
		)) {
			terms.push({ taxonomy: term[1] as Taxonomy, slug: term[2] });
		}
		posts.push({ slug, terms });
	}
	return posts;
}

async function main() {
	const xml = fs.readFileSync(inputFile, "utf8");
	const terms = parseTerms(xml);
	const sourcePosts = parsePosts(xml);
	const payload = await getPayload({ config: configPromise });
	const termIds = new Map<string, number>();

	for (const term of terms) {
		const collection = collectionFor(term.taxonomy);
		const key = `${term.taxonomy}:${term.slug}`;
		if (termIds.has(key)) continue;

		const existing = await payload.find({
			collection,
			limit: 1,
			depth: 0,
			where: { slug: { equals: term.slug } },
		});
		if (existing.docs[0]) {
			termIds.set(key, existing.docs[0].id);
			continue;
		}
		if (!dryRun) {
			const created = await payload.create({
				collection,
				data: { title: term.title, slug: term.slug },
				context: { disableRevalidate: true },
			});
			termIds.set(key, created.id);
		}
	}

	let matched = 0;
	let updated = 0;
	let unmatched = 0;
	for (const sourcePost of sourcePosts) {
		const result = await payload.find({
			collection: "posts",
			limit: 1,
			depth: 0,
			where: { slug: { equals: sourcePost.slug } },
		});
		const post = result.docs[0];
		if (!post) {
			unmatched++;
			continue;
		}
		matched++;

		const categories = sourcePost.terms
			.filter((term) => term.taxonomy === "category")
			.map((term) => termIds.get(`category:${term.slug}`))
			.filter((id): id is number => typeof id === "number");
		const tags = sourcePost.terms
			.filter((term) => term.taxonomy === "post_tag")
			.map((term) => termIds.get(`post_tag:${term.slug}`))
			.filter((id): id is number => typeof id === "number");

		if (!dryRun) {
			await payload.update({
				collection: "posts",
				id: post.id,
				data: { categories, tags },
				context: { disableRevalidate: true },
			});
			updated++;
		}
	}

	payload.logger.info(
		`${dryRun ? "Would update" : "Updated"} ${updated} posts; ` +
			`matched ${matched}/${sourcePosts.length}, ${unmatched} unmatched; ` +
			`read ${terms.filter((term) => term.taxonomy === "category").length} categories and ` +
			`${terms.filter((term) => term.taxonomy === "post_tag").length} tags`,
	);
}

void main().then(
	() => process.exit(0),
	(error) => {
		console.error("WORDPRESS TAXONOMY MIGRATION FAILED:", error);
		process.exit(1);
	},
);
