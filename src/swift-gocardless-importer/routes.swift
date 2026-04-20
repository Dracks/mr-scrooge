import Elementary
import Vapor
import VaporElementary

struct MainPage: HTMLDocument {
	let clientId: String
	let mrScroogeHost: String
	let redirectUri: String

	var title = "GoCardLess"

	var head: some HTML {
		meta(.name(.description), .content("Typesafe HTML in modern Swift"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		main(.class("center")) {
			h1 { "Login" }
			div {
				"To continue, you need to identify yourself first in MrScrooge (\(mrScroogeHost))"
			}

			a(
				.href(
					"\(mrScroogeHost)/auth?client_id=\(clientId)&response_type=code&redirect_uri=\(redirectUri)&state=test-state&scope=userInfo+uploadFile"
				), .role("Button")
			) { "Login" }

		}
	}
}

struct Authorized: HTMLDocument {
	var title = "Congratulations"
	var head: some HTML {

	}
	var body: some HTML {
		main {
			h1 { "Congrats!" }
		}
	}
}

func routes(_ app: Application) throws {

	app.get("") { _ in
		HTMLResponse {
			MainPage(
				clientId: EnvConfig.shared.mrScroogeClientId,
				mrScroogeHost: EnvConfig.shared.mrScroogeHost,
				redirectUri: "\(EnvConfig.shared.hostname)/authorized")
		}
	}
	app.get("authorized") { _ in
		HTMLResponse {
            Authorized()

		}
	}
}
