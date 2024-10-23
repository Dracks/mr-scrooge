import XCTVapor
import XCTest
import Fluent

@testable import MrScroogeServer

final class ProfileTests: AbstractBaseTestsClass {
	func testListUsersForAdmin() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testAdmin.username, password: "test-admin-password"))

		let response = try await app.sendRequest(.GET, "/api/users", headers: headers)

		XCTAssertEqual(response.status, .ok)

		let data = try response.content.decode(
			Operations.ApiUser_list.Output.Ok.Body.jsonPayload.self)

		XCTAssertEqual(data.results.count, 2)
	}

	func testListUsers() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(.GET, "/api/users", headers: headers)

		XCTAssertEqual(response.status, .unauthorized)

		let data = try response.content.decode(Components.Schemas._Error.self)

		XCTAssertEqual(data.code, "API10013")
	}

	func testUpdateMyProfile() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password"))

		let newUserInfo = Components.Schemas.UpdateUserData(
			username: testUser.username,
			email: "test@test-change.com",
			firstName: "First naming",
			lastName: "Last naming",
			isActive: true,
			isAdmin: true,
			defaultGroupId: testGroup.id!.uuidString
		)

		let response = try await app.sendRequest(
			.PUT, "/api/users/\(testUser.requireID().uuidString)", body: newUserInfo,
			headers: headers)

		XCTAssertEqual(response.status, .unauthorized)

		let error = try response.content.decode(Components.Schemas._Error.self)
		XCTAssertEqual(error.code, "API10014")
	}

	func testUpdateOtherProfileAsAdmin() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testAdmin.username, password: "test-admin-password"))

		var newUserInfo = Components.Schemas.UpdateUserData(
			username: testUser.username,
			email: "test@test-change.com",
			firstName: "First naming",
			lastName: "Last naming",
			isActive: false,
			isAdmin: true,
			defaultGroupId: testGroup.id!.uuidString
		)

		let response = try await app.sendRequest(
			.PUT, "/api/users/\(testUser.requireID().uuidString)", body: newUserInfo,
			headers: headers)

		XCTAssertEqual(response.status, .ok)

		let user = try response.content.decode(Components.Schemas.UserProfile.self)
		XCTAssertEqual(user.email, "test@test-change.com")
		XCTAssertEqual(user.firstName, "First naming")
		XCTAssertEqual(user.lastName, "Last naming")
		XCTAssertEqual(user.isActive, false)
		XCTAssertEqual(user.isAdmin, true)
		XCTAssertEqual(user.defaultGroupId, testGroup.id!.uuidString)

		var userFromDb = try await User.query(on: app.db).filter(\.$id == testUser.id!)
			.first()
		XCTAssertTrue(userFromDb!.verifyPassword(pwd: "test-password"))

		newUserInfo.password = "new-password"

		let response2 = try await app.sendRequest(
			.PUT, "/api/users/\(testUser.requireID().uuidString)", body: newUserInfo,
			headers: headers)

		XCTAssertEqual(response2.status, .ok)

		userFromDb = try await User.query(on: app.db).filter(\.$id == testUser.id!).first()
		XCTAssertTrue(userFromDb!.verifyPassword(pwd: "new-password"))
		XCTAssertFalse(userFromDb!.verifyPassword(pwd: "test-password"))
	}

	func testUpdateWithInvalidDefaultGroupId() async throws {}

	func testCreateUser() async throws {}

	func testCreateUserAsAdmin() async throws {}

	func testDeleteUser() async throws {}

	func testDeleteUserAsAdmin() async throws {}
}
