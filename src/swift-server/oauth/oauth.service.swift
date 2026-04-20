import Exceptions
import Fluent
import Foundation
import Vapor

extension Scope {
	func toApi() -> Components.Schemas.OAuthScope {
		switch self {
		case .user:
			return .userInfo
        case .importFile:
            return .uploadFile
		}
	}
}

extension Components.Schemas.OAuthScope {
	func toInternal() -> Scope {
		switch self {
		case .userInfo:
			return .user
        case .uploadFile:
        return .importFile
		}
	}
}

// MARK: - OAuth Service

struct OAuthServiceNewUser {
	var username: String
	var password: String
	var email: String
	var firstName: String?
	var lastName: String?
	var isActive: Bool
	var isAdmin: Bool
}

final class OAuthService: ServiceWithDb, @unchecked Sendable {

	enum AuthorizationResult {
		case ok(code: String)
		case notFound
		case invalidScopes(scopes: [Scope])
		case invalidUri(uris: [String])
	}

	struct RequestAuthorization {
		let clientId: UUID
		let scopes: [Scope]
		let redirectUri: String
	}

	func authorizate(_ request: RequestAuthorization, for user: User)
		async throws -> AuthorizationResult
	{
		// Find the OAuth application by client ID
		guard
			let oauthApp = try await OAuthApp.find(request.clientId, on: db)
		else {
			// For security, return invalid scopes rather than indicating the client doesn't exist
			return .notFound
		}

		// Validate redirect URI
		guard oauthApp.redirectUris.contains(request.redirectUri) else {
			// Invalid redirect URI - return invalid scopes for security
			return .invalidUri(uris: oauthApp.redirectUris)
		}

		// Validate scopes if provided
		let requestedScopes = request.scopes
		if !requestedScopes.isEmpty {
			// Check if all requested scopes are allowed for this application
			let validAppScopes = oauthApp.scopes.compactMap { $0 }  // Remove nil values
			let invalidScopes = requestedScopes.filter { !validAppScopes.contains($0) }

			if !invalidScopes.isEmpty {
				return .invalidScopes(scopes: invalidScopes)
			}
		}

		// Generate a new authorization code
		let authorizationCode = UUID().uuidString.replacingOccurrences(of: "-", with: "")

		// Calculate expiration date based on configuration
		let expirationTime = EnvConfig.shared.authorizationCodeExpirationSeconds
		let expiresAt = Date().addingTimeInterval(expirationTime)

		// Create and save the authorization code record
		let authCode = OAuthAuthorizationCode(
			code: authorizationCode,
			clientId: request.clientId,
			userId: try user.requireID(),
			scopes: requestedScopes,
			redirectUri: request.redirectUri,
			expiresAt: expiresAt
		)

		try await authCode.save(on: db)

		return .ok(code: authorizationCode)
	}
	// MARK: - Token Generation

	enum TokenGrantType: String {
		case authorizationCode = "authorization_code"
		case refreshToken = "refresh_token"
		case clientCredentials = "client_credentials"
	}

	enum TokenGrantResult {
		case success(Components.Schemas.OAuthTokenResponse)
		case invalidRequest(String)
		case invalidClient(String)
		case invalidGrant(String)
		case unsupportedGrantType(String)
	}

	// Main function to handle token requests with the new discriminated union structure
	func handleTokenRequest(
		tokenRequest: Components.Schemas.OAuthTokenRequest,
		clientId: UUID,
		clientSecret: String,
	) async throws -> TokenGrantResult {
		// Verify the client exists and credentials are valid
		guard
			let oauthApp = try await OAuthApp.find(clientId, on: db),
			oauthApp.verifyClientSecret(secret: clientSecret)
		else {
			return .invalidClient("Invalid client credentials")
		}

		// Handle based on the discriminated union structure using switch statement
		switch tokenRequest {
		case .AuthorizationCodeGrantParams(let authCodeParams):
			return try await handleAuthorizationCodeGrant(
				code: authCodeParams.code,
				redirectUri: authCodeParams.redirect_uri,
				oauthApp: oauthApp
			)
		case .RefreshTokenGrantParams(let refreshTokenParams):
			return try await handleRefreshTokenGrant(
				refreshToken: refreshTokenParams.refresh_token,
				oauthApp: oauthApp
			)
		case .ClientCredentialsGrantParams:
			return try await handleClientCredentialsGrant(
				oauthApp: oauthApp)
		}
	}

	// MARK: - Grant Type Handlers

	private func handleAuthorizationCodeGrant(
		code: String?,
		redirectUri: String?,
		oauthApp: OAuthApp
	) async throws -> TokenGrantResult {
		guard let code = code else {
			return .invalidRequest("Missing authorization code")
		}

		guard let redirectUri = redirectUri else {
			return .invalidRequest("Missing redirect_uri")
		}

		// Verify authorization code exists and hasn't expired
		guard
			let authCode = try await OAuthAuthorizationCode.query(on: db)
				.filter(\.$code == code)
				.first()
		else {
			return .invalidGrant("Invalid authorization code")
		}

		// Verify the code hasn't expired
		guard authCode.expiresAt > Date() else {
			// Delete expired code
			try await authCode.delete(on: db)
			return .invalidGrant("Authorization code has expired")
		}

		// Verify the client ID matches
		guard authCode.$app.id == oauthApp.id else {
			return .invalidClient("Client ID mismatch")
		}

		// Verify redirect URI matches
		guard authCode.redirectUri == redirectUri else {
			return .invalidGrant("Redirect URI mismatch")
		}

		// Create access token record
		let accessTokenRecord = OAuthAccessToken(
			authCode,
			expires: Date().addingTimeInterval(3600)  // Expires in 1 hour
		)

		try await accessTokenRecord.save(on: db)

		// Delete the authorization code since it's been used
		try await authCode.delete(on: db)

		return .success(
			try .init(accessTokenRecord, refreshToken: accessTokenRecord.refreshToken))
	}

	private func handleRefreshTokenGrant(
		refreshToken: String,
		oauthApp: OAuthApp
	) async throws -> TokenGrantResult {
		guard !refreshToken.isEmpty else {
			return .invalidRequest("Missing refresh token")
		}

		// Find the refresh token in the database
		guard
			let token = try await OAuthAccessToken.query(on: db)
				.filter(\.$app.$id == oauthApp.requireID())
				.filter(\.$refreshToken == refreshToken)
				.first()
		else {
			return .invalidGrant("Invalid refresh token")
		}

		// Generate new access token
		token.newAccessTokens()
		token.expiresAt = Date().addingTimeInterval(3600)  // Expires in 1 hour

		try await token.update(on: db)

		return .success(try .init(token, refreshToken: token.refreshToken ?? ""))
	}

	private func handleClientCredentialsGrant(oauthApp: OAuthApp)
		async throws
		-> TokenGrantResult
	{
		// For client credentials grant, we issue a token for the client itself
		// This is typically used for machine-to-machine communication

		// Create access token record
		let accessTokenRecord = try OAuthAccessToken(
			nil,
			for: oauthApp,
			expires: Date().addingTimeInterval(3600)  // Expires in 1 hour
		)
		accessTokenRecord.refreshToken = nil

		try await accessTokenRecord.save(on: db)

		return .success(try .init(accessTokenRecord))
	}

}

extension Components.Schemas.OAuthTokenResponse {
	init(_ oauthToken: OAuthAccessToken, refreshToken: String? = nil) throws {
		access_token = oauthToken.accessToken
		token_type = .Bearer
		expires_in = 3600
		refresh_token = refreshToken
		scope = try oauthToken.scopes.map { scope in
			guard let scope else {
				throw Exception(
					ErrorCodes.E10032,
					context: [
						"client_id": oauthToken.$app.id.uuidString
					])
			}
			return scope.toApi().rawValue
		}.joined(separator: " ")
	}
}
