import Fluent
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

	func testUpdateMe() async throws {
		let app = try getApp()

		try await testUser.$groups.attach(testGroup2, on: app.db)

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password"))

		var newUserInfo = Components.Schemas.UpdateMyProfile(
			username: testUser.username,
			email: "test@tests-change.com",
			firstName: "First name 2",
			lastName: "Last Name 2",
			defaultGroupId: testGroup2.id!.uuidString
		)

		let response = try await app.sendRequest(
			.PUT, "/api/session/me", body: newUserInfo,
			headers: headers)

		XCTAssertEqual(response.status, .ok)

		let user = try response.content.decode(Components.Schemas.UserProfile.self)
		XCTAssertEqual(user.email, "test@tests-change.com")
		XCTAssertEqual(user.firstName, "First name 2")
		XCTAssertEqual(user.lastName, "Last Name 2")
		XCTAssertEqual(user.isActive, true)
		XCTAssertEqual(user.isAdmin, false)
		XCTAssertEqual(user.defaultGroupId, testGroup2.id!.uuidString)

		var userFromDb = try await User.query(on: app.db).filter(\.$id == testUser.id!)
			.first()
		XCTAssertTrue(userFromDb!.verifyPassword(pwd: "test-password"))

		newUserInfo.password = "test-password"
		newUserInfo.newPassword = "new-password"

		let response2 = try await app.sendRequest(
			.PUT, "/api/session/me", body: newUserInfo,
			headers: headers)

		XCTAssertEqual(response2.status, .ok)

		userFromDb = try await User.query(on: app.db).filter(\.$id == testUser.id!).first()
		XCTAssertTrue(userFromDb!.verifyPassword(pwd: "new-password"))
		XCTAssertFalse(userFromDb!.verifyPassword(pwd: "test-password"))
	}

	func testUpdateMeInvalidUUID() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password"))

		let newUserInfo = Components.Schemas.UpdateMyProfile(
			username: testUser.username,
			email: "test@tests-change.com",
			firstName: "First name 2",
			lastName: "Last Name 2",
			defaultGroupId: "1111111"
		)

		let response = try await app.sendRequest(
			.PUT, "/api/session/me", body: newUserInfo,
			headers: headers)

		XCTAssertEqual(response.status, .badRequest)

		let error = try response.content.decode(Components.Schemas._Error.self)
		XCTAssertEqual(error.code, "API10017")
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
