import Fluent
import Testing
import VaporTesting

@testable import GoCardlessImporter

@Suite("Keys Controller Tests")
struct KeysControllerTests {
	@Test("Show credentials returns error for unauthenticated user")
	func testShowCredentialsUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET, "/gcl-keys")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 401"))
		}
	}

	@Test("Post credentials returns error for unauthenticated user")
	func testPostCredentialsUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let body = ByteBuffer(string: "{\"secretId\":\"test\",\"secretKey\":\"test\"}")
			let response = try await tester.sendRequest(
				.POST,
				"/gcl-keys",
				headers: ["Content-Type": "application/json"],
				body: body
			)

			#expect(response.status == .ok)
			let htmlBody = String(buffer: response.body)
			#expect(htmlBody.contains("Error 401"))
		}
	}
}

@Suite("Accounts Controller Tests")
struct AccountsControllerTests {
	@Test("List accounts returns error for unauthenticated user")
	func testListAccountsUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/gcl-accounts")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 401"))
		}
	}
}

