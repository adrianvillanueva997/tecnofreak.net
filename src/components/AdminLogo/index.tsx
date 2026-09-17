import type React from "react";

const AdminLogo: React.FC = () => {
	return (
		<div className="tf-admin-brand">
			<div className="tf-admin-logo" aria-label="tecnofreak.net">
				<span>tecnofreak</span><strong>.net</strong>
			</div>
			<p className="tf-admin-quote">“Curiosidad encendida. Siempre.”</p>
		</div>
	);
};

export default AdminLogo;
