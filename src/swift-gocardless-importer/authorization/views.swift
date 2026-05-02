import Elementary
import VaporElementary

struct MainPage: HTMLDocument {
	let clientId: String
	let mrScroogeHost: String
	let redirectUri: String

	var title = "GoCardLess"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Importer"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Unauthenticated.header
		main(.class("container")) {
			h2 { "Welcome to GoCardLess Importer" }
			p { "To continue, you need to identify yourself first in MrScrooge" }
			code { mrScroogeHost }

			a(
				.href(
					"\(mrScroogeHost)/auth?client_id=\(clientId)&response_type=code&redirect_uri=\(redirectUri)&state=test-state&scope=userInfo+uploadFile"
				), .role("button")
			) { "Login with MrScrooge" }
		}
	}
}

struct AuthenticatedPage: HTMLDocument {
	let username: String
	let hasCredentials: Bool

	var title = "GoCardLess - Dashboard"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Importer Dashboard"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
			h2 { "Dashboard" }

			div(.class("grid")) {
				article {
					header { "GoCardless API" }
					if hasCredentials {
						p { "Add accounts" }
						a(
							.href(
								"/\(GocardlessAccountsController.path)"
							), .role("button")
						) {
							"Add account"
						}
						p {
							"it already has configured api credentials, if you need to change them see the button:"
						}
						a(
							.href("/\(GocardlessKeysController.path)"),
							.role("button")
						) {
							"Change keys"
						}
					} else {
						p {
							"Configure your GoCardless API credentials for bank import."
						}
						a(
							.href("/\(GocardlessKeysController.path)"),
							.role("button")
						) {
							"Configure API"
						}
					}
				}
			}
		}
	}
}

struct AuthorizedPage: HTMLDocument {
	let username: String

	var title = "Congratulations"

	var head: some HTML {
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
			h2 { "Successfully Authenticated!" }
			p { "Welcome, \(username)!" }
			a(.href("/"), .role("button")) { "Go to Dashboard" }
		}
	}
}
