import Exceptions
import Fluent
import Foundation
import OpenAPIRuntime
import OpenAPIVapor
import Vapor
import swift_macros

extension MrScroogeAPIImpl {
	func ApiOAuth_authorize(_ input: Operations.ApiOAuth_authorize.Input) async throws
		-> Operations.ApiOAuth_authorize.Output
	{
		let user = try await getUser(fromRequest: request)
		let requestData = input.query.request

		guard let clientId = UUID(uuidString: requestData.client_id) else {
			return #GenericErrorReturn(
				response: "unauthorized", msg: "Not valid client id",
				code: ApiError.API10063)
		}

		let stringScopes = requestData.scope?.split(separator: " ") ?? []

		let scopes = stringScopes.map({
			($0, Components.Schemas.OAuthScope.init(rawValue: String($0)))
		})
		let invalidScopes = scopes.filter { $0.1 == nil }.map { $0.0 }
		guard invalidScopes.isEmpty else {
			return #GenericErrorReturn(
				response: "badRequest",
				msg: "Invalid scopes: \(invalidScopes.joined(separator: ","))",
				code: ApiError.API10076
			)
		}

		let authorizationResult = try await request.application.oauthService.authorizate(
			.init(
				clientId: clientId,
				scopes: scopes.compactMap { $0.1?.toInternal() },
				redirectUri: requestData.redirect_uri), for: user)
		switch authorizationResult {
		case .ok(let code):
			// Return redirect response
			return .ok(
				.init(
					body: .json(
						.init(
							authorization_code: code,
							state: requestData.state))))
		case .notFound:
			// Return error response for invalid client
			return #GenericErrorReturn(
				response: "unauthorized", msg: "OAuth client not found",
				code: ApiError.API10063)
		case .invalidScopes(let scopes):
			// Return error response for invalid scopes
			return #GenericErrorReturn(
				response: "badRequest", msg: "Invalid scopes: \(scopes)",
				code: ApiError.API10062)
		case .invalidUri(let uris):
			// Return error response for invalid redirect URI
			return #GenericErrorReturn(
				response: "badRequest", msg: "Invalid redirect URI: \(uris)",
				code: ApiError.API10064)
		}
	}

	func ApiOAuth_token(_ input: Operations.ApiOAuth_token.Input) async throws
		-> Operations.ApiOAuth_token.Output
	{

		// Extract token request data from the input body
		let tokenRequest: Components.Schemas.OAuthTokenRequest

		switch input.body {
		case .json(let data):
			tokenRequest = data
		}

		// Extract client credentials from the Authorization header
		guard let basicAuth = request.headers.basicAuthorization else {
			return #GenericErrorReturn(
				response: "badRequest", msg: "Client authentication required",
				code: ApiError.API10065)
		}

		guard let clientId = UUID(uuidString: basicAuth.username) else {
			return #GenericErrorReturn(
				response: "badRequest", msg: "Invalid client ID format",
				code: ApiError.API10067)
		}

		let clientSecret = basicAuth.password

		// Use the service to handle the token request with the new discriminated union structure
		let result = try await request.application.oauthService.handleTokenRequest(
			tokenRequest: tokenRequest,
			clientId: clientId,
			clientSecret: clientSecret,
		)

		switch result {
		case .success(let tokenResponse):
			return .ok(.init(body: .json(tokenResponse)))
		case .invalidRequest(let msg):
			return #GenericErrorReturn(
				response: "badRequest", msg: msg, code: ApiError.API10068)
		case .invalidClient(let msg):
			return #GenericErrorReturn(
				response: "unauthorized", msg: msg, code: ApiError.API10069)
		case .invalidGrant(let msg):
			return #GenericErrorReturn(
				response: "badRequest", msg: msg, code: ApiError.API10070)
		case .unsupportedGrantType(let msg):
			return #GenericErrorReturn(
				response: "badRequest", msg: msg, code: ApiError.API10071)
		}
	}
}
