import Vapor
import XCTest

@testable import MrScroogeServer

final class SessionTests: AbstractBaseTestsClass {
	let loginEndpoint = "/api/session"
	let meEndpoint = "/api/session"
	let logoutEndpoint = "/api/session"

	func testLoginEndpointWithValidCredentials() async throws {
		let app = try getApp()

		let login = Components.Schemas.UserCredentials(
			username: "test-user", password: "test-password")
		let response = try await app.sendRequest(.POST, loginEndpoint, body: login)
		XCTAssertEqual(response.status, .ok)
		let profile = try response.content.decode(Components.Schemas.UserProfile.self)
		XCTAssertEqual(profile.username, testUser.username)
		XCTAssertEqual(profile.isAdmin, testUser.isAdmin)
	}

	func testLoginEndpointWithInvalidCredentials() async throws {
		let app = try getApp()

		let login = Components.Schemas.UserCredentials(
			username: "test-user", password: "wrong-password")
		let response = try await app.sendRequest(.POST, loginEndpoint, body: login)
		XCTAssertEqual(response.status, .unauthorized)
	}

	func testMeEndpointWithValidSession() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: Components.Schemas.UserCredentials(
				username: "test-user", password: "test-password"))

		let response = try await app.sendRequest(.GET, meEndpoint, headers: headers)
		XCTAssertEqual(response.status, .ok)
	}

	func testMeEndpointWithInvalidSession() async throws {
		let app = try getApp()

		let response = try await app.sendRequest(.GET, meEndpoint)
		XCTAssertEqual(response.status, .ok)

		let notIdentified = try response.content.decode(
			Components.Schemas.NotIdentified.self)
		XCTAssertEqual(notIdentified.user, .anonymous)
	}

	func testLogoutEndpoint() async throws {
		let app = try getApp()

		let login = Components.Schemas.UserCredentials(
			username: "test-user", password: "test-password")
		let loginResponse = try await app.sendRequest(.POST, loginEndpoint, body: login)
		let headers = loginResponse.headers

		let response = try await app.sendRequest(.DELETE, logoutEndpoint, headers: headers)
		XCTAssertEqual(response.status, .ok)
	}
}
