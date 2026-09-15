import canUseDOM from "./canUseDOM";

export const getServerSideURL = () => {
	if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
	if (process.env.NODE_ENV === "production") return "https://tecnofreak.net";
	return process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
};

export const getClientSideURL = () => {
	if (canUseDOM) {
		const protocol = window.location.protocol;
		const domain = window.location.hostname;
		const port = window.location.port;

		return `${protocol}//${domain}${port ? `:${port}` : ""}`;
	}

	if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}

	return process.env.NEXT_PUBLIC_SERVER_URL || "";
};
