import Fluent
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

		// Verify the specific label was deleted
		let deletedLabel = try await Label.query(on: app.db)
			.filter(\.$id == labels[3].requireID())
			.first()
		XCTAssertNil(deletedLabel, "Label should have been deleted")
	}

	func testFailToDeleteLinkedLabel() async throws {
		let app = try getApp()

		let groupOwnerId = try testGroup.requireID()

		let targetLabel = labels[0]
		let targetLabelId = try targetLabel.requireID()

		// Create bank transaction with label
		let transaction = BankTransaction(
			groupOwnerId: groupOwnerId, movementName: "Test",
			date: .init(Date()), value: 123.2, kind: "test")
		try await transaction.save(on: app.db)
		let labelTransaction = try LabelTransaction(
			labelId: targetLabelId, transactionId: transaction.requireID(),
			linkReason: .automatic)
		try await labelTransaction.save(on: app.db)

		// Create rule with label
		let rule = Rule(
			groupOwnerId: groupOwnerId,
			name: "Some rule"
		)
		try await rule.save(on: app.db)

		let ruleLabelAction = RuleLabelAction(
			ruleId: try rule.requireID(), labelId: targetLabelId)
		try await ruleLabelAction.save(on: app.db)
		try await RuleLabelPivot(
			ruleLabelId: ruleLabelAction.requireID(),
			labelTransactionId: labelTransaction.requireID()
		).save(on: app.db)

		// Create graph with label
		let graph = Graph(
			groupOwnerId: groupOwnerId,
			name: "Test graph",
			kind: .line,
			labelFilterId: targetLabelId,
			dateRange: .all,
			order: 0
		)
		try await graph.save(on: app.db)
		let graphId = try graph.requireID()

		try await GraphGroup(graphId: graphId, group: .labels).save(on: app.db)
		try await GraphGroupLabels(
			graphId: graphId, labelId: targetLabelId, order: 0
		).save(on: app.db)

		try await GraphHorizontalGroup(graphId: graphId, group: .labels).save(on: app.db)
		try await GraphHorizontalGroupLabels(
			graphId: graphId, labelId: targetLabelId, order: 0
		).save(on: app.db)

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		// Try to delete the label
		let response = try await app.sendRequest(
			.DELETE, "/api/labels/\(targetLabelId.uuidString)",
			headers: headers
		)

		// Assert the response indicates conflict
		XCTAssertEqual(response.status, .conflict)

		let data = try? response.content.decode(Components.Schemas.LabelInUse.self)

		XCTAssertNotNil(data)
		if let data {
			try XCTAssertEqual(data.transactions, [transaction.requireID().uuidString])
			XCTAssertEqual(data.graphs, [graphId.uuidString])
			XCTAssertEqual(data.graphsGroup, [graphId.uuidString])
			XCTAssertEqual(data.graphHorizontalGroup, [graphId.uuidString])

			try XCTAssertEqual(data.rules, [rule.requireID().uuidString])
		}

		// Verify label still exists
		var labelsCount = try await Label.query(on: app.db).count()
		XCTAssertEqual(labelsCount, 18)

		// Try to delete the label
		let response2 = try await app.sendRequest(
			.DELETE, "/api/labels/\(targetLabelId.uuidString)?force=true",
			headers: headers
		)

		// Assert the response indicates conflict
		XCTAssertEqual(response2.status, .ok)

		labelsCount = try await Label.query(on: app.db).count()
		XCTAssertEqual(labelsCount, 17)

		// check nothing was deleted by error
		let graphReloaded = try await Graph.find(graphId, on: app.db)
		XCTAssertNotNil(
			graphReloaded, "Graph should still exist after force deleting label")

		let ruleReloaded = try await Rule.find(rule.requireID(), on: app.db)
		XCTAssertNotNil(ruleReloaded, "Rule should still exist after force deleting label")

		let transactionReloaded = try await BankTransaction.find(
			transaction.requireID(), on: app.db)
		XCTAssertNotNil(
			transactionReloaded,
			"Transaction should still exist after force deleting label")

	}
}
