import Fluent
import Testing
import VaporTesting

@testable import GoCardlessImporter

@Suite("Keys Controller Tests")
struct KeysControllerTests {
	@Test("Show credentials returns 401 for unauthenticated user")
	func testShowCredentialsUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET, "/set_gocardless_credentials")

			#expect(response.status == .unauthorized)
		}
	}

	@Test("Post credentials returns 401 for unauthenticated user")
	func testPostCredentialsUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let body = "secretId=test&secretKey=test"
			let response = try await tester.sendRequest(
				.POST,
				"/set_gocardless_credentials",
				headers: ["Content-Type": "application/x-www-form-urlencoded"],
				body: ByteBuffer(string: body)
			)

			#expect(response.status == .unauthorized)
		}
	}
}

@Suite("Accounts Controller Tests")
struct AccountsControllerTests {
	@Test("List accounts returns 401 for unauthenticated user")
	func testListAccountsUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/accounts")

			#expect(response.status == .unauthorized)
		}
	}
}

private func withImporterApp(
	_ test: @escaping (Application) async throws -> Void
) async throws {
	let app = try await Application.make(.testing)
	defer {
		Task {
			try? await app.asyncShutdown()
		}
	}

	try await configureImporter(app)
	try await app.autoMigrate()

	try await test(app)
}
