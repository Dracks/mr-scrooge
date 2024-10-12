import XCTVapor
import XCTest

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
}
