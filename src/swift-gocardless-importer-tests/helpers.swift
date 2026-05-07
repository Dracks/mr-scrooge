import AsyncHTTPClient
import VaporTesting
@testable import GoCardlessImporter

func withImporterApp(
    useMockHTTPClient: Bool = false, 
	_ test: (Application) async throws -> Void
) async throws {
	let app = try await Application.make(.testing)
	defer {
		Task {
			try? await app.asyncShutdown()
		}
	}
	// var mockHolder: MockHTTPClientHolder?
	// if useMockHTTPClient {
	// 	let mockClient = HTTPClient(eventLoopGroupProvider: .singleton)
	// 	app.injectMockHTTPClient(mockClient)
	// 	mockHolder = MockHTTPClientHolder(mockClient)
	// }

	try await configure(app)
	try await app.autoMigrate()

	try await test(app)
    // _ = mockHolder
}

private final class MockHTTPClientHolder {
	var client: HTTPClient?

	init(_ client: HTTPClient) {
		self.client = client
	}

	deinit {
		if let client = client {
			try? client.syncShutdown()
		}
	}
}

enum TestHelpers {
	static func createAuthenticatedUserWithCredentials(app: Application) async throws -> User {
		let user = User(externalId: UUID(), username: "testuser")
		try await user.save(on: app.db)

		let credentials = GocardlessInstitutionCredentials(
			userId: try user.requireID(),
			secretId: "test-secret-id",
			secretKey: "test-secret-key"
		)
		try await credentials.save(on: app.db)

		return user
	}

	static func loginHeaders(for user: User, on app: Application) async throws -> HTTPHeaders {
		let userId = try user.requireID()
		let tester = try app.testing()
		let response = try await tester.sendRequest(.GET, "/test-login/\(userId)")

		let cookies = response.headers["set-cookie"]
		guard let cookie = cookies.first else {
			throw TestError("No session cookie returned for user \(user.username)")
		}
		return ["cookie": cookie]
	}
}

struct TestError: Error {
	let message: String
	init(_ message: String) { self.message = message }
	var errorDescription: String? { message }
}
