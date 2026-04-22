import Exceptions
import Fluent
import Foundation
import OpenAPIAsyncHTTPClient
import OpenAPIRuntime
import Vapor
import VaporElementary

struct GocardlessAuthController: RouteCollection {

	private func getAuthenticatedUsername(_ req: Request) -> String? {
		let user = req.auth.get(GoCardlessImporter.User.self)

		return user?.username
	}

	private func isAuthenticated(_ req: Request) -> Bool {
		return getAuthenticatedUsername(req) != nil
	}

	func boot(routes: RoutesBuilder) throws {
		routes.get(use: index)
		routes.get("authorized", use: authorized)
		routes.get("logout", use: logout)
	}

	func index(req: Request) async throws -> HTMLResponse {
		let authenticated = isAuthenticated(req)

		if authenticated {
			let username = getAuthenticatedUsername(req) ?? ""
			return HTMLResponse {
				AuthenticatedPage(username: username)
			}
		} else {
			return HTMLResponse {
				MainPage(
					clientId: EnvConfig.shared.mrScroogeClientId,
					mrScroogeHost: EnvConfig.shared.mrScroogeHost,
					redirectUri: "\(EnvConfig.shared.baseHost)/authorized"
				)
			}
		}
	}

	func authorized(req: Request) async throws -> HTMLResponse {
		guard let code = req.query[String.self, at: "authorization_code"] else {
			throw Abort(
				.badRequest,
				reason: "Authorization code not found in query parameters")
		}

		let client = try MrScroogeClientService.createClient()
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

			let expiresAt: Date?
			if let expiresIn = expiresIn {
				expiresAt = Date().addingTimeInterval(TimeInterval(expiresIn))
			} else {
				expiresAt = nil
			}

			let userClient = try MrScroogeClientService.createClientWithBearer(
				accessToken: accessToken)
			let profileResponse = try await userClient.ApiSession_me()

			switch profileResponse {
			case .ok(let profileData):
				let checkProfile: Components.Schemas.CheckMyProfile
				switch profileData.body {
				case .json(let _checkProfile):
					checkProfile = _checkProfile
				}

				guard case .identified(let identified) = checkProfile else {
					throw Exception(
						ErrorCodes.E10001,
						context: [
							"reason":
								"User is anonymous, not identified"
						]
					)

				}
				let profile = identified.profile

				guard let externalId = UUID(uuidString: profile.id) else {
					throw Exception(
						ErrorCodes.E10004,
						context: [
							"invalid-id": profile.id,
							"reason":
								"Could not parse user ID as UUID",
						]
					)
				}

				let user =
					try await User.query(on: req.db)
					.filter(\.$externalId == externalId)
					.first()
					?? User(
						externalId: externalId,
						username: profile.username)
				user.email = profile.email
				try await user.save(on: req.db)

				req.auth.login(user)

				let tokenRecord = MrScroogeOAuthToken()
				tokenRecord.userId = try user.requireID()
				tokenRecord.accessToken = accessToken
				tokenRecord.refreshToken = refreshToken
				tokenRecord.expiresAt = expiresAt
				try await tokenRecord.save(on: req.db)

				return HTMLResponse {
					AuthorizedPage(username: profile.username)
				}
			default:
				throw Exception(
					ErrorCodes.E10002,
					context: ["reason": "Failed to get user profile"]
				)
			}

		case .unauthorized:
			throw Exception(
				ErrorCodes.E10006,
				context: [
					"reason": "OAuth token request failed",
					"error": "Invalid authorization code",
				]
			)

		default:
			throw Exception(
				ErrorCodes.E10005,
				context: [
					"reason": "Unexpected response from OAuth token endpoint"
				]
			)
		}
	}

	func logout(req: Request) async throws -> HTMLResponse {
		let session = req.session
		session.destroy()
		return try await index(req: req)
	}
}
