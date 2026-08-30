import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { draftMode } from "next/headers";
import Script from "next/script";
import type React from "react";
import { AdminBar } from "@/components/AdminBar";
import { Footer } from "@/Footer/Component";
import { Header } from "@/Header/Component";
import { Providers } from "@/providers";
import { getServerSideURL } from "@/utilities/getURL";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";
import { cn } from "@/utilities/ui";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["600", "700"],
	variable: "--font-space-grotesk",
	display: "swap",
});

const plexSans = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--font-plex-sans",
	display: "swap",
});

const plexMono = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400"],
	variable: "--font-plex-mono",
	display: "swap",
});

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isEnabled } = await draftMode();

	return (
		<html
			className={cn(
				spaceGrotesk.variable,
				plexSans.variable,
				plexMono.variable,
			)}
			lang="es"
			data-theme="light"
			suppressHydrationWarning
		>
			<head>
				<link href="/favicon.ico" rel="icon" sizes="32x32" />
				<link href="/favicon.svg" rel="icon" type="image/svg+xml" />
				{process.env.NODE_ENV === "production" && (
					<>
						<link rel="preconnect" href="https://www.googletagmanager.com" />
						<link
							rel="preconnect"
							href="https://pagead2.googlesyndication.com"
							crossOrigin="anonymous"
						/>
					</>
				)}
			</head>
			<body>
				{process.env.NODE_ENV === "production" && (
					<>
						{/* Google Analytics (GA4) - lazyOnload to reduce render-blocking */}
						<Script
							src="https://www.googletagmanager.com/gtag/js?id=G-DBZL4P68SP"
							strategy="lazyOnload"
						/>
						<Script id="ga4" strategy="lazyOnload">
							{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-DBZL4P68SP');`}
						</Script>
						{/* Google AdSense - lazyOnload */}
						<Script
							src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1455213377925841"
							crossOrigin="anonymous"
							strategy="lazyOnload"
						/>
					</>
				)}
				<Providers>
					<AdminBar
						adminBarProps={{
							preview: isEnabled,
						}}
					/>

					<Header />
					{children}
					<Footer />
				</Providers>
			</body>
		</html>
	);
}

export const metadata: Metadata = {
	metadataBase: new URL(getServerSideURL()),
	title: {
		default: "tecnofreak.net — Blog de tecnología en español",
		template: "%s | tecnofreak.net",
	},
	description: "Noticias, análisis y opiniones sobre tecnología en español.",
	openGraph: mergeOpenGraph(),
};
