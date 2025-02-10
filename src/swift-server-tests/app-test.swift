import Fluent
import Vapor
import XCTQueues
import XCTVapor
import XCTest

@testable import MrScroogeServer

final class TestError: Error {
	let message: String?
	let context: [String: String]?
	init(message: String? = nil, context: [String: String]? = nil) {
		self.message = message
		self.context = context
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

class AbstractBaseTestsClass: XCTestCase {
	var app: Application?

	var testUser: User!
	var testAdmin: User!
	var testGroup: UserGroup!
	var testGroup2: UserGroup!
	var testGroup3: UserGroup!
	var labels: [Label]!

	var testIds: [String: UUID]!

	let ruleFactory = RuleFactory()
	let conditionFactory = RuleConditionFactory()
	let transactionFactory = BankTransactionFactory()
	let labelFactory = LabelFactory()

	func getApp() throws -> Application {
		guard let app = app else {
			throw TestError()
		}
		return app
	}

	override func setUp() async throws {
		try await super.setUp()
		do {
			testIds = [:]
			let app = try await Application.make(.testing)
			try await configure(app)

			try await app.autoMigrate()

			// Override the driver being used for testing
			app.queues.use(.asyncTest)
			//app.queues.add(NewTransactionJob())

			// Create a test group
			testGroup2 = try await createGroup(app: app, name: "Other Group")
			testGroup = try await createGroup(app: app, name: "Test Group")
			testGroup3 = try await createGroup(app: app, name: "Other group for main")
			let testGroupId = try testGroup.requireID()
			let testGroupId2 = try testGroup2.requireID()

			// Create users
			testUser = try await createUser(
				app: app, username: "test-user", email: "test@example.com",
				password: "test-password", defaultGroupId: testGroupId)
			try await testUser.$groups.attach(testGroup, on: app.db)
			try await testUser.$groups.attach(testGroup3, on: app.db)

			testAdmin = try await createUser(
				app: app, username: "admin", email: "admin@example.com",
				password: "test-admin-password", defaultGroupId: testGroupId,
				isAdmin: true)
			try await testAdmin.$groups.attach(testGroup, on: app.db)

			// Create labels
			labels = labelFactory.createSequence(10) {
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

			self.app = app
		} catch {
			print("App Test {}", String(reflecting: error))
			throw error
		}
	}

	override func tearDown() async throws {
		try await super.tearDown()
		try await self.app?.asyncShutdown()
		self.app = nil
	}

}

final class MrScroogeServerTest: AbstractBaseTestsClass {
	func testInvalidData() async throws {
		let app = try getApp()
		let res = try await app.sendRequest(.POST, "/api/session", body: "")
		XCTAssertEqual(res.status, .badRequest)
	}

	func testCreateUserCommand() async throws {
		let app = try getApp()

		let command = CreateUserCommand()
		let arguments = ["create_user"]

		let console = TestConsole()
		let input = CommandInput(arguments: arguments)
		var context = CommandContext(
			console: console,
			input: input
		)
		context.application = app

		try await console.run(command, with: context)

		let output = console
			.testOutputQueue
			.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }

		XCTAssertContains(output[0], "User \"demo\" created with groupId: ")
		let users = try await User.query(on: app.db).filter(\.$username == "demo").all()

		XCTAssertEqual(users.count, 1)
		let user = users.first!
		let groups = try await user.$groups.get(on: app.db)
		XCTAssertEqual(groups.count, 1)
		XCTAssertEqual(user.isAdmin, false)
	}
}

extension Application {

	func sendRequest(
		_ method: HTTPMethod,
		_ path: String,
		body: any Codable,
		headers immutableHeaders: HTTPHeaders = [:],
		file: StaticString = #filePath,
		line: UInt = #line,
		beforeRequest: (inout XCTHTTPRequest) async throws -> Void = { _ in }
	) async throws -> XCTHTTPResponse {
		var headers = immutableHeaders
		headers.add(name: "content-type", value: "application/json")
		return try await self.sendRequest(
			method, path, headers: headers,
			body: ByteBuffer(data: try JSONEncoder().encode(body)),
			file: file, line: line,
			beforeRequest: beforeRequest
		)
	}

	func getHeaders(forUser credentials: Components.Schemas.UserCredentials) async throws
		-> HTTPHeaders
	{
		var headers: HTTPHeaders = [:]
		let cookie = try await loginWithUser(credentials: credentials)
		headers.add(name: "cookie", value: cookie)
		return headers
	}

	func loginWithUser(user: String, password: String) async throws -> String {
		return try await loginWithUser(
			credentials: Components.Schemas.UserCredentials(
				username: user, password: password))
	}

	func loginWithUser(credentials: Components.Schemas.UserCredentials) async throws -> String {
		let res = try await self.sendRequest(.POST, "/api/session", body: credentials)
		XCTAssertEqual(res.headers.contains(name: "set-cookie"), true)
		let cookiesList: [String] = res.headers["set-cookie"]
		let cookie: String = cookiesList[0]
		XCTAssertContains(cookie, "vapor-session=")

		return cookie
	}
}
