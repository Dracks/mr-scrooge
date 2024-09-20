import Fluent
import Vapor

final class BankTransaction: Model, Content, @unchecked Sendable {
	static let schema = "core_bank_transaction"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "group_owner_id")
	var groupOwnerId: UserGroup.IDValue

	@Parent(key: "group_owner_id")
	var groupOwner: UserGroup

	@Field(key: "movement_name")
	var movementName: String

	@Field(key: "date")
	var _date: String

	var date: DateOnly {
		get {
			DateOnly(_date)!
		}
		set {
			_date = newValue.toString()
		}
	}

	@OptionalField(key: "date_value")
	var dateValue: DateOnly?

	@OptionalField(key: "details")
	var details: String?

	@Field(key: "value")
	var value: Double

	@Field(key: "kind")
	var kind: String

	@Siblings(through: LabelTransaction.self, from: \.$transaction, to: \.$label)
	var labels: [Label]

	@OptionalField(key: "description")
	var description: String?

	init() {}

	init(
		id: UUID? = nil, groupOwnerId: UUID, movementName: String, date: DateOnly,
		dateValue: DateOnly? = nil, details: String? = nil, value: Double, kind: String,
		description: String? = nil
	) {
		self.id = id
		self.$groupOwner.id = groupOwnerId
		self.groupOwnerId = groupOwnerId
		self.movementName = movementName
		self.date = date
		self.dateValue = dateValue
		self.details = details
		self.value = value
		self.kind = kind
		self.description = description
	}
}

enum ConditionalRelationType: String, Codable {
	case and = "and"
	case notOr = "notOr"
}

enum FilterConditionals: String, Codable {
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

	@Field(key: "name")
	var name: String

	@Parent(key: "rule_id")
	var rule: Rule

	init() {}

	init(id: UUID? = nil, name: String) {
		self.id = id
		self.name = name
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
	var conditionals: [Condition]

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

final class Label: Model, Content, @unchecked Sendable {
	static let schema = "core_label"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "group_owner_id")
	var groupOwner: UserGroup

	@Field(key: "name")
	var name: String

	init() {}

	init(id: UUID? = nil, groupOwnerId: UserGroup.IDValue, name: String) {
		self.id = id
		self.$groupOwner.id = groupOwnerId
		self.name = name
	}
}

enum LabelTransitionReason: String, Content {
	case manualEnabled
	case manualDisabled
	case automatic
}

final class LabelTransaction: Model, Content, @unchecked Sendable {
	static let schema = "core_label_transaction"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "label_id")
	var label: Label

	@Parent(key: "transaction_id")
	var transaction: BankTransaction

	@Enum(key: "link_reason")
	var linkReason: LabelTransitionReason

	init() {}

	init(
		id: UUID? = nil, labelId: Label.IDValue, transactionId: BankTransaction.IDValue,
		linkReason: LabelTransitionReason
	) {
		self.id = id
		self.$label.id = labelId
		self.$transaction.id = transactionId
		self.linkReason = linkReason
	}
}