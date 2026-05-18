import AsyncHTTPClient
import HTTPTypes
import OpenAPIRuntime
import VaporTesting

@testable import GoCardlessImporter

func withImporterApp(
	useMocks httpMocks: [HttpMock]? = nil,
	mrScroogeMocks: [MrScroogeMock]? = nil,
	_ test: (Application) async throws -> Void
) async throws {
	let app = try await Application.make(.testing)
	defer {
		Task {
			try? await app.asyncShutdown()
		}
	}

	if let httpMocks {
		app.clients.use {
			HTTPClientMock(eventLoop: $0.eventLoopGroup.any(), useMocks: httpMocks)
		}
	}
	if let mrScroogeMocks {
		app.mrScroogeTransport = MockClientTransport(mocks: mrScroogeMocks)
	}
	TestHelpers.injectFakeLogin(app)

	try await configure(app)
	try await app.autoMigrate()

	try await test(app)
}

enum MockResponse: Sendable {
	case response(ClientResponse)
    case json(status: HTTPStatus, body: any Codable & Sendable)
	case callback(@Sendable (ClientRequest) async throws -> ClientResponse)
}

struct HttpMock: Sendable {

	struct Key {
		let method: HTTPMethod
		let endpoint: String
	}
	let host: String?
	let _idx: Key
	var endpoint: String {
		_idx.endpoint
	}
	var method: HTTPMethod {
		_idx.method
	}
	let response: MockResponse

	init(host: String? = nil, method: HTTPMethod, endpoint: String, response: MockResponse) {
		self.host = host
		self._idx = .init(
			method: method,
			endpoint: endpoint
		)
		self.response = response
	}
}


extension HttpMock.Key: Hashable {


		static func == (lhs: HttpMock.Key, rhs:  HttpMock.Key) -> Bool {
			lhs.method == rhs.method && lhs.endpoint == rhs.endpoint
		}

		func hash(into hasher: inout Hasher) {
			hasher.combine(self.method.rawValue)
            hasher.combine(self.endpoint)
		}

}

final class HTTPClientMock: Vapor.Client {
	let eventLoop: any EventLoop
	let mocks: [HttpMock.Key: HttpMock]

	init(eventLoop: any EventLoop,useMocks mocks: [HttpMock]) {
		self.eventLoop = eventLoop

		self.mocks = .init(uniqueKeysWithValues: mocks.map({ ($0._idx, $0) }))
	}
	init(eventLoop: any EventLoop, mocks: [HttpMock.Key: HttpMock]) {
		self.eventLoop = eventLoop
		self.mocks = mocks

	}

	func delegating(to eventLoop: any EventLoop) -> any Vapor.Client {
		return HTTPClientMock(eventLoop: eventLoop, mocks: self.mocks)
	}

	func send(_ request: ClientRequest) -> EventLoopFuture<ClientResponse> {
		print("Request: \(request)")
		guard
			let mock = mocks[
				.init(method: request.method, endpoint: request.url.path)]
		else {
			return eventLoop.makeSucceededFuture(ClientResponse(status: .notFound))
		}
		switch mock.response {
		case .response(let response):
			return eventLoop.makeSucceededFuture(response)
		case .callback(let callback):
			return eventLoop.makeFutureWithTask(
				{
					try await callback(request)
				})
        case .json(let status, let content):
            return eventLoop.makeFutureWithTask({
                let content = try JSONEncoder().encode(content)
                return .init(status: status, body: .init(data: content))
            })
		}
	}

}

// MARK: - MrScrooge OpenAPI Transport Mocks

enum MrScroogeMockResponse: Sendable {
	case json(status: Int, body: any Codable & Sendable)
	case callback(@Sendable (HTTPRequest) async throws -> (HTTPResponse, HTTPBody?))
}

struct MrScroogeMock: Sendable {
	let operationID: String
	let response: MrScroogeMockResponse

	init(operationID: String, response: MrScroogeMockResponse) {
		self.operationID = operationID
		self.response = response
	}
}

struct MockClientTransport: ClientTransport {
	let mocks: [String: MrScroogeMockResponse]

	init(mocks: [MrScroogeMock]) {
		self.mocks = Dictionary(
			uniqueKeysWithValues: mocks.map { ($0.operationID, $0.response) }
		)
	}

	func send(
		_ request: HTTPRequest,
		body: HTTPBody?,
		baseURL: URL,
		operationID: String
	) async throws -> (HTTPResponse, HTTPBody?) {
		guard let mock = mocks[operationID] else {
			return (HTTPResponse(status: 404), nil)
		}
		switch mock {
		case .json(let status, let content):
			let data = try JSONEncoder().encode(content)
			return (HTTPResponse(status: .init(integerLiteral: status)), HTTPBody(data))
		case .callback(let callback):
			return try await callback(request)
		}
	}
}

enum TestHelpers {


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

final class CreateTestUser {
	private let app: Application
	let user: User

	init(username: String, on app: Application) async throws {
		self.app = app
		self.user = User(externalId: UUID(), username: username)
		try await self.user.save(on: app.db)
	}

	@discardableResult
	func setCredentials(secretId: String = "test-secret-id", secretKey: String = "test-secret-key") async throws -> Self {
		let credentials = GocardlessCredentials(
			userId: try user.requireID(),
			secretId: secretId,
			secretKey: secretKey
		)
		try await credentials.save(on: app.db)
		return self
	}

	func getCookie() async throws -> HTTPHeaders {
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
