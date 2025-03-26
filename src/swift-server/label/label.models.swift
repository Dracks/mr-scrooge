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

	final class IDValue: Fields, Hashable, @unchecked Sendable {
		@Parent(key: "label_id")
		var label: Label

		@Parent(key: "transaction_id")
		var transaction: BankTransaction

		init() {}

		init(labelId: Label.IDValue, transactionId: BankTransaction.IDValue) {
			self.$label.id = labelId
			self.$transaction.id = transactionId
		}

		static func == (lhs: IDValue, rhs: IDValue) -> Bool {
			lhs.$transaction.id == rhs.$transaction.id && lhs.$label.id == rhs.$label.id
		}

		func hash(into hasher: inout Hasher) {
			hasher.combine(self.$label.id)
			hasher.combine(self.$transaction.id)
		}
	}

	@CompositeID
	var id: IDValue?

	@Enum(key: "link_reason")
	var linkReason: LabelTransitionReason

	init() {}

	init(
		id: UUID? = nil, labelId: Label.IDValue, transactionId: BankTransaction.IDValue,
		linkReason: LabelTransitionReason
	) {
		self.id = .init(labelId: labelId, transactionId: transactionId)
		self.linkReason = linkReason
	}
}
