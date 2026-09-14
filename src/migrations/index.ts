import * as migration_20260824_104855_initial_schema from "./20260824_104855_initial_schema";
import * as migration_20260903_072603_add_tags_collection from "./20260903_072603_add_tags_collection";
import * as migration_20260914_194500_add_product_category from "./20260914_194500_add_product_category";
import * as migration_20260914_194501_cleanup_unused_taxonomy from "./20260914_194501_cleanup_unused_taxonomy";
import * as migration_20260914_194502_repair_product_category from "./20260914_194502_repair_product_category";
import * as migration_20260914_194503_repair_product_category_column from "./20260914_194503_repair_product_category_column";

export const migrations = [
	{
		up: migration_20260824_104855_initial_schema.up,
		down: migration_20260824_104855_initial_schema.down,
		name: "20260824_104855_initial_schema",
	},
	{
		up: migration_20260903_072603_add_tags_collection.up,
		down: migration_20260903_072603_add_tags_collection.down,
		name: "20260903_072603_add_tags_collection",
	},
	{
		up: migration_20260914_194500_add_product_category.up,
		down: migration_20260914_194500_add_product_category.down,
		name: "20260914_194500_add_product_category",
	},
	{
		up: migration_20260914_194501_cleanup_unused_taxonomy.up,
		down: migration_20260914_194501_cleanup_unused_taxonomy.down,
		name: "20260914_194501_cleanup_unused_taxonomy",
	},
	{
		up: migration_20260914_194502_repair_product_category.up,
		down: migration_20260914_194502_repair_product_category.down,
		name: "20260914_194502_repair_product_category",
	},
	{
		up: migration_20260914_194503_repair_product_category_column.up,
		down: migration_20260914_194503_repair_product_category_column.down,
		name: "20260914_194503_repair_product_category_column",
	},
];
