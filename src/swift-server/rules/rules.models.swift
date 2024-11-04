import Fluent
import Vapor

enum ConditionalRelationType: String, Codable {
	case notAnd
	case or
}

enum ConditionOperation: String, Codable {
	// String operations
	case prefix = "p"
	case regularExpression = "r"
	case suffix = "s"
	case contains = "c"
	// Float operations
	case greater = "g"
	case greaterEqual = "G"
	case less = "l"
	case lessEqual = "L"

}

final class Condition: Model, Content, @unchecked Sendable {
	static let schema = "core_condition"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "rule_id")
	var rule: Rule

	@Field(key: "operation")
	var operation: ConditionOperation

	@Field(key: "value_str")
	var valueStr: String?

	@Field(key: "value_float")
	var valueFloat: Double?

	init() {}

	init(
		id: UUID? = nil, ruleId: UUID, operation: ConditionOperation,
		valueStr: String? = nil, valueFloat: Double? = nil
	) {
		self.id = id
		self.$rule.id = ruleId
		self.operation = operation
		self.valueStr = valueStr
		self.valueFloat = valueFloat
	}

	func checkTransaction(_ transaction: TransactionSummary) -> Bool {
		switch operation {
		case .prefix:
			print(self.valueStr!, transaction.movementName)
			return transaction.movementName.hasPrefix(self.valueStr!)
		default:
			return false
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

	@Children(for: \.$rule)
	var labels: [RuleLabelAction]

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

	func checkConditionals(on db: Database, for transaction: TransactionSummary) async throws
		-> Bool
	{
		try await $conditions.load(on: db)
		let summary = conditions.map { $0.checkTransaction(transaction) }
		print(summary)
		switch conditionsRelation {
		case .or:
			return summary.contains { $0 }
		case .notAnd:
			return false
		}
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

	@Parent(key: "rule_id")
	var rule: Rule

	@Parent(key: "label_transaction_id")
	var labelTransaction: LabelTransaction

	init() {}

	init(id: UUID? = nil, ruleId: Rule.IDValue, labelTransactionId: LabelTransaction.IDValue) {
		self.id = id
		self.$rule.id = ruleId
		self.$labelTransaction.id = labelTransactionId
	}
}
