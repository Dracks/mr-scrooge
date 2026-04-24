import Elementary
import VaporElementary

struct InstitutionView: Codable {
	let id: String
	let name: String
}

struct GocardlessCredentialsPage: HTMLDocument {
	let hasCredentials: Bool

	var title = "GoCardLess - Credentials"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Credentials"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Unauthenticated.header
		main(.class("container")) {
			h2 { "GoCardless API Credentials" }

			if hasCredentials {
				article {
					header { "Credentials Configured" }
					p { "Your GoCardless API credentials are configured." }
				}
			} else {
				article {
					header { "Configure Credentials" }
					p {
						"To use the GoCardless importer, you need to configure your API credentials. "
						"You can get these from your GoCardless dashboard."
					}
				}
			}

			form(.method(.post), .action("/\(GocardlessKeysController.path)")) {
				label {
					"Secret ID"
					input(.type(.text), .name("secretId"), .required)
				}
				label {
					"Secret Key"
					input(.type(.password), .name("secretKey"), .required)
				}
				button(.type(.submit)) { "Save Credentials" }
			}

			a(.href("/"), .role("button"), .class("secondary")) { "Back to Dashboard" }
		}
	}
}

struct GocardlessAccountsPage: HTMLDocument {
	let username: String
	let agreements: [UserAgreement]
	let institutions: [InstitutionView]
	let country: String

	var title = "GoCardLess - Accounts"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Accounts"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
			h2 { "Bank Accounts" }

			if agreements.isEmpty {
				article {
					header { "No Bank Accounts Connected" }
					p { "Connect your bank account to start importing transactions." }
				}
			} else {
				h3 { "Connected Accounts" }
				for agreement in agreements {
					article {
						header { agreement.institutionName }
						footer {
							"Status: \(agreement.status)"
						}
					}
				}
			}

			h3 { "Connect a New Bank" }

			if institutions.isEmpty {
				article {
					header { "No Banks Available" }
					p { "No banks are available for the selected country." }
				}
			} else {
				form(.method(.post), .action("/\(GocardlessAccountsController.path)/create")) {
					label {
						"Select your bank"
						select(.name("institutionId"), .required) {
							option(.value(""), .disabled, .selected) { "-- Select a bank --" }
							for institution in institutions {
								option(.value(institution.id)) { institution.name }
							}
						}
					}
					button(.type(.submit)) { "Connect Bank" }
				}
			}

			a(.href("/"), .role("button"), .class("secondary")) { "Back to Dashboard" }
		}
	}
}

struct GocardlessAccountsCreatedPage: HTMLDocument {
	let username: String
	let institutionName: String
	let redirectUrl: String

	var title = "GoCardLess - Redirect"

	var head: some HTML {
		meta(.name(.description), .content("GoCardLess Redirect"))
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		Layout.Authenticated.header(username: username)
		main(.class("container")) {
			h2 { "Redirecting to Bank" }

			article {
				header { "Connecting to \(institutionName)" }
				p {
					"You are being redirected to your bank to complete the authentication. "
					"If you are not redirected automatically, "
					a(.href(redirectUrl)) { "click here to continue" }
					"."
				}
			}

			a(.href("/\(GocardlessAccountsController.path)"), .role("button"), .class("secondary")) { "Cancel" }
}
	}
}