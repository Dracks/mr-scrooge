import GraphQLKit
import Graphiti
import OrderedCollections
import Vapor
import XCTest

@testable import App

final class SessionTests: AbstractBaseTestsClass {
	let loginEndpoint = "/api/session/login"
	let meEndpoint = "/api/session/me"
	let logoutEndpoint = "/api/session/logout"

	func testLoginEndpointWithValidCredentials() async throws {
		let app = try getApp()

		let login = SessionController.Credentials(
			username: "test-user", password: "test-password")
		let response = try await app.sendRequest(.POST, loginEndpoint, body: login)
		XCTAssertEqual(response.status, .ok)
        let profile = try response.content.decode(ProfileController.GetProfile.self)
        XCTAssertEqual(profile.username, testUser.username)
        XCTAssertEqual(profile.isAdmin, testUser.isAdmin)
	}

	func testLoginEndpointWithInvalidCredentials() async throws {
		let app = try getApp()

		let login = SessionController.Credentials(
			username: "test-user", password: "wrong-password")
		let response = try await app.sendRequest(.POST, loginEndpoint, body: login)
		XCTAssertEqual(response.status, .unauthorized)
	}

	func testMeEndpointWithValidSession() async throws {
		let app = try getApp()

        let headers = try await app.getHeaders(forUser: SessionController.Credentials(username: "test-user", password: "test-password"))

		let response = try await app.sendRequest(.GET, meEndpoint, headers: headers)
		XCTAssertEqual(response.status, .ok)
	}

	func testMeEndpointWithInvalidSession() async throws {
		let app = try getApp()

		let response = try await app.sendRequest(.GET, meEndpoint)
        XCTAssertEqual(response.status, .unprocessableEntity)
	}

	func testLogoutEndpoint() async throws {
		let app = try getApp()

		let login = SessionController.Credentials(
			username: "test-user", password: "test-password")
		let loginResponse = try await app.sendRequest(.POST, loginEndpoint, body: login)
		let headers = loginResponse.headers

		let response = try await app.sendRequest(.POST, logoutEndpoint, headers: headers)
		XCTAssertEqual(response.status, .ok)
	}
}
