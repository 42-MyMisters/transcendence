import React from "react";
import { Link } from "react-router-dom";

import "../css/login.css";

export default function LoginPage() {

	return (
		<>
			<div className="Login">
				<div className="LoginBox">
					<div className="LoginHeader">
						Sign in
					</div>
					<div className="LoginBody">
						<Link to="/chat">
						<button className="LoginBtn">
							Sign in with Intra
						</button>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}