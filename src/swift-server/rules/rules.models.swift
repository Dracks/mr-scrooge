import Fluent
import Vapor

enum ConditionalRelationType: String, Codable {
	case and = "and"
	case notOr = "notOr"
}

enum ConditionOperation: String, Codable {
	case contains = "c"
	case greater = "g"
	case greaterEqual = "G"
	case lower = "l"
	case lowerEqual = "L"
	case prefix = "p"
	case regularExpression = "r"
	case suffix = "s"
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
	var valueFloat: Float?



	init() {}

	init(id: UUID? = nil, ruleId: UUID, operation: ConditionOperation, valueStr: String?=nil, valueFloat: Float?=nil) {
		self.id = id
		self.$rule.id = ruleId
		self.operation = operation
		self.valueStr = valueStr
		self.valueFloat = valueFloat
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
	var conditionas: [Condition]

	@Enum(key: "conditions_relation")
	var conditionsRelation: ConditionalRelationType

	@OptionalParent(key: "parent_id")
	var parent: Rule?

	@Children(for: \.$parent)
	var children: [Rule]

	init() {}

	init(
		id: UUID? = nil, groupOwnerId: UserGroup.IDValue, name: String,
		conditionsRelation: ConditionalRelationType = .and, parentId: Rule.IDValue? = nil
	) {
		self.id = id
		self.$groupOwner.id = groupOwnerId
		self.name = name
		self.conditionsRelation = conditionsRelation
		self.$parent.id = parentId
	}
}

// This one is to know which labels will be linked
final class RuleLabelAction: Model, @unchecked Sendable {
	static let schema = "rule_label_action"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "rule_id")
	var rule: Rule

	@Parent(key: "label_id")
	var label: Label
}

// This one is for safe the labels that are applied automatically
// To the bank Transaction
final class RuleLabelPivot: Model, @unchecked Sendable {
	static let schema = "rule_label_pivot"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "rule_id")
	var rule: Rule

	@Parent(key: "label_transaction_id")
	var labelTransaction: LabelTransaction
}
