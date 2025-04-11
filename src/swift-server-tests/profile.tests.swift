import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Profile Tests")
final class ProfileTests: BaseWithFactories {
	@Test("List users for admin")
	func testListUsersForAdmin() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let response = try await apiTester.sendRequest(
				.GET, "/api/users", headers: headers)

			#expect(response.status == .ok)

			let data = try response.content.decode(
				Operations.ApiUser_list.Output.Ok.Body.jsonPayload.self)

			#expect(data.results.count == 2)
		}
	}

	@Test("List users as regular user")
	func testListUsers() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let response = try await apiTester.sendRequest(
				.GET, "/api/users", headers: headers)

			#expect(response.status == .unauthorized)

			let data = try response.content.decode(Components.Schemas._Error.self)

			#expect(data.code == "API10013")
		}
	}

	@Test("Update my profile")
	func testUpdateMyProfile() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let newUserInfo = Components.Schemas.UpdateUserData(
				username: testData.user.username,
				email: "test@test-change.com",
				firstName: "First naming",
				lastName: "Last naming",
				isActive: true,
				isAdmin: true,
				defaultGroupId: testData.group.id!.uuidString
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/users/\(testData.user.requireID().uuidString)",
				body: newUserInfo,
				headers: headers)

			#expect(response.status == .unauthorized)

			let error = try response.content.decode(Components.Schemas._Error.self)
			#expect(error.code == "API10014")
		}
	}

	@Test("Update other profile as admin")
	func testUpdateOtherProfileAsAdmin() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			var newUserInfo = Components.Schemas.UpdateUserData(
				username: testData.user.username,
				email: "test@test-change.com",
				firstName: "First naming",
				lastName: "Last naming",
				isActive: false,
				isAdmin: true,
				defaultGroupId: testData.group.id!.uuidString
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/users/\(testData.user.requireID().uuidString)",
				body: newUserInfo,
				headers: headers)

			#expect(response.status == .ok)

			let user = try response.content.decode(Components.Schemas.UserProfile.self)
			#expect(user.email == "test@test-change.com")
			#expect(user.firstName == "First naming")
			#expect(user.lastName == "Last naming")
			#expect(user.isActive == false)
			#expect(user.isAdmin == true)
			#expect(user.defaultGroupId == testData.group.id!.uuidString)

			var userFromDb = try await User.query(on: app.db).filter(
				\.$id == testData.user.id!
			)
			.first()
			#expect(userFromDb!.verifyPassword(pwd: testData.userPwd))

			newUserInfo.password = "new-password"

			let response2 = try await apiTester.sendRequest(
				.PUT, "/api/users/\(testData.user.requireID().uuidString)",
				body: newUserInfo,
				headers: headers)

			#expect(response2.status == .ok)

			userFromDb = try await User.query(on: app.db).filter(
				\.$id == testData.user.id!
			).first()
			#expect(userFromDb!.verifyPassword(pwd: "new-password"))
			#expect(!userFromDb!.verifyPassword(pwd: testData.userPwd))
		}
	}

	@Test("Update with invalid default group ID")
	func testUpdateWithInvalidDefaultGroupId() async throws {}

	@Test("Create user as regular user")
	func testCreateUserAsUser() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let newUser = Components.Schemas.CreateUserInput(
				username: "Some new user",
				email: "test@test-change.com",
				firstName: "First naming",
				lastName: "Last naming",
				isActive: true,
				isAdmin: true,
				password: "Some stupid password"
			)

			let response = try await apiTester.sendRequest(
				.POST, "/api/users/", body: newUser,
				headers: headers)

			#expect(response.status == .unauthorized)
		}
	}

	@Test("Create user as admin")
	func testCreateUserAsAdmin() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let newUser = Components.Schemas.CreateUserInput(
				username: "Some new user",
				email: "test@test-change.com",
				firstName: "First naming",
				lastName: "Last naming",
				isActive: true,
				isAdmin: false,
				password: "Some stupid password"
			)

			let response = try await apiTester.sendRequest(
				.POST, "/api/users/", body: newUser,
				headers: headers)

			#expect(response.status == .created)
			let user = try response.content.decode(Components.Schemas.UserProfile.self)
			#expect(user.username == "Some new user")
			#expect(user.email == "test@test-change.com")
			#expect(user.firstName == "First naming")
			#expect(user.lastName == "Last naming")
			#expect(user.isActive == true)
			#expect(user.isAdmin == false)
		}
	}

	@Test("Delete user")
	func testDeleteUser() async throws {}

	@Test("Delete user as admin")
	func testDeleteUserAsAdmin() async throws {}
}
