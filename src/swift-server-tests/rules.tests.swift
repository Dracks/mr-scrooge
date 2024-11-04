import Fluent
import XCTQueues
import XCTVapor
import XCTest

@testable import MrScroogeServer

struct BaseCondition {
	let operation: ConditionOperation
	let valueStr: String?
	let valueFloat: Double?

	init(operation: ConditionOperation, valueStr: String) {
		self.operation = operation
		self.valueStr = valueStr
		self.valueFloat = nil
	}

	init(operation: ConditionOperation, valueFloat: Double) {
		self.operation = operation
		self.valueStr = nil
		self.valueFloat = valueFloat
	}
}

final class RulesTests: AbstractBaseTestsClass {
	private func createBasicRule(
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
					valueFloat: cond.valueFloat
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

	private func createBasicRules() async throws {
		let db = app!.db

		// String operations
		let _ = try await createBasicRule(
			on: db, for: testGroup, with: .init(operation: .prefix, valueStr: "needle"),
			toApply: labels[0])
		let _ = try await createBasicRule(
			on: db, for: testGroup,
			with: .init(operation: .regularExpression, valueStr: "needle"),
			toApply: labels[1])
		let _ = try await createBasicRule(
			on: db, for: testGroup, with: .init(operation: .suffix, valueStr: "needle"),
			toApply: labels[2])
		let _ = try await createBasicRule(
			on: db, for: testGroup,
			with: .init(operation: .contains, valueStr: "needle"), toApply: labels[3])
		// Float operations
		let _ = try await createBasicRule(
			on: db, for: testGroup, with: .init(operation: .greater, valueFloat: 1),
			toApply: labels[4])
		let _ = try await createBasicRule(
			on: db, for: testGroup,
			with: .init(operation: .greaterEqual, valueFloat: 1), toApply: labels[5])
		let _ = try await createBasicRule(
			on: db, for: testGroup, with: .init(operation: .less, valueFloat: -1),
			toApply: labels[6])
		let _ = try await createBasicRule(
			on: db, for: testGroup, with: .init(operation: .lessEqual, valueFloat: -1),
			toApply: labels[7])

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
		]

		for transaction in transactions {
			let _ = try await bankTransactionService.addTransaction(
				on: app.db, withQueue: app.queues.queue, transaction: transaction)
		}

		for transaction in transactions {
			try await transaction.$labels.load(on: app.db)
		}

		let labelsForTransactions = transactions.map {
			$0.labels.map { label in
				return label.id!
			}
		}

		XCTAssertEqual(labelsForTransactions[0].count, 0)
		XCTAssertEqual(labelsForTransactions[1].count, 3)
		XCTAssertEqual(labelsForTransactions[2].count, 0)

		/*XCTAssertEqual(
            app.queues.asyncTest.jobs.count { $0.value.jobName == String(describing: NewTransactionJob.self)},
            2,
            "Expected 2 jobs to have been dispatched"
        )*/
		XCTAssertEqual(app.queues.asyncTest.jobs.count, 3)

	}
}
