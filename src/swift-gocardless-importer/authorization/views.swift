import Elementary
import VaporElementary

struct MainPage: HTML {
	let clientId: String
	let mrScroogeHost: String
	let redirectUri: String

	var body: some HTML {
		StandardLayout(title: "GoCardLess") {
			Header.Unauthenticated.header
		} content: {
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

struct AuthenticatedPage: HTML {
	let username: String
	let hasCredentials: Bool

	var body: some HTML {
		StandardLayout(title: "GoCardLess - Dashboard") {
			Header.Authenticated.header(username: username)
		} content: {
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

struct AuthorizedPage: HTML {
	let username: String

	var body: some HTML {
		StandardLayout(title: "Congratulations") {
			Header.Authenticated.header(username: username)
		} content: {
			h2 { "Successfully Authenticated!" }
			p { "Welcome, \(username)!" }
			a(.href("/"), .role("button")) { "Go to Dashboard" }
		}
	}
}
