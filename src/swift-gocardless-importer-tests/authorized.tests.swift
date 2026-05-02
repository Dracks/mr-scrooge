import Fluent
import Testing
import VaporTesting

@testable import GoCardlessImporter

@Suite("Authorization Tests")
struct AuthorizationTests {
	@Test("Main page shows login for guest")
	func testMainPageShowsLoginForGuest() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("GoCardLess Importer"))
			#expect(body.contains("Login with MrScrooge"))
		}
	}

	@Test("Authorized endpoint without code shows error page")
	func testAuthorizedPageWithoutCodeShowsError() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/authorized")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error"))
			#expect(body.contains("Authorization code"))
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
