import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("User group api Tests")
final class UserGroupApiTests {
	@Test("Create a group as user")
	func testCreateGroup() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let newGroup = Components.Schemas.UserGroupInput(name: "New Group")

			let apiTester = try app.testing()

			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username,
					password: testData.userPwd))

			let response = try await apiTester.sendRequest(
				.POST, "/api/groups", body: newGroup, headers: headers)
			#expect(response.status == .created)

			let data = try response.content.decode(Components.Schemas.UserGroup.self)
			#expect(data.name == newGroup.name)

			try await testData.user.$groups.load(on: app.db)
			#expect(testData.user.groups.first { $0.id?.uuidString == data.id } != nil)
		}
	}

	@Test("Create a group as admin")
	func testCreateGroupAsAdmin() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let newGroup = Components.Schemas.UserGroupInput(name: "New Group")

			let apiTester = try app.testing()

			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let response = try await apiTester.sendRequest(
				.POST, "/api/groups", body: newGroup, headers: headers)
			#expect(response.status == .created)

			let data = try response.content.decode(Components.Schemas.UserGroup.self)
			#expect(data.name == newGroup.name)

			try await testData.admin.$groups.load(on: app.db)
			#expect(testData.admin.groups.first { $0.id?.uuidString == data.id } == nil)
		}
	}

	@Test("List groups as a user")
	func testListGroups() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()

			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username,
					password: testData.userPwd))

			let response = try await apiTester.sendRequest(
				.GET, "/api/groups?orphaned=true", headers: headers)
			#expect(response.status == .ok)

			let data = try response.content.decode(
				Operations.ApiGroup_list.Output.Ok.Body.jsonPayload.self
			)
			let resultIds = data.results.map { $0.id }
			#expect(resultIds.count == 2)
			#expect(!resultIds.contains(testData.group2.id?.uuidString ?? ""))
			#expect(resultIds.contains(testData.group3.id?.uuidString ?? ""))
		}
	}

	@Test("List groups as an admin")
	func testListGroupsAsAdmin() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let orphaneGroup = try await createGroup(app: app, name: "Orphane group")

			let apiTester = try app.testing()

			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let response = try await apiTester.sendRequest(
				.GET, "/api/groups", headers: headers)
			#expect(response.status == .ok)

			let data = try response.content.decode(
				Operations.ApiGroup_list.Output.Ok.Body.jsonPayload.self
			)
			let resultIds = data.results.map { $0.id }
			#expect(resultIds.count == 4)
			#expect(resultIds.contains(testData.group2.id?.uuidString ?? ""))
			#expect(resultIds.contains(testData.group3.id?.uuidString ?? ""))
			#expect(resultIds.contains(orphaneGroup.id?.uuidString ?? ""))
		}
	}

	@Test("List orphaned groups as an admin")
	func testListOrphanedGroups() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let orphaneGroup = try await createGroup(app: app, name: "Orphane group")

			let apiTester = try app.testing()

			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.admin.username,
					password: testData.adminPwd))

			let response = try await apiTester.sendRequest(
				.GET, "/api/groups?orphaned=true", headers: headers)
			#expect(response.status == .ok)

			let data = try response.content.decode(
				Operations.ApiGroup_list.Output.Ok.Body.jsonPayload.self
			)
			let resultIds = data.results.map { $0.id }
			#expect(resultIds.count == 1)
			#expect(!resultIds.contains(testData.group3.id?.uuidString ?? ""))
			#expect(!resultIds.contains(testData.group.id?.uuidString ?? ""))
			#expect(!resultIds.contains(testData.group2.id?.uuidString ?? ""))
			#expect(resultIds.contains(orphaneGroup.id?.uuidString ?? ""))
		}
	}
}
