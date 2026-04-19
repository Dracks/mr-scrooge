import Exceptions
import Fluent
import Foundation
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("OAuth Tests")
final class OAuthTests: BaseWithFactories {
	let oauthAuthorizeEndpoint = "/api/oauth/authorize"
	let oauthTokenEndpoint = "/api/oauth/token"

	@Test("OAuth token endpoint with refresh token grant for expired access token")
	func testOAuthTokenEndpointWithRefreshTokenForExpiredToken() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Create an access token with refresh token that has an expired access token
			// But a valid refresh token (refresh tokens typically have longer expiry)
			let expiredAccessToken = try OAuthAccessToken(
				clientId: clientId,
				userId: testData.admin.id!,
				scopes: [.user],
				expiresAt: Date().addingTimeInterval(-3600)  // Expired 1 hour ago
			)
			try await expiredAccessToken.save(on: app.db)

			// Test POST request to /oauth/token with refresh token
			let refreshTokenParams = Components.Schemas.RefreshTokenGrantParams(
				grant_type: .refresh_token,
				refresh_token: expiredAccessToken.refreshToken ?? ""
			)

			// Create basic auth header with client credentials
			let credentials = "\(clientId.uuidString):secret"
			let data = Data(credentials.utf8)
			let base64Credentials = data.base64EncodedString()
			var authHeaders = headers
			authHeaders.add(name: "Authorization", value: "Basic \(base64Credentials)")

			let response = try await apiTester.sendRequest(
				.POST,
				oauthTokenEndpoint,
				body: refreshTokenParams,
				headers: authHeaders
			)

			// Should return 200 with new access token even though previous access token was expired
			#expect(response.status == .ok)

			// Verify that a new access token was created in the database
			let accessTokens = try await OAuthAccessToken.query(on: app.db).all()
			#expect(accessTokens.count == 1)  // May have both old and new tokens depending on implementation

			if let newToken = accessTokens.first {
				#expect(newToken.accessToken != expiredAccessToken.accessToken)
				#expect(newToken.refreshToken != expiredAccessToken.refreshToken)
				#expect(newToken.expiresAt > Date())
			}
		}
	}

	@Test("OAuth token endpoint with authorization code grant")
	func testOAuthTokenEndpointWithAuthorizationCodeGrant() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Create an authorization code
			let authCode = "auth-code-\(UUID().uuidString)"
			let authorizationCode = OAuthAuthorizationCode(
				code: authCode,
				clientId: clientId,
				userId: testData.admin.id!,
				scopes: [.user],
				redirectUri: "https://example.com/callback",
				expiresAt: Date().addingTimeInterval(3600)  // Expires in 1 hour
			)
			try await authorizationCode.save(on: app.db)

			// Test POST request to /oauth/token with authorization code
			let authCodeParams = Components.Schemas.AuthorizationCodeGrantParams(
				grant_type: .authorization_code,
				code: authCode,
				redirect_uri: "https://example.com/callback"
			)
			let tokenData = Components.Schemas.OAuthTokenRequest
				.AuthorizationCodeGrantParams(authCodeParams)

			// Create basic auth header with client credentials
			let credentials = "\(clientId.uuidString):secret"
			let data = Data(credentials.utf8)
			let base64Credentials = data.base64EncodedString()
			var authHeaders = headers
			authHeaders.add(name: "Authorization", value: "Basic \(base64Credentials)")

			let response = try await apiTester.sendRequest(
				.POST,
				oauthTokenEndpoint,
				body: tokenData,
				headers: authHeaders
			)

			#expect(response.status == .ok)  // Should return 200 with access token
			let tokenResponse = try response.content.decode(
				Components.Schemas.OAuthTokenResponse.self)
			#expect(!tokenResponse.access_token.isEmpty)  // Access token should not be empty
			#expect(tokenResponse.token_type == .Bearer)  // Token type should be Bearer
			#expect(tokenResponse.refresh_token != nil)  // Should include refresh token
		}
	}

	@Test("OAuth token endpoint with authorization code grant - missing code")
	func testOAuthTokenEndpointWithAuthorizationCodeMissingCode() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Test POST request to /oauth/token with authorization code but missing code parameter
			let authCodeParams = Components.Schemas.AuthorizationCodeGrantParams(
				grant_type: .authorization_code,
				code: "",  // Empty code
				redirect_uri: "https://example.com/callback"
			)
			let tokenData = Components.Schemas.OAuthTokenRequest
				.AuthorizationCodeGrantParams(authCodeParams)

			// Create basic auth header with client credentials
			let credentials = "\(clientId.uuidString):secret"
			let data = Data(credentials.utf8)
			let base64Credentials = data.base64EncodedString()
			var authHeaders = headers
			authHeaders.add(name: "Authorization", value: "Basic \(base64Credentials)")

			let response = try await apiTester.sendRequest(
				.POST,
				oauthTokenEndpoint,
				body: tokenData,
				headers: authHeaders
			)

			#expect(response.status == .badRequest)  // Should return 400 for missing code
		}
	}

	@Test("OAuth token endpoint with authorization code grant - missing redirect_uri")
	func testOAuthTokenEndpointWithAuthorizationCodeMissingRedirectUri() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Create an authorization code
			let authCode = "auth-code-\(UUID().uuidString)"
			let authorizationCode = OAuthAuthorizationCode(
				code: authCode,
				clientId: clientId,
				userId: testData.admin.id!,
				scopes: [.user],
				redirectUri: "https://example.com/callback",
				expiresAt: Date().addingTimeInterval(3600)  // Expires in 1 hour
			)
			try await authorizationCode.save(on: app.db)

			// Test POST request to /oauth/token with authorization code but missing redirect_uri parameter
			let authCodeParams = Components.Schemas.AuthorizationCodeGrantParams(
				grant_type: .authorization_code,
				code: authCode,
				redirect_uri: ""  // Empty redirect_uri
			)
			let tokenData = Components.Schemas.OAuthTokenRequest
				.AuthorizationCodeGrantParams(authCodeParams)

			// Create basic auth header with client credentials
			let credentials = "\(clientId.uuidString):secret"
			let data = Data(credentials.utf8)
			let base64Credentials = data.base64EncodedString()
			var authHeaders = headers
			authHeaders.add(name: "Authorization", value: "Basic \(base64Credentials)")

			let response = try await apiTester.sendRequest(
				.POST,
				oauthTokenEndpoint,
				body: tokenData,
				headers: authHeaders
			)

			#expect(response.status == .badRequest)  // Should return 400 for missing redirect_uri
		}
	}

	@Test("OAuth token endpoint with refresh token grant")
	func testOAuthTokenEndpointWithRefreshTokenGrant() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Create an access token with refresh token
			let accessToken = try OAuthAccessToken(
				clientId: clientId,
				userId: testData.admin.id!,
				scopes: [.user],
				expiresAt: Date().addingTimeInterval(3600)  // Expires in 1 hour
			)
			try await accessToken.save(on: app.db)

			// Test POST request to /oauth/token with refresh token
			let refreshTokenParams = Components.Schemas.RefreshTokenGrantParams(
				grant_type: .refresh_token,
				refresh_token: accessToken.refreshToken ?? ""
			)
			let tokenData = Components.Schemas.OAuthTokenRequest
				.RefreshTokenGrantParams(refreshTokenParams)
			print("Requesting data \(tokenData)")

			// Create basic auth header with client credentials
			let credentials = "\(clientId.uuidString):secret"
			let data = Data(credentials.utf8)
			let base64Credentials = data.base64EncodedString()
			var authHeaders = headers
			authHeaders.add(name: "Authorization", value: "Basic \(base64Credentials)")

			let response = try await apiTester.sendRequest(
				.POST,
				oauthTokenEndpoint,
				body: tokenData,
				headers: authHeaders
			)

			#expect(response.status == .ok)  // Should return 200 with new access token
			let tokenResponse = try response.content.decode(
				Components.Schemas.OAuthTokenResponse.self)
			#expect(!tokenResponse.access_token.isEmpty)  // Access token should not be empty
			#expect(tokenResponse.token_type == .Bearer)  // Token type should be Bearer
			#expect(tokenResponse.refresh_token != nil)  // Should include refresh token
		}
	}

	@Test("OAuth token endpoint with refresh token grant - missing refresh token")
	func testOAuthTokenEndpointWithRefreshTokenMissingToken() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Test POST request to /oauth/token with refresh token but missing refresh_token parameter
			let refreshTokenParams = Components.Schemas.RefreshTokenGrantParams(
				grant_type: .refresh_token,
				refresh_token: ""  // Empty refresh token
			)
			let tokenData = Components.Schemas.OAuthTokenRequest
				.RefreshTokenGrantParams(refreshTokenParams)

			// Create basic auth header with client credentials
			let credentials = "\(clientId.uuidString):secret"
			let data = Data(credentials.utf8)
			let base64Credentials = data.base64EncodedString()
			var authHeaders = headers
			authHeaders.add(name: "Authorization", value: "Basic \(base64Credentials)")

			let response = try await apiTester.sendRequest(
				.POST,
				oauthTokenEndpoint,
				body: tokenData,
				headers: authHeaders
			)

			#expect(response.status == .badRequest)  // Should return 400 for missing refresh token
		}
	}

	@Test("OAuth token endpoint with client credentials grant")
	func testOAuthTokenEndpointWithClientCredentialsGrant() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: [],  // Client credentials don't need redirect URIs
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Test POST request to /oauth/token with client credentials
			let clientCredentialsParams = Components.Schemas
				.ClientCredentialsGrantParams(
					grant_type: .client_credentials
				)
			let tokenData = Components.Schemas.OAuthTokenRequest
				.ClientCredentialsGrantParams(clientCredentialsParams)

			// Create basic auth header with client credentials
			let credentials = "\(clientId.uuidString):secret"
			let data = Data(credentials.utf8)
			let base64Credentials = data.base64EncodedString()
			var authHeaders = headers
			authHeaders.add(name: "Authorization", value: "Basic \(base64Credentials)")

			let response = try await apiTester.sendRequest(
				.POST,
				oauthTokenEndpoint,
				body: tokenData,
				headers: authHeaders
			)

			#expect(response.status == .ok)  // Should return 200 with access token
			let tokenResponse = try response.content.decode(
				Components.Schemas.OAuthTokenResponse.self)
			#expect(!tokenResponse.access_token.isEmpty)  // Access token should not be empty
			#expect(tokenResponse.token_type == .Bearer)  // Token type should be Bearer
			#expect(tokenResponse.refresh_token == nil)  // Client credentials typically don't have refresh tokens

		}
	}

	// MARK: - OAuth Authorize Endpoint Unit Tests

	@Test("OAuth authorize endpoint with valid client and redirect URI")
	func testOAuthAuthorizeEndpointWithValidClient() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Test GET request to /oauth/authorize with valid client
			let response = try await apiTester.sendRequest(
				.GET,
				"\(oauthAuthorizeEndpoint)?client_id=\(clientId.uuidString)&redirect_uri=https://example.com/callback&state=test-state&response_type=code",
				headers: headers
			)

			#expect(response.status == .ok)  // Should return 200 with authorization code
			let authResponse = try response.content.decode(
				Operations.ApiOAuth_authorize.Output.Ok.Body.jsonPayload.self)
			#expect(!authResponse.authorization_code.isEmpty)  // Authorization code should not be empty
			#expect(authResponse.state == "test-state")  // State should be preserved
		}
	}

	@Test("OAuth authorize endpoint with invalid client ID")
	func testOAuthAuthorizeEndpointWithInvalidClientId() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			// Test GET request to /oauth/authorize with invalid client ID
			let invalidClientId = UUID()
			let response = try await apiTester.sendRequest(
				.GET,
				"\(oauthAuthorizeEndpoint)?client_id=\(invalidClientId.uuidString)&redirect_uri=https://example.com/callback&state=test-state&response_type=code",
				headers: headers
			)

			#expect(response.status == .unauthorized)  // Should return 401 for invalid client
		}
	}

	@Test("OAuth authorize endpoint with invalid redirect URI")
	func testOAuthAuthorizeEndpointWithInvalidRedirectUri() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Test GET request to /oauth/authorize with invalid redirect URI
			let response = try await apiTester.sendRequest(
				.GET,
				"\(oauthAuthorizeEndpoint)?client_id=\(clientId.uuidString)&redirect_uri=https://invalid.com/callback&state=test-state&response_type=code",
				headers: headers
			)

			#expect(response.status == .badRequest)  // Should return 400 for invalid redirect URI
		}
	}
	@Test("OAuth token endpoint with expired authorization code returns error")
	func testOAuthTokenEndpointWithExpiredAuthorizationCode() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Create an EXPIRED authorization code (expires 10 minutes ago)
			let authCode =
				"expired-auth-code-\(UUID().uuidString.replacingOccurrences(of: "-", with: ""))"
			let expiredAuthorizationCode = OAuthAuthorizationCode(
				code: authCode,
				clientId: clientId,
				userId: try testData.admin.requireID(),
				scopes: [.user],
				redirectUri: "https://example.com/callback",
				expiresAt: Date().addingTimeInterval(-600)  // Expired 10 minutes ago
			)
			try await expiredAuthorizationCode.save(on: app.db)

			// Test POST request to /oauth/token with expired authorization code
			let authCodeParams = Components.Schemas.AuthorizationCodeGrantParams(
				grant_type: .authorization_code,
				code: authCode,
				redirect_uri: "https://example.com/callback"
			)

			// Create basic auth header with client credentials
			let credentials = "\(clientId.uuidString):secret"
			let data = Data(credentials.utf8)
			let base64Credentials = data.base64EncodedString()
			var authHeaders = headers
			authHeaders.add(name: "Authorization", value: "Basic \(base64Credentials)")

			let response = try await apiTester.sendRequest(
				.POST,
				oauthTokenEndpoint,
				body: authCodeParams,
				headers: authHeaders
			)

			// Should return 400 (bad request) for expired authorization code
			#expect(response.status == .badRequest)
		}
	}

	@Test("Expired access token should not work for protected resources")
	func testExpiredAccessTokenDoesNotWorkForProtectedResources() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)

			let clientId = UUID()
			let oauthApp = try OAuthApp(
				clientId: clientId,
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Create an EXPIRED access token (expired 1 hour ago)
			let expiredAccessToken = try OAuthAccessToken(
				clientId: clientId,
				userId: testData.admin.id!,
				scopes: [.user],
				expiresAt: Date().addingTimeInterval(-3600)  // Expired 1 hour ago
			)
			try await expiredAccessToken.save(on: app.db)

			// Try to use the expired access token to access a protected resource
			// Using the user info endpoint as an example of a protected resource
			let expiredTokenHeaders: HTTPHeaders = [
				"Authorization": "Bearer \(expiredAccessToken.accessToken)"
			]

			// Attempt to access a protected resource with the expired token
			// This would typically be an endpoint that requires authentication
			let protectedResourceResponse = try await apiTester.sendRequest(
				.GET,
				"/api/session",  // Example protected endpoint
				headers: expiredTokenHeaders
			)

			#expect(protectedResourceResponse.status == .ok)
			let profile = try protectedResourceResponse.content.decode(
				Components.Schemas.CheckMyProfile.self)
			#expect(!profile.isIdentified)
		}
	}
}
