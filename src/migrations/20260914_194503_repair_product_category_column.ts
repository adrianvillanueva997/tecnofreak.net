import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category_id" integer;

    UPDATE "products" p
    SET "category_id" = r."categories_id"
    FROM "products_rels" r
    WHERE r."parent_id" = p."id"
      AND r."path" = 'categories'
      AND p."category_id" IS NULL
      AND r."categories_id" IS NOT NULL
      AND r."id" = (
        SELECT r2."id"
        FROM "products_rels" r2
        WHERE r2."parent_id" = p."id"
          AND r2."path" = 'categories'
          AND r2."categories_id" IS NOT NULL
        ORDER BY r2."order", r2."id"
        LIMIT 1
      );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_id_categories_id_fk') THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" USING btree ("category_id");`)

  await db.execute(sql`DROP TABLE IF EXISTS "products_rels" CASCADE;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
