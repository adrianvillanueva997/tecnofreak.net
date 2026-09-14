import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
	await db.execute(sql`
    WITH removable AS (
      SELECT c.id
      FROM categories c
      WHERE NOT EXISTS (
        SELECT 1 FROM posts_rels r
        WHERE r.path = 'categories' AND r.categories_id = c.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM categories child WHERE child.parent_id = c.id
      )
    )
    DELETE FROM categories c USING removable r WHERE c.id = r.id;

    DELETE FROM tags t
    WHERE NOT EXISTS (
      SELECT 1 FROM posts_rels r
      WHERE r.path = 'tags' AND r.tags_id = t.id
    );`);
}

// This cleanup is intentionally irreversible because the removed records were unused.
export async function down(_args: MigrateDownArgs): Promise<void> {}
