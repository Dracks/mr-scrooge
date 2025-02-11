import Fluent
import Vapor

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

	#warning("Change to a combined Id with label_id and transaction_id")
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
		// TODO: Change this table to work with a key transaction/label
		self.id = id
		self.$label.id = labelId
		self.$transaction.id = transactionId
		self.linkReason = linkReason
	}
}
