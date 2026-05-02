import Elementary
import VaporElementary

enum Layout {
	enum Unauthenticated {
		static var header: some HTML {
			Elementary.header {
				h1 { "GoCardLess Importer" }
			}
		}
	}

	enum Authenticated {
		static func header(username: String) -> some HTML {
			Elementary.header {
				nav {
					a(.href("/")) { "GoCardLess Importer" }
					small { username }
					a(.href("/logout"), .role("button"), .class("secondary")) {
						"Logout"
					}
				}
			}
		}
	}
}
