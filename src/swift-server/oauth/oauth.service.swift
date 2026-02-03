import Exceptions
import Fluent
import Foundation
import Vapor

extension Scope {
	func toApi() -> Components.Schemas.OAuthScope {
		switch self {
		case .user:
			return .userInfo
		}
	}
}

extension Components.Schemas.OAuthScope {
	func toInternal() -> Scope {
		switch self {
		case .userInfo:
			return .user
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
			userId: user.id!,
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

	// Main function to handle token requests
	func handleTokenRequest(
		grantType: String,
		clientId: UUID,
		clientSecret: String,
		code: String? = nil,
		redirectUri: String? = nil,
		refreshToken: String? = nil
	) async throws -> TokenGrantResult {
		// Verify the client exists and credentials are valid
		guard
			let oauthApp = try await OAuthApp.find(clientId, on: db),
			oauthApp.verifyClientSecret(secret: clientSecret)
		else {
			return .invalidClient("Invalid client credentials")
		}

		switch grantType {
		case "authorization_code":
			return try await handleAuthorizationCodeGrant(
				code: code,
				redirectUri: redirectUri,
				oauthApp: oauthApp
			)
		case "refresh_token":
			return try await handleRefreshTokenGrant(
				refreshToken: refreshToken,
				oauthApp: oauthApp
			)
		case "client_credentials":
			return try await handleClientCredentialsGrant(oauthApp: oauthApp)
		default:
			return .unsupportedGrantType("Unsupported grant type: \(grantType)")
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

		// Generate access and refresh tokens
		let accessToken = UUID().uuidString.replacingOccurrences(of: "-", with: "")
		let refreshToken = UUID().uuidString.replacingOccurrences(of: "-", with: "")

		// Create access token record
		let accessTokenRecord = OAuthAccessToken(
			authCode,
			token: accessToken,
			refresh: refreshToken,
			expires: Date().addingTimeInterval(3600)  // Expires in 1 hour
		)

		try await accessTokenRecord.save(on: db)

		// Delete the authorization code since it's been used
		try await authCode.delete(on: db)

		return .success(try .init(accessTokenRecord, refreshToken: refreshToken))
	}

	private func handleRefreshTokenGrant(
		refreshToken: String?,
		oauthApp: OAuthApp
	) async throws -> TokenGrantResult {
		guard let refreshToken = refreshToken else {
			return .invalidRequest("Missing refresh token")
		}

		// Find the refresh token in the database
		guard
			let token = try await OAuthAccessToken.query(on: db)
				.filter(\.$refreshToken == refreshToken)
				.first()
		else {
			return .invalidGrant("Invalid refresh token")
		}

		// Verify the client ID matches
		guard token.$app.id == oauthApp.id else {
			return .invalidClient("Client ID mismatch")
		}

		// Generate new access token
		let newAccessToken = UUID().uuidString.replacingOccurrences(of: "-", with: "")

		// Update the access token
		token.accessToken = newAccessToken
		token.expiresAt = Date().addingTimeInterval(3600)  // Expires in 1 hour

		try await token.update(on: db)

		return .success(try .init(token, refreshToken: refreshToken))
	}

	private func handleClientCredentialsGrant(oauthApp: OAuthApp) async throws
		-> TokenGrantResult
	{
		// For client credentials grant, we issue a token for the client itself
		// This is typically used for machine-to-machine communication

		// Generate access token
		let accessToken = UUID().uuidString.replacingOccurrences(of: "-", with: "")

		// Create access token record
		let accessTokenRecord = try OAuthAccessToken(
			try oauthApp.requireID(), accessToken,
			refresh: nil,  // Client credentials grants typically don't have refresh tokens
			for: oauthApp,
			expires: Date().addingTimeInterval(3600)  // Expires in 1 hour
		)

		try await accessTokenRecord.save(on: db)

		return .success(try .init(accessTokenRecord))
	}

	// MARK: - Helper Functions

	// Parse Basic Authentication header
	func parseBasicAuthHeader(_ authHeader: String?) -> (username: String, password: String)? {
		guard let authHeader = authHeader,
			authHeader.hasPrefix("Basic ")
		else {
			return nil
		}

		let encodedCredentials = String(authHeader.dropFirst(6)).trimmingCharacters(
			in: .whitespaces)
		guard let data = Data(base64Encoded: encodedCredentials),
			let credentials = String(data: data, encoding: .utf8),
			let separatorIndex = credentials.firstIndex(of: ":")
		else {
			return nil
		}

		let username = String(credentials[..<separatorIndex])
		let password = String(credentials[credentials.index(after: separatorIndex)...])

		return (username: username, password: password)
	}
}

extension Components.Schemas.OAuthTokenResponse {
	init(_ oauthToken: OAuthAccessToken, refreshToken: String? = nil) throws {
		access_token = oauthToken.accessToken
		token_type = .Bearer
		expires_in = 3600
		refresh_token = refreshToken
		scopes = try oauthToken.scopes.map { scope in
			guard let scope else {
				throw Exception(
					ErrorCodes.E10032,
					context: [
						"client_id": oauthToken.$app.id.uuid
					])
			}
			return scope.toApi()
		}
	}
}
