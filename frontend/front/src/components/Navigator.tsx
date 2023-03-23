import "../styles/Navigator.css";

export default function Navigator() {
	return (
			<div className="nav-content">
				<ul className="nav-items">
					<li className="nav-logo">
						<a href="https://github.com/42-MyMisters">MyMisters</a>
					</li>
					<div className="nav-pages">
						<li className="nav-page">
							<a href="/notfound">
								Logout
							</a>
						</li>
						<li className="nav-page">
							<a href="/setting">Setting</a>
						</li>
						<li className="nav-page">
							<a href="/game">Game</a>
						</li>
						<li className="nav-page">
							<a href="/chat">Chat</a>
						</li>
				</div>
				</ul>
			</div>
	);
}
