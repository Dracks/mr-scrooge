import Elementary
import VaporElementary

enum Header {
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

struct StandardLayout<HeaderContent: HTML, Content: HTML>: HTMLDocument {
    let title: String
    let header: HeaderContent
    let content: Content

    init(
        title: String,
        @HTMLBuilder header: () -> HeaderContent,
        @HTMLBuilder content: () -> Content
    ) {
        self.title = title
        self.header = header()
        self.content = content()
    }

    var head: some HTML {
        meta(.name(.description), .content("GoCardLess Importer"))
        link(.rel(.stylesheet), .href("/pico.css"))
    }

    var body: some HTML {
        header
        main(.class("container")) {
            content
        }
    }
}
