"use client";
import { CopyIcon } from "@payloadcms/ui/icons/Copy";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ code }: { code: string }) {
	const [text, setText] = useState("Copy");

	function updateCopyStatus() {
		if (text === "Copy") {
			setText(() => "Copied!");
			setTimeout(() => {
				setText(() => "Copy");
			}, 1000);
		}
	}

	return (
		<div className="flex justify-end align-middle">
			<Button
				className="!border-teal !bg-teal !text-paper hover:!bg-teal/85 hover:!text-paper"
				size="sm"
				variant="ghost"
				type="button"
				onClick={async () => {
					await navigator.clipboard.writeText(code);
					updateCopyStatus();
				}}
			>
				<span>{text}</span>
				<CopyIcon />
			</Button>
		</div>
	);
}
