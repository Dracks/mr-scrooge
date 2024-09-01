import GraphQLKit
import Graphiti
import OrderedCollections
import Vapor
import XCTest

@testable import App

final class SessionTests: AbstractBaseTestsClass {
	let query = """
		query {
		  me {
		    __typename
		    ... on MyProfile {
		      username
		      isAdmin
		    }
		  }
		}
		"""

	let loginMutation = """
		mutation($username: String!, $password: String!) {
		  login(credentials: { username: $username, password: $password }) {
		    __typename
		    ... on MyProfile {
		      username
		    }
		  }
		}
		"""
	override func setUp() async throws {
		try await super.setUp()
	}

	override func tearDown() async throws {
		try await super.tearDown()
	}

	func testMyProfileQueryWithUnauthenticatedRequest() async throws {
		let app = try getApp()

		// Test unauthenticated request
		let res = try await app.queryGql(GraphQLRequest(query: query))
		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(GraphQLResult.self)
		XCTAssertEqual(data.errors, [])
		XCTAssertEqual(data.data?["me"]["__typename"], "NotIdentified")
	}

	func testMyProfileQueryWithAuthenticatedRequest() async throws {
		let app = try getApp()

		// Test authenticated request
		let identifiedHeaders = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: "test-user", password: "test-password"))
		let res = try await app.queryGql(
			GraphQLRequest(query: query), headers: identifiedHeaders)
		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(GraphQLResult.self)
		XCTAssertEqual(data.data?["me"]["__typename"], "MyProfile")
		XCTAssertEqual(data.data?["me"]["username"].string, testUser.username)
		XCTAssertEqual(data.data?["me"]["isAdmin"].bool, testUser.isAdmin)
	}

	func testValidLoginMutation() async throws {
		let app = try getApp()

		let res = try await app.queryGql(
			GraphQLRequest(
				query: loginMutation,
				variables: toVars([
					"username": testUser.username, "password": "test-password",
				])))
		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(GraphQLResult.self)
		XCTAssertEqual(data.errors, [])
		XCTAssertEqual(data.data?["login"]["__typename"], "MyProfile")
		XCTAssertEqual(data.data?["login"]["username"].string, testUser.username)
	}

	func testInvalidLoginMutation() async throws {
		let app = try getApp()

		let res = try await app.queryGql(
			GraphQLRequest(
				query: loginMutation,
				variables: toVars([
					"username": testUser.username, "password": "wrong-password",
				])))
		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(GraphQLResult.self)
		XCTAssertEqual(data.data?["login"]["__typename"], "LoginError")
	}
}
