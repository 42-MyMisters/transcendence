import React from "react";
import { Link } from "react-router-dom";

import "../styles/LoginModal.css";

export default function LoginPage() {
	return (
		<div className="ModalWrap">
			<div className="ModalBox">
				<h1 className="ModalTitle">Sign in</h1>
				<button className="LogInBtn">Intra</button>
			</div>
		</div>
	);
}