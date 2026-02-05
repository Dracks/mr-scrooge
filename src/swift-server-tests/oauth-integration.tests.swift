import Exceptions
import Fluent
import Foundation
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("OAuth Integration Tests")
final class OAuthIntTests: BaseWithFactories {
	let oauthClientsEndpoint = "/api/oauth/clients"
	let oauthAuthorizeEndpoint = "/api/oauth/authorize"
	let oauthTokenEndpoint = "/api/oauth/token"
	let userInfoEndpoint = "/api/session"

	@Test(
		"OAuth full flow: create app, register client, authorize, get token, and check user data"
	)
	func testOAuthFullFlow() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Step 1: Create an admin user for authentication
			let testData = try await createGroupsAndUsers(app: app)
			let adminHeaders = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))
			// Step 2: Register an OAuth client using the API
			let clientData = Operations.ApiOAuth_registerClient.Input.Body.jsonPayload(
				name: "Full Flow Test Client",
				redirect_uris: ["https://example.com/callback"],
				scopes: [.userInfo]  // Assuming this scope allows getting user info
			)

			let registerResponse = try await apiTester.sendRequest(
				.POST,
				oauthClientsEndpoint,
				body: clientData,
				headers: adminHeaders
			)
			#expect(
				registerResponse.status == .created,
				"OAuth client should be registered successfully")
			// Decode the response to get the client ID and secret
			let registeredClient = try registerResponse.content.decode(
				Components.Schemas.OAuthClientWithSecret.self)

			let clientId = registeredClient.client_id
			let clientSecret = registeredClient.secret
			#expect(!clientId.isEmpty, "Client ID should not be empty")
			#expect(!clientSecret.isEmpty, "Client secret should not be empty")

			// Verify the client was actually created in the database
			let oauthApps = try await OAuthApp.query(on: app.db).all()
			#expect(oauthApps.count == 1, "One OAuth app should be created")
			let oauthApp = oauthApps[0]
			#expect(
				oauthApp.name == "Full Flow Test Client",
				"OAuth app name should match")
			#expect(
				oauthApp.redirectUris.contains("https://example.com/callback"),
				"Redirect URI should match")

			// Step 3: Perform OAuth authorization to get an authorization code
			let userHeaders = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username,
					password: testData.userPwd))

			let authorizeResponse = try await apiTester.sendRequest(
				.GET,
				"\(oauthAuthorizeEndpoint)?client_id=\(clientId)&redirect_uri=https://example.com/callback&state=test-state&scope=userInfo&response_type=code",
				headers: userHeaders
			)

			#expect(
				authorizeResponse.status == .ok,
				"Authorization should be successful")

			// Decode the authorization response to get the authorization code
			let authorizeResult = try authorizeResponse.content.decode(
				Operations.ApiOAuth_authorize.Output.Ok.Body.jsonPayload.self)
			let authorizationCode = authorizeResult.authorization_code
			#expect(
				!authorizationCode.isEmpty, "Authorization code should not be empty"
			)

			// Verify that an authorization code was created in the database
			let authCodes = try await OAuthAuthorizationCode.query(on: app.db).all()
			#expect(authCodes.count == 1, "One authorization code should be created")
			let authCode = authCodes[0]
			#expect(
				authCode.code == authorizationCode,
				"Authorization code should match")

			// Step 4: Exchange the authorization code for an access token
			let authCodeParams = Components.Schemas.AuthorizationCodeGrantParams(
				grant_type: .authorization_code,
				code: authorizationCode,
				redirect_uri: "https://example.com/callback"
			)

			// Create basic auth header with client credentials
			let credentials = "\(clientId):\(clientSecret)"
			let credentialsData = Data(credentials.utf8)
			let base64Credentials = credentialsData.base64EncodedString()
			let tokenHeaders: HTTPHeaders = [
				"Authorization": "Basic \(base64Credentials)"
			]

			let tokenResponse = try await apiTester.sendRequest(
				.POST,
				oauthTokenEndpoint,
				body: authCodeParams,
				headers: tokenHeaders
			)

			#expect(tokenResponse.status == .ok, "Token exchange should be successful")

			// Decode the token response to get the access token
			let tokenResult = try tokenResponse.content.decode(
				Components.Schemas.OAuthTokenResponse.self)
			let accessToken = tokenResult.access_token
			#expect(!accessToken.isEmpty, "Access token should not be empty")

			// Verify that an access token was created in the database
			let accessTokens = try await OAuthAccessToken.query(on: app.db).all()
			#expect(accessTokens.count == 1, "One access token should be created")
			let accessTokenObj = accessTokens[0]
			#expect(
				accessTokenObj.accessToken == accessToken,
				"Access token should match")

			// Step 5: Use the access token to access protected resource (user info)
			let userInfoHeaders: HTTPHeaders = [
				"Authorization": "Bearer \(accessToken)"
			]

			let userInfoResponse = try await apiTester.sendRequest(
				.GET,
				userInfoEndpoint,  // Adjust this endpoint as needed
				headers: userInfoHeaders
			)

			#expect(
				userInfoResponse.status == .ok,
				"User info access should be successful")

			let profile = try userInfoResponse.content.decode(
				Components.Schemas.CheckMyProfile.self)
			#expect(profile.isIdentified)

			// Verify that the access token was properly associated with the user
			#expect(
				accessTokenObj.$user.id == testData.user.id!,
				"Access token should be linked to the correct user")
		}

	}
}
