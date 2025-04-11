import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Session Tests")
final class SessionTests: BaseWithFactories {
	let loginEndpoint = "/api/session"
	let meEndpoint = "/api/session"
	let logoutEndpoint = "/api/session"

	func addLoginAttempts(for username: String, amount count: Int, time: Date, on db: Database)
		async throws
	{
		for _ in 1...count {
			try await UserLoginAttempt(username: username, timestamp: time).save(
				on: db)
		}
	}

	@Test("Login endpoint with valid credentials")
	func testLoginEndpointWithValidCredentials() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let login = Components.Schemas.UserCredentials(
				username: testData.user.username, password: testData.userPwd)

			let apiTester = try app.testing()
			let response = try await apiTester.sendRequest(
				.POST, loginEndpoint, body: login)

			#expect(response.status == .ok)
			let profile = try response.content.decode(
				Components.Schemas.UserProfile.self)
			#expect(profile.username == testData.user.username)
			#expect(profile.isAdmin == testData.user.isAdmin)
		}
	}

	@Test("Login endpoint with invalid credentials")
	func testLoginEndpointWithInvalidCredentials() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let login = Components.Schemas.UserCredentials(
				username: testData.user.username, password: "wrong-password")

			let apiTester = try app.testing()
			let response = try await apiTester.sendRequest(
				.POST, loginEndpoint, body: login)
			#expect(response.status == .unauthorized)
		}
	}

	@Test("Login endpoint with invalid credentials blocks the account")
	func testLoginEndpointWithInvalidCredentialsBlockTheAccount() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			try await addLoginAttempts(
				for: testData.user.username,
				amount: EnvConfig.shared.maxLoginAttempts - 1, time: Date(),
				on: app.db)

			let apiTester = try app.testing()

			// login that triggers the maximum
			let invalidLogin = Components.Schemas.UserCredentials(
				username: testData.user.username, password: "wrong-password")
			var response = try await apiTester.sendRequest(
				.POST, loginEndpoint, body: invalidLogin)
			#expect(response.status == .unauthorized)

			let login = Components.Schemas.UserCredentials(
				username: testData.user.username, password: testData.userPwd)
			response = try await apiTester.sendRequest(
				.POST, loginEndpoint, body: login)
			#expect(response.status == .unauthorized)
		}
	}

	@Test("Login endpoint after period window with valid credentials")
	func testLoginEndpointAfterThePeriodWindowOfTheBlockWithValidCredentials() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let unauthorizedAttemptsDate: Date = Date(
				timeIntervalSinceNow:
					-(EnvConfig.shared.maxLoginAttemptsTimePeriod + 1)
			)
			try await addLoginAttempts(
				for: testData.user.username,
				amount: EnvConfig.shared.maxLoginAttempts,
				time: unauthorizedAttemptsDate,
				on: app.db)

			let apiTester = try app.testing()
			let login = Components.Schemas.UserCredentials(
				username: testData.user.username, password: testData.userPwd)
			let response = try await apiTester.sendRequest(
				.POST, loginEndpoint, body: login)
			#expect(response.status == .ok)
			let profile = try response.content.decode(
				Components.Schemas.UserProfile.self)
			#expect(profile.username == testData.user.username)
			#expect(profile.isAdmin == testData.user.isAdmin)
		}
	}

	@Test("Me endpoint with valid session")
	func testMeEndpointWithValidSession() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: Components.Schemas.UserCredentials(
					username: testData.user.username, password: testData.userPwd
				))

			let response = try await apiTester.sendRequest(
				.GET, meEndpoint, headers: headers)
			#expect(response.status == .ok)
		}
	}

	@Test("Me endpoint with invalid session")
	func testMeEndpointWithInvalidSession() async throws {
		try await withApp { app in
			let apiTester = try app.testing()
			let response = try await apiTester.sendRequest(.GET, meEndpoint)
			#expect(response.status == .ok)

			let notIdentified = try response.content.decode(
				Components.Schemas.NotIdentified.self)
			#expect(notIdentified.user == .anonymous)
		}
	}

	@Test("Update me")
	func testUpdateMe() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			try await testData.user.$groups.attach(testData.group2, on: app.db)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			var newUserInfo = Components.Schemas.UpdateMyProfile(
				username: testData.user.username,
				email: "test@tests-change.com",
				firstName: "First name 2",
				lastName: "Last Name 2",
				defaultGroupId: testData.group2.id!.uuidString
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/session/me", body: newUserInfo,
				headers: headers)

			#expect(response.status == .ok)

			let user = try response.content.decode(Components.Schemas.UserProfile.self)
			#expect(user.email == "test@tests-change.com")
			#expect(user.firstName == "First name 2")
			#expect(user.lastName == "Last Name 2")
			#expect(user.isActive == true)
			#expect(user.isAdmin == false)
			#expect(user.defaultGroupId == testData.group2.id!.uuidString)

			var userFromDb = try await User.query(on: app.db).filter(
				\.$id == testData.user.id!
			)
			.first()
			#expect(userFromDb!.verifyPassword(pwd: testData.userPwd))

			newUserInfo.password = testData.userPwd
			newUserInfo.newPassword = "new-password"

			let response2 = try await apiTester.sendRequest(
				.PUT, "/api/session/me", body: newUserInfo,
				headers: headers)

			#expect(response2.status == .ok)

			userFromDb = try await User.query(on: app.db).filter(
				\.$id == testData.user.id!
			).first()
			#expect(userFromDb!.verifyPassword(pwd: "new-password"))
			#expect(!userFromDb!.verifyPassword(pwd: testData.userPwd))
		}
	}

	@Test("Update me with invalid UUID")
	func testUpdateMeInvalidUUID() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let newUserInfo = Components.Schemas.UpdateMyProfile(
				username: testData.user.username,
				email: "test@tests-change.com",
				firstName: "First name 2",
				lastName: "Last Name 2",
				defaultGroupId: "1111111"
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/session/me", body: newUserInfo,
				headers: headers)

			#expect(response.status == .badRequest)

			let error = try response.content.decode(Components.Schemas._Error.self)
			#expect(error.code == "API10017")
		}
	}

	@Test("Logout endpoint")
	func testLogoutEndpoint() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let login = Components.Schemas.UserCredentials(
				username: testData.user.username, password: testData.userPwd)
			let loginResponse = try await apiTester.sendRequest(
				.POST, loginEndpoint, body: login)
			let headers = loginResponse.headers

			let response = try await apiTester.sendRequest(
				.DELETE, logoutEndpoint, headers: headers)
			#expect(response.status == .ok)
		}
	}
}
