import Exceptions
import Fluent
import Foundation
import OpenAPIRuntime
import OpenAPIVapor
import Vapor

extension MrScroogeAPIImpl {
	func ApiOAuth_authorize(_ input: Operations.ApiOAuth_authorize.Input) async throws
		-> Operations.ApiOAuth_authorize.Output
	{
		let user = try await getUser(fromRequest: request)
		var requestData = input.query.request

		guard let clientId = UUID(uuidString: requestData.client_id) else {
			return .unauthorized(
				.init(
					body: .json(
						.init(
							message: "Not valid client id",
							code: ApiError.API10063.rawValue))))
		}

		let authorizationResult = try await request.application.oauthService.authorizate(
			.init(
				clientId: clientId,
				scopes: (requestData.scopes ?? []).map { $0.toInternal() },
				redirectUri: requestData.redirect_uri), for: user)
		print(authorizationResult)
		switch authorizationResult {
		case .ok(let code):
			// Return redirect response
			return .ok(.init(body: .json(.init(body: .init(authorization_code: code, state: requestData.state)))))
		case .notFound:
			// Return error response for invalid client
			return .unauthorized(
				.init(
					body: .json(
						.init(
							message: "OAuth client not found",
							code: ApiError.API10063.rawValue)
					)))
		case .invalidScopes(let scopes):
			// Return error response for invalid scopes
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "not valid authorization",
							code: ApiError.API10062.rawValue)
					)))
		case .invalidUri(let uris):
			// Return error response for invalid redirect URI
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "invalid redirect URI",
							code: ApiError.API10064.rawValue)
					)))
		}
	}

	func ApiOAuth_token(_ input: Operations.ApiOAuth_token.Input) async throws
		-> Operations.ApiOAuth_token.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}
}
