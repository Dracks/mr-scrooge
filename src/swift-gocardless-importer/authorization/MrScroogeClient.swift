import Exceptions
import Foundation
import HTTPTypes
import OpenAPIAsyncHTTPClient
import OpenAPIRuntime
import Vapor

struct BasicClientAuthMiddleware: ClientMiddleware {
	let basicAuth: String

	func intercept(
		_ request: HTTPRequest,
		body: HTTPBody?,
		baseURL: URL,
		operationID: String,
		next:
			@Sendable (HTTPRequest, HTTPBody?, URL) async throws -> (
				HTTPResponse, HTTPBody?
			)
	) async throws -> (HTTPResponse, HTTPBody?) {
		var modifiedRequest = request
		modifiedRequest.headerFields.append(.init(name: .authorization, value: basicAuth))
		return try await next(modifiedRequest, body, baseURL)
	}

	init(basicAuth: String) {
		self.basicAuth = basicAuth
	}
}

struct BearerClientAuthMiddleware: ClientMiddleware {
	let accessToken: String

	func intercept(
		_ request: HTTPRequest,
		body: HTTPBody?,
		baseURL: URL,
		operationID: String,
		next:
			@Sendable (HTTPRequest, HTTPBody?, URL) async throws -> (
				HTTPResponse, HTTPBody?
			)
	) async throws -> (HTTPResponse, HTTPBody?) {
		var modifiedRequest = request
		modifiedRequest.headerFields.append(
			.init(name: .authorization, value: "Bearer \(accessToken)"))
		return try await next(modifiedRequest, body, baseURL)
	}

	init(accessToken: String) {
		self.accessToken = accessToken
	}
}

enum MrScroogeClientService {
	static func createClient() throws -> Client {
		let baseURL = EnvConfig.shared.mrScroogeHost
		guard let serverURL = URL(string: baseURL)?.appendingPathComponent("api") else {
			throw Abort(.badRequest, reason: "Invalid MR_SCROOGE_HOST URL")
		}
		let transport = AsyncHTTPClientTransport()

		let credentials =
			"\(EnvConfig.shared.mrScroogeClientId):\(EnvConfig.shared.mrScroogeClientSecret)"
		guard let data = credentials.data(using: .utf8) else {
			throw Abort(.internalServerError, reason: "Failed to encode credentials")
		}
		let basicAuth = "Basic \(data.base64EncodedString())"

		let middleware = BasicClientAuthMiddleware(basicAuth: basicAuth)

		let client = Client(
			serverURL: serverURL,
			transport: transport,
			middlewares: [middleware]
		)
		return client
	}

	static func createClientWithBearer(accessToken: String) throws -> Client {
		let baseURL = EnvConfig.shared.mrScroogeHost
		guard let serverURL = URL(string: baseURL)?.appendingPathComponent("api") else {
			throw Abort(.badRequest, reason: "Invalid MR_SCROOGE_HOST URL")
		}
		let transport = AsyncHTTPClientTransport()

		let middleware = BearerClientAuthMiddleware(accessToken: accessToken)

		let client = Client(
			serverURL: serverURL,
			transport: transport,
			middlewares: [middleware]
		)
		return client
	}
}