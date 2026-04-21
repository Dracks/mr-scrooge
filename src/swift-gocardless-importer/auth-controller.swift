import Exceptions
import Fluent
import Foundation
import HTTPTypes
import OpenAPIAsyncHTTPClient
import OpenAPIRuntime
import Vapor
import VaporElementary

struct BasicAuthMiddleware: ClientMiddleware {
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
}

struct BearerAuthMiddleware: ClientMiddleware {
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
}

struct GocardlessAuthController: RouteCollection {

	private func createMrScroogeClient() throws -> Client {
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

		let middleware = BasicAuthMiddleware(basicAuth: basicAuth)

		let client = Client(
			serverURL: serverURL,
			transport: transport,
			middlewares: [middleware]
		)
		return client
	}

	private func createMrScroogeClientWithBearer(accessToken: String) throws -> Client {
		let baseURL = EnvConfig.shared.mrScroogeHost
		guard let serverURL = URL(string: baseURL)?.appendingPathComponent("api") else {
			throw Abort(.badRequest, reason: "Invalid MR_SCROOGE_HOST URL")
		}
		let transport = AsyncHTTPClientTransport()

		let middleware = BearerAuthMiddleware(accessToken: accessToken)

		let client = Client(
			serverURL: serverURL,
			transport: transport,
			middlewares: [middleware]
		)
		return client
	}

	func boot(routes: RoutesBuilder) throws {
		routes.get(use: index)
		routes.get("authorized", use: authorized)
		routes.get("logout", use: logout)
	}

	func index(req: Request) async throws -> HTMLResponse {
		let user = getUser(fromRequest: req)

		return HTMLResponse {
			MainPage(
				clientId: EnvConfig.shared.mrScroogeClientId,
				mrScroogeHost: EnvConfig.shared.mrScroogeHost,
				redirectUri: "\(EnvConfig.shared.baseHost)/authorized",
				isAuthenticated: user != nil,
				username: user?.username
			)
		}
	}

	func authorized(req: Request) async throws -> HTMLResponse {
		guard let code = req.query[String.self, at: "authorization_code"] else {
			throw Abort(.badRequest, reason: "Code not found")
		}

		let client = try createMrScroogeClient()
		let redirectUri = "\(EnvConfig.shared.baseHost)/authorized"

		let authParams = Components.Schemas.AuthorizationCodeGrantParams(
			grant_type: .authorization_code,
			code: code,
			redirect_uri: redirectUri
		)

		let tokenResponse = try await client.ApiOAuth_token(
			.init(
				body: .json(.AuthorizationCodeGrantParams(authParams))
			)
		)

		switch tokenResponse {
		case .ok(let response):
			let tokenData = try response.body.json
			let accessToken = tokenData.access_token
			let refreshToken = tokenData.refresh_token
			let expiresIn = tokenData.expires_in
			let scope = tokenData.scope ?? ""

			let expiresAt: Date?
			if let expiresIn = expiresIn {
				expiresAt = Date().addingTimeInterval(TimeInterval(expiresIn))
			} else {
				expiresAt = nil
			}

			let userClient = try createMrScroogeClientWithBearer(
				accessToken: accessToken)
			let profileResponse = try await userClient.ApiSession_me()

			let profile: Components.Schemas.UserProfile

			switch profileResponse {
			case .ok(let profileData):
				switch profileData.body {
				case .json(let checkProfile):
					switch checkProfile {
					case .identified(let _profile):
						profile = _profile.profile
					case .anonymous:
						throw Exception(ErrorCodes.E10001)
					}
				}
			default:
				throw Exception(
					ErrorCodes.E10002,
					context: [
						"status-code": "unknown"
					])
			}
			guard let userId = UUID(uuidString: profile.id) else {
				throw Exception(
					ErrorCodes.E10004,
					context: [
						"Id": profile.id
					]
				)
			}

			let user =
				try await User.query(on: req.db)
				.filter(\.$mrScroogeUserId == userId)
				.first()
				?? User(mrScroogeUserId: userId, username: profile.username)
			user.email = profile.email
			try await user.save(on: req.db)

			req.auth.login(user)

			let tokenRecord = GocardlessOAuthToken()
			tokenRecord.userId = userId
			tokenRecord.accessToken = accessToken
			tokenRecord.refreshToken = refreshToken
			tokenRecord.expiresAt = expiresAt
			tokenRecord.scope = scope
			try await tokenRecord.save(on: req.db)

			return HTMLResponse {
				Authorized(username: profile.username)
			}

		default:
			throw Exception(ErrorCodes.E10005)
		}
	}

	func logout(req: Request) async throws -> HTMLResponse {
		let session = req.session
		session.destroy()
		return try await index(req: req)
	}
}
