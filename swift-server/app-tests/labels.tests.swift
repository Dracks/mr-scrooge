import GraphQL
import Graphiti
import XCTVapor
import XCTest

@testable import App

final class LabelResolverTests: AbstractBaseTestsClass {
	func testGetLabels() async throws {
		let app = try getApp()

		// Get headers for authenticated request
		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		// Execute the query
		let query = """
			query {
			  labels {
			    ... on GetLabels {
			        results {
			        id
			        name
			        groupOwnerId
			      }
			    }
			  }
			}
			"""

		let response = try await app.queryGql(
			GraphQLRequest(query: query), headers: headers)

		// Assert the response
		XCTAssertEqual(response.status, .ok)

		let body = try XCTUnwrap(response.body)
		let data = try JSONDecoder().decode(GraphQLResult.self, from: Data(buffer: body))

		XCTAssertEqual(data.errors, [])

		print(data)
		let labels = try XCTUnwrap(data.data?["labels"]["results"].array)
		XCTAssertEqual(labels.count, 10)  // Only labels from testGroup should be returned

		let labelNames = Set(labels.map { $0["name"].string })
		XCTAssertEqual(labelNames.count, 10)  // All labels should have unique names

		// Check that all returned labels belong to the test group
		let groupId = try testGroup.requireID()
		for label in labels {
			XCTAssertEqual(label["groupOwnerId"].string, groupId.uuidString)
		}
	}
}
