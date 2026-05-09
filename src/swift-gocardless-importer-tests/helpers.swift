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

	app.clients.use { HTTPClientMock(eventLoop: $0.eventLoopGroup.any()) }
	TestHelpers.injectFakeLogin(app)

	try await configure(app)
	try await app.autoMigrate()

	try await test(app)
	// _ = mockHolder
}

final class HTTPClientMock: Vapor.Client {
	let eventLoop: any EventLoop

	init(eventLoop: any EventLoop) {
		self.eventLoop = eventLoop
	}

	func delegating(to eventLoop: any EventLoop) -> any Vapor.Client {
		return HTTPClientMock(eventLoop: eventLoop)
	}

	func send(_ request: ClientRequest) -> EventLoopFuture<ClientResponse> {
		print("Request: \(request)")
		return eventLoop.makeFutureWithTask({ ClientResponse() })
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

	static func injectFakeLogin(_ app: Application) {
		app.routes.get("test-login", ":userId") { req -> Response in
			guard let userIdString = req.parameters.get("userId"),
				let userId = UUID(uuidString: userIdString)
			else {
				return Response(status: .badRequest)
			}
			let user = try await User.find(userId, on: req.db)
			guard let user = user else {
				return Response(status: .notFound)
			}
			req.auth.login(user)
			return Response(status: .ok)
		}
	}
}

struct TestError: Error {
	let message: String
	init(_ message: String) { self.message = message }
	var errorDescription: String? { message }
}
