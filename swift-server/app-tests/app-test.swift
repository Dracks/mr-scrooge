import GraphQL
import OrderedCollections
import Vapor
import XCTVapor
import XCTest

@testable import App

class TestError: Error {
    let message: String?
    init(message: String? = nil) {
        self.message = message
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

extension Application {

	func queryGql(
		_ query: GraphQLRequest,
		headers immutableHeaders: HTTPHeaders = [:],
		file: StaticString = #file,
		line: UInt = #line,
		beforeRequest: (inout XCTHTTPRequest) async throws -> Void = { _ in }
	) async throws -> XCTHTTPResponse {
		var headers = immutableHeaders
		headers.add(name: "content-type", value: "application/json")
		return try await self.sendRequest(
			.POST, "/graphql", headers: headers,
			body: ByteBuffer(data: try JSONEncoder().encode(query)),
			file: file, line: line,
			beforeRequest: beforeRequest
		)
	}

	func getHeaders(forUser credentials: SessionTypes.Credentials) async throws -> HTTPHeaders {
		var headers: HTTPHeaders = [:]
		let cookie = try await loginWithUser(
			user: credentials.username, password: credentials.password)
		headers.add(name: "cookie", value: cookie)
		return headers
	}

	func loginWithUser(user: String, password: String) async throws -> String {
		let mutation = """
			mutation($username: String!, $password: String!) {
			  login(credentials: { username: $username, password: $password }) {
			    __typename
			    ... on MyProfile {
			      username
			    }
			  }
			}
			"""
		let res = try await self.queryGql(
			GraphQLRequest(
				query: mutation,
				variables: toVars(["username": user, "password": password])))
		XCTAssertEqual(res.headers.contains(name: "set-cookie"), true)
		let cookiesList: [String] = res.headers["set-cookie"]
		let cookie: String = cookiesList[0]
		XCTAssertContains(cookie, "vapor-session=")

		return cookie
	}
}

extension Dictionary {
	func toOrdered() -> OrderedDictionary<Key, Value> {
		OrderedDictionary(
			Array(self),
			uniquingKeysWith: { v1, v2 in
				v1
			})
	}
}

extension OrderedDictionary {
	func toNormal(recursive: Bool = false) -> [Key: Value] {
		let ret = Dictionary(Array(self), uniquingKeysWith: { v1, v2 in v1 })
		if recursive {
			return ret.mapValues { value in
				if let dic = value as? OrderedDictionary {
					return dic.toNormal(recursive: true) as! Value
				}
				return value
			}
		}
		return ret
	}
}

func toVars(_ vars: [String: Codable]) -> [String: Map] {
	var result: [String: Map] = [:]

	for (key, value) in vars {
		if let stringValue = value as? String {
			result[key] = .string(stringValue)
		} else if let intValue = value as? Int {
			result[key] = .int(intValue)
		} else if let doubleValue = value as? Double {
			result[key] = .double(doubleValue)
		} else if let boolValue = value as? Bool {
			result[key] = .bool(boolValue)
		} else if let arrayValue = value as? [Codable] {
			result[key] = .array(arrayValue.compactMap { toMap($0) })
		} else if let dictionaryValue = value as? [String: Codable] {
			result[key] = .dictionary(toVars(dictionaryValue).toOrdered())
		} else {
			// For other types, convert to string representation
			result[key] = .string(String(describing: value))
		}
	}

	return result
}

func toMap(_ value: Codable) -> Map? {
	if let stringValue = value as? String {
		return .string(stringValue)
	} else if let intValue = value as? Int {
		return .int(intValue)
	} else if let doubleValue = value as? Double {
		return .double(doubleValue)
	} else if let boolValue = value as? Bool {
		return .bool(boolValue)
	} else if let arrayValue = value as? [Codable] {
		return .array(arrayValue.compactMap { toMap($0) })
	} else if let dictionaryValue = value as? [String: Codable] {
		let dictionary = toVars(dictionaryValue)
		return .dictionary(dictionary.toOrdered())
	} else {
		return .string(String(describing: value))
	}
}
