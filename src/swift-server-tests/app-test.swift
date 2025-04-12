import Fluent
import Testing
import Vapor
import XCTQueues

@testable import MrScroogeServer

final class TestError: Error {
	let message: String?
	let context: [String: String]?
	let file: String
	let line: UInt
	let function: String
	init(
		message: String? = nil, context: [String: String]? = nil,
		file: String = #file,
		line: UInt = #line,
		function: String = #function
	) {
		self.message = message
		self.context = context
		self.file = file
		self.line = line
		self.function = function
	}
}

func createUser(
	app: Application, username: String, email: String, password: String,
	defaultGroupId: UserGroup.IDValue, isAdmin: Bool = false
) async throws -> User {
	let user = User(
		username: username, email: email, isAdmin: isAdmin, defaultGroupId: defaultGroupId)
	try user.setPassword(pwd: password)
	try await user.save(on: app.db)
	return user
}

func createGroup(app: Application, name: String) async throws -> UserGroup {
	let group = UserGroup(name: name)
	try await group.save(on: app.db)
	return group
}

func withApp(_ test: (Application) async throws -> Void) async throws {
	let app = try await Application.make(.testing)
	do {
		try await configure(app)

		app.queues.use(.asyncTest)

		try await test(app)
	} catch {
		try await app.asyncShutdown()
		throw error
	}
	try await app.asyncShutdown()
}

struct GroupsAndUsers {
	var user: User
	var userPwd: String
	var admin: User
	var adminPwd: String
	var group: UserGroup
	var group2: UserGroup
	var group3: UserGroup
}

func createGroupsAndUsers(app: Application) async throws -> GroupsAndUsers {
	// Create a test group
	let testGroup2 = try await createGroup(app: app, name: "Other Group")
	let testGroup = try await createGroup(app: app, name: "Test Group")
	let testGroup3 = try await createGroup(app: app, name: "Other group for main")
	let testGroupId = try testGroup.requireID()

	// Create users
	let testUser = try await createUser(
		app: app, username: "test-user", email: "test@example.com",
		password: "test-password", defaultGroupId: testGroupId)
	try await testUser.$groups.attach(testGroup, on: app.db)
	try await testUser.$groups.attach(testGroup3, on: app.db)

	let testAdmin = try await createUser(
		app: app, username: "admin", email: "admin@example.com",
		password: "test-admin-password", defaultGroupId: testGroupId,
		isAdmin: true)
	try await testAdmin.$groups.attach(testGroup, on: app.db)
	try await testAdmin.$groups.attach(testGroup2, on: app.db)

	return .init(
		user: testUser, userPwd: "test-password", admin: testAdmin,
		adminPwd: "test-admin-password", group: testGroup, group2: testGroup2,
		group3: testGroup3)
}

func createTestLabels(app: Application, testData: GroupsAndUsers) async throws -> [Label] {
	let labelFactory = LabelFactory()
	let testGroupId = try testData.group.requireID()
	let testGroupId2 = try testData.group2.requireID()
	var labels = labelFactory.createSequence(10) {
		$0.$groupOwner.id = testGroupId
		return $0
	}
	labelFactory.createSequence(8) {
		$0.$groupOwner.id = testGroupId2
		return $0
	}.forEach { label in
		labels.append(label)
	}
	for label in labels {
		try await label.save(on: app.db)
	}
	return labels
}

@Suite("MrScrooge Generic tests")
final class MrScroogeServerTest {
	@Test("Process invalid data correctly")
	func testInvalidData() async throws {
		try await withApp { app in
			let res = try await app.testing().sendRequest(
				.POST, "/api/session", body: "")
			#expect(res.status == .badRequest)
		}

	}
}
