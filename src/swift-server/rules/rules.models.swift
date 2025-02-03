import Fluent
import Vapor

enum ConditionalRelationType: String, Codable {
	case notAnd
	case or
}

enum ConditionOperation: String, Codable {
	// String operations
	case prefix
	case regularExpression
	case suffix
	case contains
	// Float operations
	case greater
	case greaterEqual
	case less
	case lessEqual

}

final class Condition: Model, Content, @unchecked Sendable {
	static let schema = "core_condition"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "rule_id")
	var rule: Rule

	@Enum(key: "operation")
	var operation: ConditionOperation

	@Field(key: "value_str")
	var valueStr: String?

	@Field(key: "value_double")
	var valueDouble: Double?

	init() {}

	init(
		id: UUID? = nil, ruleId: UUID, operation: ConditionOperation,
		valueStr: String? = nil, valueDouble: Double? = nil
	) {
		self.id = id
		self.$rule.id = ruleId
		self.operation = operation
		self.valueStr = valueStr
		self.valueDouble = valueDouble
	}

	init(_ cond: Rule.BaseCondition, for ruleId: UUID) {
		$rule.id = ruleId
		operation = cond.operation
		valueStr = cond.valueStr
		valueDouble = cond.valueDouble
	}

	func getStr() throws -> String {
		guard let valueStr = self.valueStr else {
			throw Exception(
				.E10013, context: ["condition": id as Any, "parent": $rule.id])
		}
		return valueStr
	}

	func getDouble() throws -> Double {
		guard let valueDouble = self.valueDouble else {
			throw Exception(
				.E10014, context: ["condition": id as Any, "parent": $rule.id])
		}
		return valueDouble
	}

	func toClousure() throws -> (_ transaction: TransactionSummary) -> Bool {
		switch operation {
		case .prefix:
			let value = try getStr()
			return { transaction in
				transaction.movementName.hasPrefix(value)
			}
		case .contains:
			let value = try getStr()
			return { transaction in
				transaction.movementName.contains(value)
			}
		case .suffix:
			let value = try getStr()
			return { transaction in
				transaction.movementName.hasSuffix(value)
			}
		case .regularExpression:
			let value = try getStr()
			let regex = try Regex(value)
			return { transaction in
				transaction.movementName.contains(regex)
			}
		case .greater:
			let value = try getDouble()
			return { transaction in
				transaction.value > value
			}
		case .greaterEqual:
			let value = try getDouble()
			return { transaction in
				transaction.value >= value
			}
		case .lessEqual:
			let value = try getDouble()
			return { transaction in
				transaction.value <= value
			}
		case .less:
			let value = try getDouble()
			return { transaction in
				transaction.value < value
			}
		}
	}
}

final class Rule: Model, Content, @unchecked Sendable {
	static let schema = "core_rule"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "group_owner_id")
	var groupOwner: UserGroup

	@Field(key: "name")
	var name: String

	@Children(for: \.$rule)
	var conditions: [Condition]

	@Siblings(through: RuleLabelAction.self, from: \.$rule, to: \.$label)
	var labels: [Label]

	// Not a big fan of this duplication, but since Some parts simply only care about the labels
	// and other need to work with the pivot, I added this here as a helper.
	@Children(for: \.$rule)
	var labelPivots: [RuleLabelAction]

	@Enum(key: "conditions_relation")
	var conditionsRelation: ConditionalRelationType

	@OptionalParent(key: "parent_id")
	var parent: Rule?

	@Children(for: \.$parent)
	var children: [Rule]

	init() {}

	init(
		id: UUID? = nil, groupOwnerId: UserGroup.IDValue, name: String,
		conditionsRelation: ConditionalRelationType = .or, parentId: Rule.IDValue? = nil
	) {
		self.id = id
		self.$groupOwner.id = groupOwnerId
		self.name = name
		self.conditionsRelation = conditionsRelation
		self.$parent.id = parentId
	}

	struct BaseCondition {
		let operation: ConditionOperation
		let valueStr: String?
		let valueDouble: Double?

		init(_ operation: ConditionOperation, valueStr: String) {
			self.operation = operation
			self.valueStr = valueStr
			self.valueDouble = nil
		}

		init(_ operation: ConditionOperation, valueDouble: Double) {
			self.operation = operation
			self.valueStr = nil
			self.valueDouble = valueDouble
		}
	}

	static func createRule(
		on db: Database, for userGroupId: UUID, name: String = "rule",
		with conditions: BaseCondition..., toApply labels: Label...
	) async throws -> Rule {
		let rule = Rule(groupOwnerId: userGroupId, name: name, conditionsRelation: .or)
		try await rule.save(on: db)
		let ruleId = try rule.requireID()

		for cond in conditions {
			try await rule.$conditions.create(
				.init(cond, for: ruleId), on: db)
		}

		for label in labels {
			try await rule.$labels.attach(label, on: db)
		}

		return rule
	}
}

// This one is to know which labels will be linked
final class RuleLabelAction: Model, @unchecked Sendable {
	static let schema = "core_rule_label_action"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "rule_id")
	var rule: Rule

	@Parent(key: "label_id")
	var label: Label

	@Siblings(through: RuleLabelPivot.self, from: \.$ruleLabel, to: \.$labelTransaction)
	var transactionPivot: [LabelTransaction]

	init() {}

	init(id: UUID? = nil, ruleId: UUID, labelId: UUID) {
		self.id = id
		self.$rule.id = ruleId
		self.$label.id = labelId
	}
}

// This one is for safe the labels that are applied automatically
// To the bank Transaction
final class RuleLabelPivot: Model, @unchecked Sendable {
	static let schema = "core_rule_label_pivot"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "rule_label_id")
	var ruleLabel: RuleLabelAction

	@Parent(key: "label_transaction_id")
	var labelTransaction: LabelTransaction

	init() {}

	init(
		id: UUID? = nil, ruleLabelId: RuleLabelAction.IDValue,
		labelTransactionId: LabelTransaction.IDValue
	) {
		self.id = id
		self.$ruleLabel.id = ruleLabelId
		self.$labelTransaction.id = labelTransactionId
	}
}
