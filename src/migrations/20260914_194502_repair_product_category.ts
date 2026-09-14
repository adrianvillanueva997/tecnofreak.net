import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
	await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "categories_id" integer
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_rels_parent_id_fk') THEN
        ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_rels_categories_fk') THEN
        ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "products_rels_order_idx" ON "products_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "products_rels_parent_id_idx" ON "products_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");`);
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
