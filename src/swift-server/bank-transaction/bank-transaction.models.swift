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

	@OptionalField(key: "comment")
	var comment: String?

	init() {}

	init(
		id: UUID? = nil, groupOwnerId: UUID, movementName: String, date: DateOnly,
		dateValue: DateOnly? = nil, details: String? = nil, value: Double, kind: String,
		comment: String? = nil
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
		self.comment = comment
	}
}
