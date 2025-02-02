import XCTVapor
import XCTest

@testable import MrScroogeServer

final class LabelResolverTests: AbstractBaseTestsClass {

	func testGetLabels() async throws {
		let app = try getApp()

		// Get headers for authenticated request
		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(.GET, "/api/labels", headers: headers)

		// Assert the response
		XCTAssertEqual(response.status, .ok)

		let data = try response.content.decode(
			Operations.ApiLabels_list.Output.Ok.Body.jsonPayload.self)

		let labels = data.results
		XCTAssertEqual(labels.count, 10)  // Only labels from testGroup should be returned

		let labelNames = Set(labels.map { $0.name })
		XCTAssertEqual(labelNames.count, 10)  // All labels should have unique names

		// Check that all returned labels belong to the test group
		let groupId = try testGroup.requireID()
		for label in labels {
			XCTAssertEqual(label.groupOwnerId, groupId.uuidString)
		}

	}

	func testCreateLabel() async throws {

		let app = try getApp()

		// Get headers for authenticated request
		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let newLabel = Components.Schemas.CreateLabel(
			name: "Some Label Name",
			groupOwnerId: try testGroup.requireID().uuidString
		)

		let response = try await app.sendRequest(
			.POST, "/api/labels",
			body: newLabel,
			headers: headers
		)

		// Assert the response
		XCTAssertEqual(response.status, .created)

		let data = try response.content.decode(Components.Schemas.Label.self)

		XCTAssertEqual(data.name, "Some Label Name")
	}

	func testUpdateLabel() async throws {

		let app = try getApp()

		// Get headers for authenticated request
		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let newLabel = Components.Schemas.UpdateLabel(
			name: "Some New Name"
		)

		let response = try await app.sendRequest(
			.PUT, "/api/labels/\(labels[3].requireID().uuidString)",
			body: newLabel,
			headers: headers
		)

		// Assert the response
		XCTAssertEqual(response.status, .ok)

		let data = try response.content.decode(Components.Schemas.Label.self)

		XCTAssertEqual(data.name, "Some New Name")
	}

	func testDeleteLabel() async throws {
		let app = try getApp()
		// Get headers for authenticated request
		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.DELETE, "/api/labels/\(labels[3].requireID().uuidString)",
			headers: headers
		)

		// Assert the response
		XCTAssertEqual(response.status, .ok)

		let labelsCount = try await Label.query(on: app.db).count()
		XCTAssertEqual(labelsCount, 17)

	}
}
