import Fluent
import QueuesFluentDriver
import XCTQueues
import XCTVapor
import XCTest

@testable import MrScroogeServer

/*
* Todo: Add some tests for when two rules apply the same label
*/
final class RulesTests: AbstractBaseTestsClass {
	var operationToLabel: [ConditionOperation: UUID] = [:]

	var bankTransactionService: BankTransactionService!

	override func setUp() {
		super.setUp()
		bankTransactionService = app!.bankTransactionService
	}

	private func createBasicRuleAndRegister(
		on db: Database, for userGroup: UserGroup, with condition: Rule.BaseCondition,
		toApply label: Label
	) async throws -> Rule {
		let rule = try await Rule.createRule(
			on: db, for: try userGroup.requireID(), with: condition, toApply: label)
		operationToLabel[condition.operation] = label.id!
		return rule
	}

	private func createBasicRules() async throws {
		let db = app!.db

		// String operations
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(.prefix, valueStr: "needle"),
			toApply: labels[0])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup,
			with: .init(.regularExpression, valueStr: "A{2}B{2}"),
			toApply: labels[1])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(.suffix, valueStr: "needle"),
			toApply: labels[2])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup,
			with: .init(.contains, valueStr: "needle"), toApply: labels[3])
		// Float operations
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(.greater, valueDouble: 1),
			toApply: labels[4])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup,
			with: .init(.greaterEqual, valueDouble: 1), toApply: labels[5])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(.less, valueDouble: -1),
			toApply: labels[6])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(.lessEqual, valueDouble: -1),
			toApply: labels[7])
	}

	private func checkContainsOperationLabel(
		_ labels: [UUID], for operation: ConditionOperation, context: String
	) throws {
		let label = operationToLabel[operation]
		guard let label else {
			app?.logger.error("Label for operation \(operation) not found!")
			throw TestError()
		}
		XCTAssertTrue(
			labels.contains(label), "For operation \(operation) with context \(context)"
		)
	}

	func testBaseLabelAssignation() async throws {
		let app = try getApp()
		try await createBasicRules()
		let testGroupId = try testGroup.requireID()
		let testGroupId2 = try testGroup2.requireID()

		let transactions = [
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "no-match"
				$0.value = 0
				return $0
			},

			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "needle is a prefix and contains"
				$0.value = 1
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId2
				$0.movementName = "needle is a prefix and contains"
				$0.value = 1
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "in the middle is the needle only contains"
				$0.value = 2
				return $0
			},

			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "suffix with the needle"
				$0.value = -2
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "AABBCCDD"
				$0.value = -2
				return $0
			},
		]

		for transaction in transactions {
			let _ = try await bankTransactionService.addTransaction(
				transaction: transaction)
		}

		try await app.queues.queue.worker.run()

		for transaction in transactions {
			try await transaction.$labels.load(on: app.db)
		}

		let labelsForTransactions = transactions.map {
			$0.labels.map { label in
				return label.id!
			}
		}

		XCTAssertEqual(labelsForTransactions[0].count, 0)
		XCTAssertEqual(labelsForTransactions[2].count, 0)

		XCTAssertEqual(labelsForTransactions[1].count, 3)
		try checkContainsOperationLabel(
			labelsForTransactions[1], for: .prefix,
			context: transactions[1].movementName)
		try checkContainsOperationLabel(
			labelsForTransactions[1], for: .contains,
			context: transactions[1].movementName)
		try checkContainsOperationLabel(
			labelsForTransactions[1], for: .greaterEqual,
			context: transactions[1].movementName)

		XCTAssertEqual(labelsForTransactions[3].count, 3)
		try checkContainsOperationLabel(
			labelsForTransactions[3], for: .greater,
			context: transactions[3].movementName)
		try checkContainsOperationLabel(
			labelsForTransactions[3], for: .contains,
			context: transactions[3].movementName)
		try checkContainsOperationLabel(
			labelsForTransactions[3], for: .greaterEqual,
			context: transactions[3].movementName)

		XCTAssertEqual(labelsForTransactions[4].count, 4)
		try checkContainsOperationLabel(
			labelsForTransactions[4], for: .contains,
			context: transactions[4].movementName)
		try checkContainsOperationLabel(
			labelsForTransactions[4], for: .suffix,
			context: transactions[4].movementName)
		try checkContainsOperationLabel(
			labelsForTransactions[4], for: .lessEqual,
			context: transactions[4].movementName)
		try checkContainsOperationLabel(
			labelsForTransactions[4], for: .less, context: transactions[4].movementName)
	}

	func testConditionsRelation() async throws {
		let app = try getApp()
		let testGroupId = try testGroup.requireID()

		let _ = try await Rule.createRule(
			on: app.db, for: try testGroup.requireID(),
			with: .init(.prefix, valueStr: "needle"),
			.init(.less, valueDouble: 0),
			toApply: labels[0])
		let rule = try await Rule.createRule(
			on: app.db, for: try testGroup.requireID(),
			with: .init(.prefix, valueStr: "needle"),
			.init(.less, valueDouble: 0),
			toApply: labels[1])
		rule.conditionsRelation = .notAnd
		try await rule.save(on: app.db)

		let transactions = [
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "needle"
				$0.value = -11
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "there is no match on the needle"
				$0.value = -11
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "needle"
				$0.value = 2
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "there is no match on the needle"
				$0.value = 2
				return $0
			},
		]

		for transaction in transactions {
			let _ = try await bankTransactionService.addTransaction(
				transaction: transaction)
		}

		try await app.queues.queue.worker.run()

		for transaction in transactions {
			try await transaction.$labels.load(on: app.db)
		}

		let labelsForTransactions = transactions.map {
			$0.labels.map { label in
				return label.id!
			}
		}

		XCTAssertEqual(labelsForTransactions[0].count, 1)
		XCTAssertEqual(labelsForTransactions[0].first, labels[0].id)
		XCTAssertEqual(labelsForTransactions[1].count, 1)
		XCTAssertEqual(labelsForTransactions[1].first, labels[0].id)
		XCTAssertEqual(labelsForTransactions[2].count, 1)
		XCTAssertEqual(labelsForTransactions[2].first, labels[0].id)

		XCTAssertEqual(labelsForTransactions[3].count, 1)
		XCTAssertEqual(labelsForTransactions[3].first, labels[1].id)
	}

	func testRuleParentChildrenRelation() async throws {
		let app = try getApp()
		let testGroupId = try testGroup.requireID()

		let rule1 = try await Rule.createRule(
			on: app.db, for: try testGroup.requireID(),
			with: .init(.prefix, valueStr: "needle"),
			toApply: labels[0])
		let rule2 = try await Rule.createRule(
			on: app.db, for: try testGroup.requireID(),
			with: .init(.less, valueDouble: 0),
			toApply: labels[1])
		rule2.$parent.id = try rule1.requireID()
		try await rule2.save(on: app.db)

		let transactions = [
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "needle"
				$0.value = -11
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "there is no match on the needle"
				$0.value = -11
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "needle"
				$0.value = 2
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "there is no match on the needle"
				$0.value = 2
				return $0
			},
		]

		for transaction in transactions {
			let _ = try await bankTransactionService.addTransaction(
				transaction: transaction)
		}

		try await app.queues.queue.worker.run()

		for transaction in transactions {
			try await transaction.$labels.load(on: app.db)
		}

		let labelsForTransactions = transactions.map {
			$0.labels.map { label in
				return label.id!
			}
		}

		XCTAssertEqual(labelsForTransactions[0].count, 2)
		XCTAssertEqual(labelsForTransactions[1].count, 0)
		XCTAssertEqual(labelsForTransactions[2].count, 1)
		XCTAssertEqual(labelsForTransactions[3].count, 0)
	}

	func testGetRules() async throws {
		let app = try getApp()

		try await createBasicRules()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password")
		)

		let response = try await app.sendRequest(.GET, "/api/rules", headers: headers)

		XCTAssertEqual(response.status, .ok)

		let data = try response.content.decode(
			Operations.ApiRule_list.Output.Ok.Body.jsonPayload.self)

		let cursorResults = data.results
		XCTAssertEqual(cursorResults.count, 8)
		XCTAssertEqual(cursorResults.first?.conditions.count, 1)
		XCTAssertEqual(cursorResults.first?.labelIds.count, 1)
	}

	func testCreateRule() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password")
		)

		let NewRule = Components.Schemas.RuleParam(
			groupOwnerId: testGroup.id!.uuidString,
			name: "Some rule",
			relations: .or
		)

		let response = try await app.sendRequest(
			.POST, "/api/rules", body: NewRule, headers: headers)

		XCTAssertEqual(response.status, .created)

		let rule = try? response.content.decode(Components.Schemas.Rule.self)

		XCTAssertNotNil(rule)
		XCTAssertEqual(rule?.name, "Some rule")
		XCTAssertEqual(rule?.relations, .or)
		XCTAssertEqual(rule?.conditions.count, 0)
		XCTAssertEqual(rule?.labelIds.count, 0)
	}

	func testUpdateRule() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password")
		)

		let ruleToChange = try await Rule.createRule(
			on: app.db, for: try testGroup3.requireID(), name: "Rule to change",
			with: .init(.less, valueDouble: 0), toApply: labels[0])
		let otherRuleId = try await Rule.createRule(
			on: app.db, for: try testGroup3.requireID(), name: "Rule to not change",
			with: .init(.less, valueDouble: 1), .init(.contains, valueStr: "something"),
			toApply: labels[1], labels[2], labels[3]
		).requireID()
		let ruleId = try ruleToChange.requireID()
		let groupOwnerId = try testGroup.requireID().uuidString

		let NewRule = Components.Schemas.RuleParam(
			groupOwnerId: groupOwnerId,
			name: "Change Rule",
			relations: .notAnd
		)

		let response = try await app.sendRequest(
			.PUT, "/api/rules/\(ruleId.uuidString)", body: NewRule, headers: headers)

		XCTAssertEqual(response.status, .ok)

		let rule = try? response.content.decode(Components.Schemas.Rule.self)

		XCTAssertNotNil(rule)
		XCTAssertEqual(rule?.name, "Change Rule")
		XCTAssertEqual(rule?.relations, .notAnd)
		XCTAssertEqual(rule?.conditions.count, 1)
		XCTAssertEqual(rule?.labelIds.count, 1)

		let otherRule = try await Rule.query(on: app.db).with(\.$conditions).with(\.$labels)
			.filter(\.$id == otherRuleId).first()

		XCTAssertNotNil(otherRule)
		XCTAssertEqual(otherRule?.name, "Rule to not change")
		XCTAssertEqual(otherRule?.conditionsRelation, .or)
		XCTAssertEqual(otherRule?.conditions.count, 2)
		XCTAssertEqual(otherRule?.labels.count, 3)
	}

	func testDeleteRule() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password")
		)
		let groupOwnerId = try testGroup.requireID()

		let ruleToChange = try await Rule.createRule(
			on: app.db, for: groupOwnerId, name: "Rule to delete",
			with: .init(.less, valueDouble: 0), toApply: labels[0])

		let otherRuleId = try await Rule.createRule(
			on: app.db, for: try testGroup3.requireID(), name: "Rule to not change",
			with: .init(.less, valueDouble: 1), .init(.contains, valueStr: "something"),
			toApply: labels[1], labels[2], labels[3]
		).requireID()
		let ruleId = try ruleToChange.requireID()

		let transaction = try await bankTransactionService.addTransaction(
			transaction: .init(
				groupOwnerId: groupOwnerId, movementName: "Test",
				date: DateOnly(year: 2020, month: 07, day: 20)!, value: -10,
				kind: "test"))

		try await app.queues.queue.worker.run()

		let response = try await app.sendRequest(
			.DELETE, "/api/rules/\(ruleId.uuidString)", headers: headers)

		XCTAssertEqual(response.status, .ok)

		let exist = try await Rule.query(on: app.db).filter(\.$id == ruleId).count() > 0
		XCTAssertFalse(exist)

		let otherRule = try await Rule.query(on: app.db).with(\.$conditions).with(\.$labels)
			.filter(\.$id == otherRuleId).first()

		XCTAssertNotNil(otherRule)
		XCTAssertEqual(otherRule?.name, "Rule to not change")
		XCTAssertEqual(otherRule?.conditionsRelation, .or)
		XCTAssertEqual(otherRule?.conditions.count, 2)
		XCTAssertEqual(otherRule?.labels.count, 3)

		let transactionId = try transaction.requireID()
		let labels = try await LabelTransaction.query(on: app.db).filter(
			\.$id.$transaction.$id == transactionId
		).all()
		XCTAssertEqual(labels.count, 1)
		let label = labels.first
		XCTAssertEqual(label?.linkReason, .manualEnabled)
	}

	func testAddRuleCondition() async throws {

		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password")
		)
		let groupOwnerId = try testGroup.requireID()

		let ruleToAddCond = try await Rule.createRule(
			on: app.db, for: groupOwnerId, name: "Rule to delete",
			toApply: labels[0])

		let otherRuleId = try await Rule.createRule(
			on: app.db, for: try testGroup3.requireID(), name: "Rule to not change",
			with: .init(.less, valueDouble: 1), .init(.contains, valueStr: "something"),
			toApply: labels[1], labels[2], labels[3]
		).requireID()
		let ruleId = try ruleToAddCond.requireID()

		let conditionInput = Components.Schemas.ConditionParams.ConditionParamString(
			.init(operation: .contains, value: "condition"))

		let response = try await app.sendRequest(
			.POST, "/api/rules/\(ruleId.uuidString)/condition",
			body: ["condition": conditionInput], headers: headers)

		XCTAssertEqual(response.status, .ok)
		let error = try? response.content.decode(Components.Schemas._Error.self)
		XCTAssertNil(error)

		let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

		XCTAssertEqual(ruleResponse.conditions.count, 1)
		let condition = ruleResponse.conditions.first
		switch condition {
		case .ConditionString(let condition):
			XCTAssertEqual(condition.operation, .contains)
			XCTAssertEqual(condition.value, "condition")
		case .ConditionDouble:
			XCTAssertTrue(false)
		case .none:
			XCTAssertTrue(false)
		}

		// Verify otherRule was not changed
		let otherRule = try await Rule.query(on: app.db).with(\.$conditions).with(\.$labels)
			.filter(\.$id == otherRuleId).first()

		XCTAssertNotNil(otherRule)
		XCTAssertEqual(otherRule?.name, "Rule to not change")
		XCTAssertEqual(otherRule?.conditions.count, 2)
		XCTAssertEqual(otherRule?.labels.count, 3)
	}

	func testUpdateRuleCondition() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password")
		)
		let groupOwnerId = try testGroup.requireID()

		let ruleToUpdateCond = try await Rule.createRule(
			on: app.db, for: groupOwnerId, name: "Rule to delete",
			with: .init(.contains, valueStr: "Something"),
			toApply: labels[0])

		try await ruleToUpdateCond.$conditions.load(on: app.db)

		let otherRule = try await Rule.createRule(
			on: app.db, for: try testGroup3.requireID(), name: "Rule to not change",
			with: .init(.less, valueDouble: 1), .init(.contains, valueStr: "something"),
			toApply: labels[1], labels[2], labels[3]
		)
		let otherRuleId = try otherRule.requireID()
		let ruleId = try ruleToUpdateCond.requireID()
		let conditionId = try ruleToUpdateCond.conditions.first!.requireID()

		let conditionInput = Components.Schemas.ConditionParams.ConditionParamDouble(
			.init(operation: .greaterEqual, value: 0))

		let response = try await app.sendRequest(
			.PUT, "/api/rules/\(ruleId.uuidString)/condition/\(conditionId.uuidString)",
			body: ["condition": conditionInput], headers: headers)

		XCTAssertEqual(response.status, .ok)
		let error = try? response.content.decode(Components.Schemas._Error.self)
		XCTAssertNil(error)

		let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

		XCTAssertEqual(ruleResponse.conditions.count, 1)
		let condition = ruleResponse.conditions.first
		switch condition {
		case .ConditionDouble(let condition):
			XCTAssertEqual(condition.operation, .greaterEqual)
			XCTAssertEqual(condition.value, 0)
		case .ConditionString:
			XCTAssertTrue(false)
		case .none:
			XCTAssertTrue(false)
		}

		// Verify other rule was not changed
		let unchangedRule = try await Rule.query(on: app.db).with(\.$conditions).with(
			\.$labels
		)
		.filter(\.$id == otherRuleId).first()
		XCTAssertEqual(unchangedRule?.name, "Rule to not change")
		XCTAssertEqual(unchangedRule?.conditions.count, 2)
		XCTAssertEqual(unchangedRule?.labels.count, 3)
	}

	func testDeleteCondition() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password")
		)
		let groupOwnerId = try testGroup.requireID()

		let ruleToUpdateCond = try await Rule.createRule(
			on: app.db, for: groupOwnerId, name: "Rule to delete",
			with: .init(.contains, valueStr: "Something"),
			.init(.greater, valueDouble: 5),
			toApply: labels[0])

		try await ruleToUpdateCond.$conditions.load(on: app.db)

		let otherRuleId = try await Rule.createRule(
			on: app.db, for: try testGroup3.requireID(), name: "Rule to not change",
			with: .init(.less, valueDouble: 1), .init(.contains, valueStr: "something"),
			toApply: labels[1], labels[2], labels[3]
		).requireID()
		let ruleId = try ruleToUpdateCond.requireID()
		let conditionId = try ruleToUpdateCond.conditions.filter {
			$0.operation == .contains
		}.first!.requireID()

		let response = try await app.sendRequest(
			.DELETE,
			"/api/rules/\(ruleId.uuidString)/condition/\(conditionId.uuidString)",
			headers: headers)

		XCTAssertEqual(response.status, .ok)
		let error = try? response.content.decode(Components.Schemas._Error.self)
		XCTAssertNil(error)

		let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

		XCTAssertEqual(ruleResponse.conditions.count, 1)
		let condition = ruleResponse.conditions.first
		switch condition {
		case .ConditionDouble(let condition):
			XCTAssertEqual(condition.operation, .greater)
			XCTAssertEqual(condition.value, 5)
		case .ConditionString:
			XCTAssertTrue(false)
		case .none:
			XCTAssertTrue(false)
		}

		// Verify other rule was not changed
		let unchangedRule = try await Rule.query(on: app.db).with(\.$conditions).with(
			\.$labels
		)
		.filter(\.$id == otherRuleId).first()

		XCTAssertNotNil(unchangedRule)
		XCTAssertEqual(unchangedRule?.name, "Rule to not change")
		XCTAssertEqual(unchangedRule?.conditions.count, 2)
		XCTAssertEqual(unchangedRule?.labels.count, 3)
	}

	func testAddLabelToRule() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password")
		)
		let groupOwnerId = try testGroup.requireID()

		let ruleToUpdate = try await Rule.createRule(
			on: app.db, for: groupOwnerId, name: "Rule to update",
			with: .init(.contains, valueStr: "Something"),
			toApply: labels[0])

		try await ruleToUpdate.$conditions.load(on: app.db)

		let otherRuleId = try await Rule.createRule(
			on: app.db, for: try testGroup3.requireID(), name: "Rule to not change",
			with: .init(.less, valueDouble: 1), .init(.contains, valueStr: "something"),
			toApply: labels[1], labels[2], labels[3]
		).requireID()

		let ruleId = try ruleToUpdate.requireID()
		let labelId = try labels[4].requireID()

		// Add label to rule
		let response = try await app.sendRequest(
			.PUT,
			"/api/rules/\(ruleId.uuidString)/label/\(labelId.uuidString)",
			headers: headers)

		XCTAssertEqual(response.status, .ok)
		let error = try? response.content.decode(Components.Schemas._Error.self)
		XCTAssertNil(error)

		let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

		XCTAssertEqual(ruleResponse.labelIds.count, 2)
		XCTAssertTrue(ruleResponse.labelIds.contains(try labels[0].requireID().uuidString))
		XCTAssertTrue(ruleResponse.labelIds.contains(labelId.uuidString))

		// Try adding same label again
		let secondResponse = try await app.sendRequest(
			.PUT,
			"/api/rules/\(ruleId.uuidString)/label/\(labelId.uuidString)",
			headers: headers)

		XCTAssertEqual(secondResponse.status, .ok)
		let secondRuleResponse = try secondResponse.content.decode(
			Components.Schemas.Rule.self)
		XCTAssertEqual(secondRuleResponse.labelIds.count, 2)

		// Verify other rule was not changed
		let unchangedRule = try await Rule.query(on: app.db).with(\.$conditions).with(
			\.$labels
		)
		.filter(\.$id == otherRuleId).first()

		XCTAssertNotNil(unchangedRule)
		XCTAssertEqual(unchangedRule?.name, "Rule to not change")
		XCTAssertEqual(unchangedRule?.conditions.count, 2)
		XCTAssertEqual(unchangedRule?.labels.count, 3)
	}

	func testRemoveLabelFromRule() async throws {
		let app = try getApp()

		let headers = try await app.getHeaders(
			forUser: .init(username: testUser.username, password: "test-password")
		)
		let groupOwnerId = try testGroup.requireID()

		let ruleToUpdate = try await Rule.createRule(
			on: app.db, for: groupOwnerId, name: "Rule to update",
			with: .init(.contains, valueStr: "Something"),
			toApply: labels[0], labels[4])  // Add both labels initially

		try await ruleToUpdate.$conditions.load(on: app.db)

		let otherRuleId = try await Rule.createRule(
			on: app.db, for: try testGroup3.requireID(), name: "Rule to not change",
			with: .init(.less, valueDouble: 1), .init(.contains, valueStr: "something"),
			toApply: labels[1], labels[2], labels[3]
		).requireID()

		let ruleId = try ruleToUpdate.requireID()
		let labelId = try labels[4].requireID()

		// Remove label from rule
		let response = try await app.sendRequest(
			.DELETE,
			"/api/rules/\(ruleId.uuidString)/label/\(labelId.uuidString)",
			headers: headers)

		XCTAssertEqual(response.status, .ok)
		let error = try? response.content.decode(Components.Schemas._Error.self)
		XCTAssertNil(error)

		let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

		XCTAssertEqual(ruleResponse.labelIds.count, 1)
		XCTAssertTrue(ruleResponse.labelIds.contains(try labels[0].requireID().uuidString))
		XCTAssertFalse(ruleResponse.labelIds.contains(labelId.uuidString))

		// Verify other rule was not changed
		let unchangedRule = try await Rule.query(on: app.db).with(\.$conditions).with(
			\.$labels
		)
		.filter(\.$id == otherRuleId).first()

		XCTAssertNotNil(unchangedRule)
		XCTAssertEqual(unchangedRule?.name, "Rule to not change")
		XCTAssertEqual(unchangedRule?.conditions.count, 2)
		XCTAssertEqual(unchangedRule?.labels.count, 3)
	}

}
