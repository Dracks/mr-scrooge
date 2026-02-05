import Exceptions
import Fluent
import Foundation
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("OAuth App Tests")
final class OAuthAppTests: BaseWithFactories {
	let oauthClientsEndpoint = "/api/oauth/clients"
	let oauthTokenEndpoint = "/api/oauth/token"

	@Test("OAuth register client endpoint creates client in database")
	func testOAuthRegisterClientEndpoint() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user first for authentication
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

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

			#expect(response.status == .created)  // Created

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
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

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

			#expect(response.status == .ok)  // Success
		}
	}

	@Test("OAuth delete client endpoint removes from database")
	func testOAuthDeleteClientEndpoint() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create a user and OAuth app
			let testData = try await createGroupsAndUsers(app: app)
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

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

			#expect(response.status == .noContent)  // No content

			// Verify the app was deleted from the database
			let finalCount = try await OAuthApp.query(on: app.db).count()
			#expect(finalCount == 0)
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

			#expect(authRequiredResponse.status == .unauthorized)
		}
	}

	@Test("OAuth register client endpoint requires admin user")
	func testOAuthRegisterClientRequiresAdmin() async throws {
		try await withApp { app in
			let apiTester = try app.testing()

			// Create admin and regular user
			let testData = try await createGroupsAndUsers(app: app)

			// Try to register client with regular user - should fail
			let regularUserHeaders = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

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
			let regularUserHeaders = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let response = try await apiTester.sendRequest(
				.DELETE,
				"\(oauthClientsEndpoint)/\(oauthApp.clientId.uuidString)",
				headers: regularUserHeaders
			)

			// Should return 403 Forbidden for non-admin user
			#expect(response.status == .unauthorized)

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
			let regularUserHeaders = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let response = try await apiTester.sendRequest(
				.GET,
				oauthClientsEndpoint,
				headers: regularUserHeaders
			)

			#expect(response.status == .unauthorized)
		}
	}

}
