import * as migration_20260824_104855_initial_schema from "./20260824_104855_initial_schema";
import * as migration_20260903_072603_add_tags_collection from "./20260903_072603_add_tags_collection";

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
];
