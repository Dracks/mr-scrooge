import Fluent
import QueuesFluentDriver
import XCTQueues
import XCTVapor
import XCTest

@testable import MrScroogeServer

struct BaseCondition {
	let operation: ConditionOperation
	let valueStr: String?
	let valueDouble: Double?

	init(operation: ConditionOperation, valueStr: String) {
		self.operation = operation
		self.valueStr = valueStr
		self.valueDouble = nil
	}

	init(operation: ConditionOperation, valueDouble: Double) {
		self.operation = operation
		self.valueStr = nil
		self.valueDouble = valueDouble
	}
}

final class RulesTests: AbstractBaseTestsClass {
	var operationToLabel: [ConditionOperation: UUID] = [:]
	private func createRule(
		on db: Database, for userGroup: UserGroup,
		with conditions: BaseCondition..., toApply labels: Label...
	) async throws -> Rule {
		let rule = ruleFactory.build()
		rule.$groupOwner.id = try userGroup.requireID()
		try await rule.save(on: db)
		let ruleId = try rule.requireID()

		for cond in conditions {
			try await rule.$conditions.create(
				.init(
					ruleId: ruleId,
					operation: cond.operation,
					valueStr: cond.valueStr,
					valueDouble: cond.valueDouble
				), on: db)
		}

		for label in labels {
			try await rule.$labels.create(
				.init(
					ruleId: rule.id!,
					labelId: label.id!
				), on: db)
		}

		return rule
	}

	private func createBasicRuleAndRegister(
		on db: Database, for userGroup: UserGroup, with condition: BaseCondition,
		toApply label: Label
	) async throws -> Rule {
		let rule = try await self.createRule(
			on: db, for: userGroup, with: condition, toApply: label)
		operationToLabel[condition.operation] = label.id!
		return rule
	}

	private func createBasicRules() async throws {
		let db = app!.db

		// String operations
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(operation: .prefix, valueStr: "needle"),
			toApply: labels[0])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup,
			with: .init(operation: .regularExpression, valueStr: "A{2}B{2}"),
			toApply: labels[1])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(operation: .suffix, valueStr: "needle"),
			toApply: labels[2])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup,
			with: .init(operation: .contains, valueStr: "needle"), toApply: labels[3])
		// Float operations
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(operation: .greater, valueDouble: 1),
			toApply: labels[4])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup,
			with: .init(operation: .greaterEqual, valueDouble: 1), toApply: labels[5])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(operation: .less, valueDouble: -1),
			toApply: labels[6])
		let _ = try await createBasicRuleAndRegister(
			on: db, for: testGroup, with: .init(operation: .lessEqual, valueDouble: -1),
			toApply: labels[7])
	}

	private func checkContainsOperationLabel(
		_ labels: [UUID], for operation: ConditionOperation, context: String
	) throws {
		let label = operationToLabel[operation]
		guard let label else {
			print("Label for operation \(operation) not found!")
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
				on: app.db, withQueue: app.queues.queue, transaction: transaction)
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

		let _ = try await createRule(
			on: app.db, for: testGroup,
			with: .init(operation: .prefix, valueStr: "needle"),
			.init(operation: .less, valueDouble: 0),
			toApply: labels[0])
		let rule = try await createRule(
			on: app.db, for: testGroup,
			with: .init(operation: .prefix, valueStr: "needle"),
			.init(operation: .less, valueDouble: 0),
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
				on: app.db, withQueue: app.queues.queue, transaction: transaction)
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

		let rule1 = try await createRule(
			on: app.db, for: testGroup,
			with: .init(operation: .prefix, valueStr: "needle"),
			toApply: labels[0])
		let rule2 = try await createRule(
			on: app.db, for: testGroup,
			with: .init(operation: .less, valueDouble: 0),
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
				on: app.db, withQueue: app.queues.queue, transaction: transaction)
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
}
