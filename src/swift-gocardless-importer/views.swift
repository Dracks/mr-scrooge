import Elementary
import VaporElementary

struct MainPage: HTMLDocument {
	let clientId: String
	let mrScroogeHost: String
	let redirectUri: String
	let isAuthenticated: Bool
	let username: String?

	var title = "GoCardLess"

	var head: some HTML {
		meta(.name(.description), .content("Typesafe HTML in modern Swift"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		main(.class("center")) {
			h1 { "GoCardLess Importer" }

			if isAuthenticated {
				div {
					if let username = username {
						"Hello, \(username)!"
					} else {
						"You are authenticated!"
					}
				}
				a(.href("/logout"), .role("button")) { "Logout" }
			} else {
				div {
					"To continue, you need to identify yourself first in MrScrooge (\(mrScroogeHost))"
				}

				a(
					.href(
						"\(mrScroogeHost)/auth?client_id=\(clientId)&response_type=code&redirect_uri=\(redirectUri)&state=test-state&scope=userInfo+uploadFile"
					), .role("button")
				) { "Login" }
			}

		}
	}
}

struct Authorized: HTMLDocument {
	let username: String?

	var title = "Congratulations"

	var head: some HTML {
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		main(.class("center")) {
			h1 { "Congrats! You are now authenticated." }
			if let username = username {
				p { "Welcome, \(username)!" }
			}
			a(.href("/"), .role("button")) { "Go back to home" }
		}
	}
}
