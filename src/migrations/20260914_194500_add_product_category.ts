import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "products_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "categories_id" integer
    );

    ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
    CREATE INDEX "products_rels_parent_id_idx" ON "products_rels" USING btree ("parent_id");
    CREATE INDEX "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_rels" DISABLE ROW LEVEL SECURITY;
    DROP TABLE "products_rels" CASCADE;`)
}
