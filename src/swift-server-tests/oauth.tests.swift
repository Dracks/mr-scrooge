import Fluent
import Testing
import VaporTesting
import Exceptions
import Foundation

@testable import MrScroogeServer

@Suite("OAuth Tests")
final class OAuthTests: BaseWithFactories {
	let oauthAuthorizeEndpoint = "/api/oauth/authorize"
	let oauthClientsEndpoint = "/api/oauth/clients"
	let oauthTokenEndpoint = "/api/oauth/token"

	@Test("OAuth register client endpoint creates client in database")
	func testOAuthRegisterClientEndpoint() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user first for authentication
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

			// Test POST request to /oauth/clients
			let clientData = Operations.ApiOAuth_registerClient.Input.Body.jsonPayload(
				name: "Test Client",
				redirect_uris: ["https://example.com/callback"],
				scopes: [.userInfo]
			)

			let response = try await apiTester.sendRequest(
				.POST,
				oauthClientsEndpoint,
				body: clientData,
				headers: headers
			)

			#expect(response.status == .created) // Created

			// Verify the client was actually created in the database
			let oauthApps = try await OAuthApp.query(on: app.db).all()
			#expect(oauthApps.count == 1)
			#expect(oauthApps[0].name == "Test Client")
			#expect(oauthApps[0].redirectUris.contains("https://example.com/callback"))
		}
	}

	@Test("OAuth get client endpoint retrieves from database")
	func testOAuthGetClientEndpoint() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

			let oauthApp = try OAuthApp(
				clientId: UUID(),
				name: "Test Client",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Test GET request to /oauth/clients/{clientId}
			let response = try await apiTester.sendRequest(
				.GET,
				"\(oauthClientsEndpoint)/\(oauthApp.clientId.uuidString)",
				headers: headers
			)

			#expect(response.status == .ok) // Success
		}
	}

	@Test("OAuth delete client endpoint removes from database")
	func testOAuthDeleteClientEndpoint() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

			let oauthApp = try OAuthApp(
				clientId: UUID(),
				name: "Test Client to Delete",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Verify the app exists initially
			let initialCount = try await OAuthApp.query(on: app.db).count()
			#expect(initialCount == 1)

			// Test DELETE request to /oauth/clients/{clientId}
			let response = try await apiTester.sendRequest(
				.DELETE,
				"\(oauthClientsEndpoint)/\(oauthApp.clientId.uuidString)",
				headers: headers
			)

			#expect(response.status == .noContent) // No content

			// Verify the app was deleted from the database
			let finalCount = try await OAuthApp.query(on: app.db).count()
			#expect(finalCount == 0)
		}
	}

	@Test("OAuth authorize endpoint with valid credentials creates authorization code")
	func testOAuthAuthorizeEndpointWithValidCredentials() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

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

			// Test GET request to /oauth/authorize with proper query params
			let response = try await apiTester.sendRequest(
				.GET,
				"\(oauthAuthorizeEndpoint)?client_id=\(clientId.uuidString)&redirect_uri=https://example.com/callback&state=qwer",
				headers: headers
			)

			// Should return 200 with authorization code
			#expect(response.status == .ok)
			
			let data = try response.content.decode(
				Operations.ApiOAuth_authorize.Output.Ok.Body.jsonPayload.self)

			// Verify that an authorization code was created in the database
			let authCodes = try await OAuthAuthorizationCode.query(on: app.db).all()
			#expect(authCodes.count == 1)
			guard let code = authCodes.first else {
			return
			}
			#expect(code.$app.id == clientId)
			#expect(code.$user.id == testData.admin.id!)
			#expect(data.body.authorization_code == code.code)
		}
	}

	@Test("OAuth authorize endpoint with invalid client ID returns error")
	func testOAuthAuthorizeEndpointWithInvalidClientId() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user but no OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

			// Test GET request to /oauth/authorize with non-existent client ID
			let invalidClientId = UUID()
			let response = try await apiTester.sendRequest(
				.GET,
				"\(oauthAuthorizeEndpoint)?request=\(invalidClientId.uuidString)&redirect_uri=https://example.com/callback",
				headers: headers
			)

			// Should return 401 (unauthorized) since client doesn't exist
			#expect(response.status == .unauthorized)
		}
	}

	@Test("OAuth authorize endpoint with invalid redirect URI returns error")
	func testOAuthAuthorizeEndpointWithInvalidRedirectUri() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

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
				"\(oauthAuthorizeEndpoint)?request=\(clientId.uuidString)&redirect_uri=https://evil.com/callback",
				headers: headers
			)

			// Should return 400 (bad request) for invalid redirect URI
			#expect(response.status == .badRequest)
		}
	}

	@Test("OAuth token endpoint exchanges authorization code for access token")
	func testOAuthTokenEndpointWithAuthorizationCode() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

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
			let authCode = "test-auth-code-\(UUID().uuidString.replacingOccurrences(of: "-", with: ""))"
			let authorizationCode = OAuthAuthorizationCode(
				code: authCode,
				clientId: clientId,
				userId: testData.admin.id!,
				scopes: [.user],
				redirectUri: "https://example.com/callback",
				expiresAt: Date().addingTimeInterval(300) // Expires in 5 minutes
			)
			try await authorizationCode.save(on: app.db)

			// Test POST request to /oauth/token with authorization code
			let tokenData = Components.Schemas.OAuthTokenRequest(
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
				body: tokenData,
				headers: authHeaders
			)

			// Should return 200 with access token
			#expect(response.status == .ok)

			// Verify that an access token was created in the database
			let accessTokens = try await OAuthAccessToken.query(on: app.db).all()
			#expect(accessTokens.count == 1)
			#expect(accessTokens[0].$app.id == clientId)
			#expect(accessTokens[0].$user.id == testData.admin.id!)
		}
	}

	@Test("OAuth token endpoint with invalid authorization code returns error")
	func testOAuthTokenEndpointWithInvalidAuthorizationCode() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

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

			// Test POST request to /oauth/token with invalid authorization code
			let tokenData = Components.Schemas.OAuthTokenRequest(
				grant_type: .authorization_code,
				code: "invalid-auth-code",
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
				body: tokenData,
				headers: authHeaders
			)

			// Should return 400 (bad request) for invalid authorization code
			#expect(response.status == .badRequest)
		}
	}

	@Test("OAuth token endpoint with invalid client credentials returns error")
	func testOAuthTokenEndpointWithInvalidClientCredentials() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

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

			// Test POST request to /oauth/token with wrong client secret
			let tokenData = Components.Schemas.OAuthTokenRequest(
				grant_type: .authorization_code,
				code: "some-code",
				redirect_uri: "https://example.com/callback"
			)

			// Create basic auth header with wrong client secret
			let credentials = "\(clientId.uuidString):wrong-secret"
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

			// Should return 401 (unauthorized) for invalid client credentials
			#expect(response.status == .unauthorized)
		}
	}

	@Test("OAuth token endpoint with refresh token grant")
	func testOAuthTokenEndpointWithRefreshToken() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(forUser: .init(username: testData.admin.username, password: testData.adminPwd))

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
			let refreshToken = "refresh-\(UUID().uuidString)"
			let accessToken = OAuthAccessToken(
				accessToken: "access-\(UUID().uuidString)",
				refreshToken: refreshToken,
				clientId: clientId,
				userId: testData.admin.id!,
				scopes: [.user],
				expiresAt: Date().addingTimeInterval(3600) // Expires in 1 hour
			)
			try await accessToken.save(on: app.db)

			// Test POST request to /oauth/token with refresh token
			let tokenData = Components.Schemas.OAuthTokenRequest(
				grant_type: .refresh_token,
				refresh_token: refreshToken
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
				body: tokenData,
				headers: authHeaders
			)

			// Should return 200 with new access token
			#expect(response.status == .ok)
		}
	}

	@Test("OAuth endpoints require authentication where appropriate")
	func testOAuthEndpointsAuthentication() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Test that endpoints that should require authentication behave appropriately
			// We're checking that they return 401 (unauthorized) when not authenticated
			// rather than 501 (not implemented)

			let authRequiredResponse = try await apiTester.sendRequest(
				.GET,
				"\(oauthClientsEndpoint)/some-client-id"
			)

			// Expect 401 (unauthorized) rather than 501 (not implemented)
			#expect(authRequiredResponse.status == .unauthorized || authRequiredResponse.status == .forbidden) // Unauthorized or forbidden
		}
	}

	@Test("OAuth register client endpoint requires admin user")
	func testOAuthRegisterClientRequiresAdmin() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create admin and regular user
			let testData = try await createGroupsAndUsers(app: app)

			// Try to register client with regular user - should fail
			let regularUserHeaders = try await apiTester.headers(forUser: .init(username: testData.user.username, password: testData.userPwd))

			let clientData = Operations.ApiOAuth_registerClient.Input.Body.jsonPayload(
				name: "Test Client",
				redirect_uris: ["https://example.com/callback"],
				scopes: [.userInfo]
			)

			let response = try await apiTester.sendRequest(
				.POST,
				oauthClientsEndpoint,
				body: clientData,
				headers: regularUserHeaders
			)

			#expect(response.status == .unauthorized)

			// Verify the client was NOT created in the database
			let oauthApps = try await OAuthApp.query(on: app.db).all()
			#expect(oauthApps.isEmpty)
		}
	}

	@Test("OAuth delete client endpoint requires admin user")
	func testOAuthDeleteClientRequiresAdmin() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create admin and regular user
			let testData = try await createGroupsAndUsers(app: app)

			// Create an OAuth app first
			let oauthApp = try OAuthApp(
				clientId: UUID(),
				name: "Test Client to Delete",
				description: nil,
				clientSecret: "secret",
				redirectUris: ["https://example.com/callback"],
				scopes: [.user]
			)
			try await oauthApp.save(on: app.db)

			// Verify the app exists initially
			let initialCount = try await OAuthApp.query(on: app.db).count()
			#expect(initialCount == 1)

			// Try to delete client with regular user - should fail
			let regularUserHeaders = try await apiTester.headers(forUser: .init(username: testData.user.username, password: testData.userPwd))

			let response = try await apiTester.sendRequest(
				.DELETE,
				"\(oauthClientsEndpoint)/\(oauthApp.clientId.uuidString)",
				headers: regularUserHeaders
			)

			// Should return 403 Forbidden for non-admin user
			#expect(response.status == .forbidden)

			// Verify the app was NOT deleted from the database
			let countAfterFailedDelete = try await OAuthApp.query(on: app.db).count()
			#expect(countAfterFailedDelete == 1)
		}
	}

	@Test("OAuth list clients endpoint requires admin user")
	func testOAuthListClientsRequiresAdmin() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create admin and regular user
			let testData = try await createGroupsAndUsers(app: app)

			// Try to list clients with regular user - should fail
			let regularUserHeaders = try await apiTester.headers(forUser: .init(username: testData.user.username, password: testData.userPwd))

			let response = try await apiTester.sendRequest(
				.GET,
				oauthClientsEndpoint,
				headers: regularUserHeaders
			)

			// Should return 403 Forbidden for non-admin user
			#expect(response.status == .forbidden)
		}
	}
}