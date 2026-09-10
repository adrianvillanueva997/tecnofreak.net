import { constants } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";
import config from "@payload-config";
import { getPayload } from "payload";

const payload = getPayload({ config });

export async function GET() {
	try {
		await Promise.all([
			access(path.join(process.cwd(), "public/media"), constants.W_OK),
			access(
				path.join(process.cwd(), ".next/cache/images"),
				constants.W_OK,
			),
		]);
		await (await payload).find({ collection: "media", depth: 0, limit: 1 });

		return Response.json({ status: "ok" });
	} catch {
		return Response.json({ status: "unhealthy" }, { status: 503 });
	}
}
