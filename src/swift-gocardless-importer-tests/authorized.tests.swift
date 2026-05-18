import Fluent
import Testing
import VaporTesting

@testable import GoCardlessImporter

@Suite("Authorization Tests")
struct AuthorizationTests {
	@Test("Main page shows login for guest")
	func testMainPageShowsLoginForGuest() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("GoCardLess Importer"))
			#expect(body.contains("Login with MrScrooge"))
		}
	}

	@Test("Authorized endpoint without code shows error page")
	func testAuthorizedPageWithoutCodeShowsError() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/authorized")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error"))
			#expect(body.contains("Authorization code"))
		}
	}

	@Test("Authorized endpoint loads correctly with correct code")
	func testAuthorizedPageLoadsCorrectly() async throws {
		let tokenResponse = Components.Schemas.OAuthTokenResponse(
			access_token: "test-access-token",
			token_type: .Bearer,
			expires_in: 3600,
			refresh_token: "test-refresh-token"
		)

		let profile = Components.Schemas.UserProfile(
			id: UUID().uuidString,
			username: "testuser",
			email: "test@example.com",
			isAdmin: false,
			isActive: true,
			groups: [],
			defaultGroupId: UUID().uuidString
		)
		let checkProfile = Components.Schemas.CheckMyProfile.identified(
			Components.Schemas.GetMyProfile(user: .identified, profile: profile)
		)

		try await withImporterApp(mrScroogeMocks: [
			.init(
				operationID: "ApiOAuth_token",
				response: .json(status: 200, body: tokenResponse)
			),
			.init(
				operationID: "ApiSession_me",
				response: .json(status: 200, body: checkProfile)
			),
		]) { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/authorized?authorization_code=abc-123-def")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Successfully Authenticated"))
			#expect(body.contains("testuser"))
		}
	}
}

