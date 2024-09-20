import Vapor
import XCTVapor
import XCTest

@testable import MrScroogeServer

class TestError: Error {
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
	var testGroup: UserGroup!
	var testGroup2: UserGroup!
	var labels: [Label]!

	var testIds: [String: UUID]!

	func getApp() throws -> Application {
		guard let app = app else {
			throw TestError()
		}
		return app
	}

	override func setUp() async throws {
		do {
			testIds = [:]
			let app = try await Application.make(.testing)
			try await configure(app)
			// Create a test group
			testGroup2 = try await createGroup(app: app, name: "Other Group")
			testGroup = try await createGroup(app: app, name: "Test Group")
			let testGroupId = try testGroup.requireID()
			let testGroupId2 = try testGroup2.requireID()

			// Create users
			/*_ = try await createUser(app: app, username: "admin", email: "j@k.com", password: "admin", isAdmin: true)
             _ = try await createUser(app: app, username: "demo", email: "d@k.com", password: "demo")*/
			testUser = try await createUser(
				app: app, username: "test-user", email: "test@example.com",
				password: "test-password", defaultGroupId: testGroupId)
			try await testUser.$groups.attach(testGroup, on: app.db)

			// Create labels
			let labelFactory = LabelFactory()

			labels = labelFactory.createSequence(10) {
				$0.$groupOwner.id = testGroupId
				return $0
			}
			LabelFactory().createSequence(8) {
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
			print(error)
			throw error
		}
	}

	override func tearDown() async throws {
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
}

extension Application {

	func sendRequest(
		_ method: HTTPMethod,
		_ path: String,
		body: any Codable,
		headers immutableHeaders: HTTPHeaders = [:],
		file: StaticString = #file,
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