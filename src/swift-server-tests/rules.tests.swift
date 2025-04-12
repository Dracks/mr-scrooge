import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Rules Tests")
final class RulesTests: BaseWithFactories {
	var operationToLabel: [ConditionOperation: UUID] = [:]

	private func createBasicRuleAndRegister(
		on db: Database, for userGroup: UserGroup, with condition: Rule.BaseCondition,
		toApply label: Label
	) async throws -> Rule {
		let rule = try await Rule.createRule(
			on: db, for: try userGroup.requireID(), with: condition, toApply: label)
		operationToLabel[condition.operation] = label.id!
		return rule
	}

	private func createBasicRules(app: Application, testData: GroupsAndUsers, labels: [Label])
		async throws
	{
		let db = app.db

		// String operations
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testData.group, with: .init(.prefix, valueStr: "needle"),
			toApply: labels[0])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testData.group,
			with: .init(.regularExpression, valueStr: "A{2}B{2}"),
			toApply: labels[1])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testData.group, with: .init(.suffix, valueStr: "needle"),
			toApply: labels[2])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testData.group,
			with: .init(.contains, valueStr: "needle"), toApply: labels[3])
		// Float operations
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testData.group, with: .init(.greater, valueDouble: 1),
			toApply: labels[4])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testData.group,
			with: .init(.greaterEqual, valueDouble: 1), toApply: labels[5])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testData.group, with: .init(.less, valueDouble: -1),
			toApply: labels[6])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testData.group, with: .init(.lessEqual, valueDouble: -1),
			toApply: labels[7])
	}

	private func checkContainsOperationLabel(
		app: Application, _ labels: [UUID], for operation: ConditionOperation,
		context: String
	) throws {
		let label = operationToLabel[operation]
		guard let label else {
			app.logger.error("Label for operation \(operation) not found!")
			throw TestError()
		}
		#expect(
			labels.contains(label), "For operation \(operation) with context \(context)"
		)
	}

	@Test("Base label assignation")
	func testBaseLabelAssignation() async throws {
		try await withApp { app in
			let bankTransactionService = app.bankTransactionService
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			try await createBasicRules(app: app, testData: testData, labels: labels)

			let testGroupId = try testData.group.requireID()
			let testGroupId2 = try testData.group2.requireID()

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
					$0.movementName =
						"in the middle is the needle only contains"
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

			#expect(labelsForTransactions[0].isEmpty)
			#expect(labelsForTransactions[2].isEmpty)

			#expect(labelsForTransactions[1].count == 3)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[1], for: .prefix,
				context: transactions[1].movementName)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[1], for: .contains,
				context: transactions[1].movementName)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[1], for: .greaterEqual,
				context: transactions[1].movementName)

			#expect(labelsForTransactions[3].count == 3)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[3], for: .greater,
				context: transactions[3].movementName)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[3], for: .contains,
				context: transactions[3].movementName)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[3], for: .greaterEqual,
				context: transactions[3].movementName)

			#expect(labelsForTransactions[4].count == 4)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[4], for: .contains,
				context: transactions[4].movementName)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[4], for: .suffix,
				context: transactions[4].movementName)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[4], for: .lessEqual,
				context: transactions[4].movementName)
			try checkContainsOperationLabel(
				app: app,
				labelsForTransactions[4], for: .less,
				context: transactions[4].movementName)
		}
	}

	@Test("Multiple rules applying same label")
	func testMultipleRulesApplyingSameLabel() async throws {
		try await withApp { app in
			let bankTransactionService = app.bankTransactionService
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let testGroupId = try testData.group.requireID()

			// Create two rules that apply the same label
			let _ = try await Rule.createRule(
				on: app.db,
				for: testGroupId,
				name: "Rule 1",
				with: .init(.contains, valueStr: "expense1"),
				toApply: labels[0]  // Both rules apply the same label
			)

			let _ = try await Rule.createRule(
				on: app.db,
				for: testGroupId,
				name: "Rule 2",
				with: .init(.contains, valueStr: "expense2"),
				toApply: labels[0]  // Both rules apply the same label
			)

			// Create test transactions
			let transactions = [
				// Transaction matching rule1
				transactionFactory.build {
					$0.$groupOwner.id = testGroupId
					$0.movementName = "expense1 transaction"
					$0.value = -100
					return $0
				},
				// Transaction matching rule2
				transactionFactory.build {
					$0.$groupOwner.id = testGroupId
					$0.movementName = "expense2 transaction"
					$0.value = -200
					return $0
				},
				// Transaction matching both rules
				transactionFactory.build {
					$0.$groupOwner.id = testGroupId
					$0.movementName = "expense1 and expense2 combined"
					$0.value = -300
					return $0
				},
			]

			// Add transactions
			for transaction in transactions {
				let _ = try await bankTransactionService.addTransaction(
					transaction: transaction)
			}

			// Process the rules
			try await app.queues.queue.worker.run()

			// Load labels for verification
			for transaction in transactions {
				try await transaction.$labels.load(on: app.db)
			}

			let labelsForTransactions = transactions.map {
				$0.labels.map { label in
					return label.id!
				}
			}

			// Verify each transaction has the label applied exactly once
			#expect(labelsForTransactions[0].count == 1)
			#expect(labelsForTransactions[1].count == 1)
			#expect(labelsForTransactions[2].count == 1)

			// Verify the correct label was applied
			let expectedLabelId = try labels[0].requireID()
			#expect(labelsForTransactions[0].first == expectedLabelId)
			#expect(labelsForTransactions[1].first == expectedLabelId)
			#expect(labelsForTransactions[2].first == expectedLabelId)

			let pivotCounts = try await RuleLabelPivot.query(on: app.db).filter(
				\.$id.$transaction.$id == transactions[2].requireID()
			).count()
			#expect(pivotCounts == 2)
		}
	}

	@Test("Conditions relation")
	func testConditionsRelation() async throws {
		try await withApp { app in
			let bankTransactionService = app.bankTransactionService
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let testGroupId = try testData.group.requireID()

			let _ = try await Rule.createRule(
				on: app.db, for: try testData.group.requireID(),
				with: .init(.prefix, valueStr: "needle"),
				.init(.less, valueDouble: 0),
				toApply: labels[0])
			let rule = try await Rule.createRule(
				on: app.db, for: try testData.group.requireID(),
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

			#expect(labelsForTransactions[0].count == 1)
			#expect(labelsForTransactions[0].first == labels[0].id)
			#expect(labelsForTransactions[1].count == 1)
			#expect(labelsForTransactions[1].first == labels[0].id)
			#expect(labelsForTransactions[2].count == 1)
			#expect(labelsForTransactions[2].first == labels[0].id)

			#expect(labelsForTransactions[3].count == 1)
			#expect(labelsForTransactions[3].first == labels[1].id)
		}
	}

	@Test("Rule parent children relation")
	func testRuleParentChildrenRelation() async throws {
		try await withApp { app in
			let bankTransactionService = app.bankTransactionService
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let testGroupId = try testData.group.requireID()

			let rule1 = try await Rule.createRule(
				on: app.db, for: try testData.group.requireID(),
				with: .init(.prefix, valueStr: "needle"),
				toApply: labels[0])
			let rule2 = try await Rule.createRule(
				on: app.db, for: try testData.group.requireID(),
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

			#expect(labelsForTransactions[0].count == 2)
			#expect(labelsForTransactions[1].isEmpty)
			#expect(labelsForTransactions[2].count == 1)
			#expect(labelsForTransactions[3].isEmpty)
		}
	}

	@Test("Get rules")
	func testGetRules() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			try await createBasicRules(app: app, testData: testData, labels: labels)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.GET, "/api/rules", headers: headers)

			#expect(response.status == .ok)

			let data = try response.content.decode(
				Operations.ApiRule_list.Output.Ok.Body.jsonPayload.self)

			let cursorResults = data.results
			#expect(cursorResults.count == 8)
			#expect(cursorResults.first?.conditions.count == 1)
			#expect(cursorResults.first?.labelIds.count == 1)
		}
	}

	@Test("Create rule")
	func testCreateRule() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let NewRule = Components.Schemas.RuleInput(
				groupOwnerId: testData.group.id!.uuidString,
				name: "Some rule",
				relations: .or
			)

			let response = try await apiTester.sendRequest(
				.POST, "/api/rules", body: NewRule, headers: headers)

			#expect(response.status == .created)

			let rule = try? response.content.decode(Components.Schemas.Rule.self)

			#expect(rule != nil)
			#expect(rule?.name == "Some rule")
			#expect(rule?.relations == .or)
			#expect(rule?.conditions.isEmpty ?? false)
			#expect(rule?.labelIds.isEmpty ?? false)
		}
	}

	@Test("Update rule")
	func testUpdateRule() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let ruleToChange = try await Rule.createRule(
				on: app.db, for: try testData.group3.requireID(),
				name: "Rule to change",
				with: .init(.less, valueDouble: 0), toApply: labels[0])
			let otherRuleId = try await Rule.createRule(
				on: app.db, for: try testData.group3.requireID(),
				name: "Rule to not change",
				with: .init(.less, valueDouble: 1),
				.init(.contains, valueStr: "something"),
				toApply: labels[1], labels[2], labels[3]
			).requireID()
			let ruleId = try ruleToChange.requireID()
			let groupOwnerId = try testData.group.requireID().uuidString

			let NewRule = Components.Schemas.RuleInput(
				groupOwnerId: groupOwnerId,
				name: "Change Rule",
				relations: .notAnd
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/rules/\(ruleId.uuidString)", body: NewRule,
				headers: headers)

			#expect(response.status == .ok)

			let rule = try? response.content.decode(Components.Schemas.Rule.self)

			#expect(rule != nil)
			#expect(rule?.name == "Change Rule")
			#expect(rule?.relations == .notAnd)
			#expect(rule?.conditions.count == 1)
			#expect(rule?.labelIds.count == 1)

			let otherRule = try await Rule.query(on: app.db).with(\.$conditions).with(
				\.$labels
			)
			.filter(\.$id == otherRuleId).first()

			#expect(otherRule != nil)
			#expect(otherRule?.name == "Rule to not change")
			#expect(otherRule?.conditionsRelation == .or)
			#expect(otherRule?.conditions.count == 2)
			#expect(otherRule?.labels.count == 3)
		}
	}

	@Test("Delete rule")
	func testDeleteRule() async throws {
		try await withApp { app in
			let bankTransactionService = app.bankTransactionService
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)
			let groupOwnerId = try testData.group.requireID()

			let ruleToChange = try await Rule.createRule(
				on: app.db, for: groupOwnerId, name: "Rule to delete",
				with: .init(.less, valueDouble: 0), toApply: labels[0])

			let otherRuleId = try await Rule.createRule(
				on: app.db, for: try testData.group3.requireID(),
				name: "Rule to not change",
				with: .init(.less, valueDouble: 1),
				.init(.contains, valueStr: "something"),
				toApply: labels[1], labels[2], labels[3]
			).requireID()
			let ruleId = try ruleToChange.requireID()

			let transaction = try await bankTransactionService.addTransaction(
				transaction: .init(
					groupOwnerId: groupOwnerId, movementName: "Test",
					date: DateOnly(year: 2020, month: 07, day: 20)!, value: -10,
					kind: "test"))

			try await app.queues.queue.worker.run()

			let response = try await apiTester.sendRequest(
				.DELETE, "/api/rules/\(ruleId.uuidString)", headers: headers)

			#expect(response.status == .ok)

			let exist =
				try await Rule.query(on: app.db).filter(\.$id == ruleId).count() > 0
			#expect(!exist)

			let otherRule = try await Rule.query(on: app.db).with(\.$conditions).with(
				\.$labels
			)
			.filter(\.$id == otherRuleId).first()

			#expect(otherRule != nil)
			#expect(otherRule?.name == "Rule to not change")
			#expect(otherRule?.conditionsRelation == .or)
			#expect(otherRule?.conditions.count == 2)
			#expect(otherRule?.labels.count == 3)

			let transactionId = try transaction.requireID()
			let labelsInDb = try await LabelTransaction.query(on: app.db).filter(
				\.$id.$transaction.$id == transactionId
			).all()
			#expect(labelsInDb.count == 1)
			let label = labelsInDb.first
			#expect(label?.linkReason == .manualEnabled)
		}
	}

	@Test("Delete rule with shared label")
	func testDeleteRuleWithSharedLabel() async throws {
		try await withApp { app in
			let bankTransactionService = app.bankTransactionService
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let testGroupId = try testData.group.requireID()

			// Create two rules that apply the same label
			let rule1 = try await Rule.createRule(
				on: app.db,
				for: testGroupId,
				name: "Rule to delete",
				with: .init(.contains, valueStr: "shared"),
				toApply: labels[0]  // Both rules apply the same label
			)

			let rule2 = try await Rule.createRule(
				on: app.db,
				for: testGroupId,
				name: "Rule to keep",
				with: .init(.contains, valueStr: "shared"),
				toApply: labels[0]  // Both rules apply the same label
			)

			// Create a transaction that matches both rules
			let transaction = transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.movementName = "shared transaction"
				$0.value = -100
				return $0
			}

			// Add transaction
			let _ = try await bankTransactionService.addTransaction(
				transaction: transaction)

			// Process the rules
			try await app.queues.queue.worker.run()

			// Load labels before deletion
			try await transaction.$labels.load(on: app.db)
			#expect(transaction.labels.count == 1)
			let labelId = try labels[0].requireID()
			#expect(transaction.labels.first?.id == labelId)

			// Delete rule1
			let _ = try await app.ruleService.deleteRule(
				withId: rule1.requireID(), for: [rule1.$groupOwner.id])

			// Reload transaction and labels
			try await transaction.$labels.load(on: app.db)

			// Verify that:
			// 1. The transaction still has the label (since rule2 still applies it)
			#expect(transaction.labels.count == 1)
			#expect(transaction.labels.first?.id == labelId)

			// 2. The RuleLabelPivot entries are correct
			let pivots = try await RuleLabelPivot.query(on: app.db)
				.filter(\.$id.$transaction.$id == transaction.requireID())
				.all()

			#expect(pivots.count == 1)
			let rule2Id = try rule2.requireID()
			#expect(pivots[0].$id.$rule.id == rule2Id)
			#expect(pivots[0].$id.$label.id == labelId)
		}
	}
	@Test("Add rule condition")
	func testAddRuleCondition() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let groupOwnerId = try testData.group.requireID()

			let ruleToAddCond = try await Rule.createRule(
				on: app.db, for: groupOwnerId, name: "Rule to delete",
				toApply: labels[0])

			let otherRuleId = try await Rule.createRule(
				on: app.db, for: try testData.group2.requireID(),
				name: "Rule to not change",
				with: .init(.less, valueDouble: 1),
				.init(.contains, valueStr: "something"),
				toApply: labels[1], labels[2], labels[3]
			).requireID()
			let ruleId = try ruleToAddCond.requireID()

			let conditionInput = Components.Schemas.ConditionInput.ConditionStringInput(
				.init(operation: .contains, value: "condition"))

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.POST, "/api/rules/\(ruleId.uuidString)/condition",
				body: ["condition": conditionInput], headers: headers)

			#expect(response.status == .ok)
			let error = try? response.content.decode(Components.Schemas._Error.self)
			#expect(error == nil)

			let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

			#expect(ruleResponse.conditions.count == 1)
			let condition = ruleResponse.conditions.first
			switch condition {
			case .ConditionString(let condition):
				#expect(condition.operation == .contains)
				#expect(condition.value == "condition")
			case .ConditionDouble:
				#expect(Bool(false))
			case .none:
				#expect(Bool(false))
			}

			// Verify otherRule was not changed
			let otherRule = try await Rule.query(on: app.db).with(\.$conditions).with(
				\.$labels
			)
			.filter(\.$id == otherRuleId).first()

			#expect(otherRule != nil)
			#expect(otherRule?.name == "Rule to not change")
			#expect(otherRule?.conditions.count == 2)
			#expect(otherRule?.labels.count == 3)
		}
	}

	@Test("Update rule condition")
	func testUpdateRuleCondition() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let groupOwnerId = try testData.group.requireID()

			let ruleToUpdateCond = try await Rule.createRule(
				on: app.db, for: groupOwnerId, name: "Rule to delete",
				with: .init(.contains, valueStr: "Something"),
				toApply: labels[0])

			try await ruleToUpdateCond.$conditions.load(on: app.db)

			let otherRule = try await Rule.createRule(
				on: app.db, for: try testData.group2.requireID(),
				name: "Rule to not change",
				with: .init(.less, valueDouble: 1),
				.init(.contains, valueStr: "something"),
				toApply: labels[1], labels[2], labels[3]
			)
			let otherRuleId = try otherRule.requireID()
			let ruleId = try ruleToUpdateCond.requireID()
			let conditionId = try ruleToUpdateCond.conditions.first!.requireID()

			let conditionInput = Components.Schemas.ConditionInput.ConditionDoubleInput(
				.init(operation: .greaterEqual, value: 0))

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.PUT,
				"/api/rules/\(ruleId.uuidString)/condition/\(conditionId.uuidString)",
				body: ["condition": conditionInput], headers: headers)

			#expect(response.status == .ok)
			let error = try? response.content.decode(Components.Schemas._Error.self)
			#expect(error == nil)

			let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

			#expect(ruleResponse.conditions.count == 1)
			let condition = ruleResponse.conditions.first
			switch condition {
			case .ConditionDouble(let condition):
				#expect(condition.operation == .greaterEqual)
				#expect(condition.value == 0)
			case .ConditionString:
				#expect(Bool(false))
			case .none:
				#expect(Bool(false))
			}

			// Verify other rule was not changed
			let unchangedRule = try await Rule.query(on: app.db).with(\.$conditions)
				.with(
					\.$labels
				)
				.filter(\.$id == otherRuleId).first()
			#expect(unchangedRule?.name == "Rule to not change")
			#expect(unchangedRule?.conditions.count == 2)
			#expect(unchangedRule?.labels.count == 3)
		}
	}

	@Test("Delete condition")
	func testDeleteCondition() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let groupOwnerId = try testData.group.requireID()

			let ruleToUpdateCond = try await Rule.createRule(
				on: app.db, for: groupOwnerId, name: "Rule to delete",
				with: .init(.contains, valueStr: "Something"),
				.init(.greater, valueDouble: 5),
				toApply: labels[0])

			try await ruleToUpdateCond.$conditions.load(on: app.db)

			let otherRuleId = try await Rule.createRule(
				on: app.db, for: try testData.group2.requireID(),
				name: "Rule to not change",
				with: .init(.less, valueDouble: 1),
				.init(.contains, valueStr: "something"),
				toApply: labels[1], labels[2], labels[3]
			).requireID()
			let ruleId = try ruleToUpdateCond.requireID()
			let conditionId = try ruleToUpdateCond.conditions.filter {
				$0.operation == .contains
			}.first!.requireID()

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.DELETE,
				"/api/rules/\(ruleId.uuidString)/condition/\(conditionId.uuidString)",
				headers: headers)

			#expect(response.status == .ok)
			let error = try? response.content.decode(Components.Schemas._Error.self)
			#expect(error == nil)

			let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

			#expect(ruleResponse.conditions.count == 1)
			let condition = ruleResponse.conditions.first
			switch condition {
			case .ConditionDouble(let condition):
				#expect(condition.operation == .greater)
				#expect(condition.value == 5)
			case .ConditionString:
				#expect(Bool(false))
			case .none:
				#expect(Bool(false))
			}

			// Verify other rule was not changed
			let unchangedRule = try await Rule.query(on: app.db).with(\.$conditions)
				.with(
					\.$labels
				)
				.filter(\.$id == otherRuleId).first()

			#expect(unchangedRule != nil)
			#expect(unchangedRule?.name == "Rule to not change")
			#expect(unchangedRule?.conditions.count == 2)
			#expect(unchangedRule?.labels.count == 3)
		}
	}

	@Test("Add label to rule")
	func testAddLabelToRule() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let groupOwnerId = try testData.group.requireID()

			let ruleToUpdate = try await Rule.createRule(
				on: app.db, for: groupOwnerId, name: "Rule to update",
				with: .init(.contains, valueStr: "Something"),
				toApply: labels[0])

			try await ruleToUpdate.$conditions.load(on: app.db)

			let otherRuleId = try await Rule.createRule(
				on: app.db, for: try testData.group2.requireID(),
				name: "Rule to not change",
				with: .init(.less, valueDouble: 1),
				.init(.contains, valueStr: "something"),
				toApply: labels[1], labels[2], labels[3]
			).requireID()

			let ruleId = try ruleToUpdate.requireID()
			let labelId = try labels[4].requireID()

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			// Add label to rule
			let response = try await apiTester.sendRequest(
				.PUT,
				"/api/rules/\(ruleId.uuidString)/label/\(labelId.uuidString)",
				headers: headers)

			#expect(response.status == .ok)
			let error = try? response.content.decode(Components.Schemas._Error.self)
			#expect(error == nil)

			let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

			#expect(ruleResponse.labelIds.count == 2)
			#expect(
				ruleResponse.labelIds.contains(try labels[0].requireID().uuidString)
			)
			#expect(ruleResponse.labelIds.contains(labelId.uuidString))

			// Try adding same label again
			let secondResponse = try await apiTester.sendRequest(
				.PUT,
				"/api/rules/\(ruleId.uuidString)/label/\(labelId.uuidString)",
				headers: headers)

			#expect(secondResponse.status == .ok)
			let secondRuleResponse = try secondResponse.content.decode(
				Components.Schemas.Rule.self)
			#expect(secondRuleResponse.labelIds.count == 2)

			// Verify other rule was not changed
			let unchangedRule = try await Rule.query(on: app.db).with(\.$conditions)
				.with(
					\.$labels
				)
				.filter(\.$id == otherRuleId).first()

			#expect(unchangedRule != nil)
			#expect(unchangedRule?.name == "Rule to not change")
			#expect(unchangedRule?.conditions.count == 2)
			#expect(unchangedRule?.labels.count == 3)
		}
	}

	@Test("Remove label from rule")
	func testRemoveLabelFromRule() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let groupOwnerId = try testData.group.requireID()

			let ruleToUpdate = try await Rule.createRule(
				on: app.db, for: groupOwnerId, name: "Rule to update",
				with: .init(.contains, valueStr: "Something"),
				toApply: labels[0], labels[4])  // Add both labels initially

			try await ruleToUpdate.$conditions.load(on: app.db)

			let otherRuleId = try await Rule.createRule(
				on: app.db, for: try testData.group2.requireID(),
				name: "Rule to not change",
				with: .init(.less, valueDouble: 1),
				.init(.contains, valueStr: "something"),
				toApply: labels[1], labels[2], labels[3]
			).requireID()

			let ruleId = try ruleToUpdate.requireID()
			let labelId = try labels[4].requireID()

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			// Remove label from rule
			let response = try await apiTester.sendRequest(
				.DELETE,
				"/api/rules/\(ruleId.uuidString)/label/\(labelId.uuidString)",
				headers: headers)

			#expect(response.status == .ok)
			let error = try? response.content.decode(Components.Schemas._Error.self)
			#expect(error == nil)

			let ruleResponse = try response.content.decode(Components.Schemas.Rule.self)

			#expect(ruleResponse.labelIds.count == 1)
			#expect(
				ruleResponse.labelIds.contains(try labels[0].requireID().uuidString)
			)
			#expect(!ruleResponse.labelIds.contains(labelId.uuidString))

			// Verify other rule was not changed
			let unchangedRule = try await Rule.query(on: app.db).with(\.$conditions)
				.with(
					\.$labels
				)
				.filter(\.$id == otherRuleId).first()

			#expect(unchangedRule != nil)
			#expect(unchangedRule?.name == "Rule to not change")
			#expect(unchangedRule?.conditions.count == 2)
			#expect(unchangedRule?.labels.count == 3)
		}
	}

}
