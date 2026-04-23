import Elementary
import VaporElementary

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