import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Label Tests")
final class LabelTests: BaseWithFactories {

	@Test("Get labels")
	func testGetLabels() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let _ = try await createTestLabels(app: app, testData: testData)
			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.GET, "/api/labels", headers: headers)

			#expect(response.status == .ok)

			let data = try response.content.decode(
				Operations.ApiLabels_list.Output.Ok.Body.jsonPayload.self)

			let labelData = data.results
			#expect(labelData.count == 10)  // Only labels from testGroup should be returned

			let labelNames = Set(labelData.map { $0.name })
			#expect(labelNames.count == 10)  // All labels should have unique names

			// Check that all returned labels belong to the test group
			let groupId = try testData.group.requireID()
			for label in labelData {
				#expect(label.groupOwnerId == groupId.uuidString)
			}
		}
	}

	@Test("Create label")
	func testCreateLabel() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let newLabel = Components.Schemas.CreateLabel(
				name: "Some Label Name",
				groupOwnerId: try testData.group.requireID().uuidString
			)

			let response = try await apiTester.sendRequest(
				.POST, "/api/labels",
				body: newLabel,
				headers: headers
			)

			#expect(response.status == .created)

			let data = try response.content.decode(Components.Schemas.Label.self)

			#expect(data.name == "Some Label Name")
		}
	}

	@Test("Update label")
	func testUpdateLabel() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let newLabel = Components.Schemas.UpdateLabel(
				name: "Some New Name"
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/labels/\(labels[3].requireID().uuidString)",
				body: newLabel,
				headers: headers
			)

			#expect(response.status == .ok)

			let data = try response.content.decode(Components.Schemas.Label.self)

			#expect(data.name == "Some New Name")
		}
	}

	@Test("Delete label")
	func testDeleteLabel() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.DELETE, "/api/labels/\(labels[3].requireID().uuidString)",
				headers: headers
			)

			#expect(response.status == .ok)

			let labelsCount = try await Label.query(on: app.db).count()
			#expect(labelsCount == 17)

			// Verify the specific label was deleted
			let deletedLabel = try await Label.query(on: app.db)
				.filter(\.$id == labels[3].requireID())
				.first()
			#expect(deletedLabel == nil, "Label should have been deleted")
		}
	}

	@Test("Fail to delete linked label")
	func testFailToDeleteLinkedLabel() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)

			let groupOwnerId = try testData.group.requireID()

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
				ruleId: ruleLabelAction.$id.$rule.id,
				labelId: ruleLabelAction.$id.$label.id,
				transactionId: labelTransaction.$id.$transaction.id
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

			try await GraphHorizontalGroup(graphId: graphId, group: .labels).save(
				on: app.db)
			try await GraphHorizontalGroupLabels(
				graphId: graphId, labelId: targetLabelId, order: 0
			).save(on: app.db)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			// Try to delete the label
			let response = try await apiTester.sendRequest(
				.DELETE, "/api/labels/\(targetLabelId.uuidString)",
				headers: headers
			)

			// Assert the response indicates conflict
			#expect(response.status == .conflict)

			let data = try? response.content.decode(Components.Schemas.LabelInUse.self)

			#expect(data != nil)
			if let data {
				let transactionId = try transaction.requireID()
				#expect(
					data.transactions == [transactionId.uuidString])
				#expect(data.graphs == [graphId.uuidString])
				#expect(data.graphsGroup == [graphId.uuidString])
				#expect(data.graphHorizontalGroup == [graphId.uuidString])
				let ruleId = try rule.requireID()
				#expect(data.rules == [ruleId.uuidString])
			}

			// Verify label still exists
			var labelsCount = try await Label.query(on: app.db).count()
			#expect(labelsCount == 18)

			// Try to delete the label
			let response2 = try await apiTester.sendRequest(
				.DELETE, "/api/labels/\(targetLabelId.uuidString)?force=true",
				headers: headers
			)

			// Assert the response indicates conflict
			#expect(response2.status == .ok)

			labelsCount = try await Label.query(on: app.db).count()
			#expect(labelsCount == 17)

			// check nothing was deleted by error
			let graphReloaded = try await Graph.find(graphId, on: app.db)
			#expect(
				graphReloaded != nil,
				"Graph should still exist after force deleting label")

			let ruleReloaded = try await Rule.find(rule.requireID(), on: app.db)
			#expect(
				ruleReloaded != nil,
				"Rule should still exist after force deleting label")

			let transactionReloaded = try await BankTransaction.find(
				transaction.requireID(), on: app.db)
			#expect(
				transactionReloaded != nil,
				"Transaction should still exist after force deleting label")
		}
	}
}
