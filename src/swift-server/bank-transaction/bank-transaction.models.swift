import Fluent
import Vapor

final class BankTransaction: Model, Content, @unchecked Sendable {
	static let schema = "core_bank_transaction"

	@ID(key: .id)
	var id: UUID?

	var groupOwnerId: UserGroup.IDValue {
		$groupOwner.id
	}

	@Parent(key: "group_owner_id")
	var groupOwner: UserGroup

	@Field(key: "movement_name")
	var movementName: String

	@Field(key: "date")
	var _date: Date

	var date: DateOnly {
		get {
			DateOnly(_date)
		}
		set {
			_date = newValue.getDate()
		}
	}

	@OptionalField(key: "date_value")
	var _dateValue: Date?

	var dateValue: DateOnly? {
		get {
			guard let _dateValue else {
				return nil
			}
			return DateOnly(_dateValue)
		}
		set {
			_dateValue = newValue?.getDate()
		}
	}

	@OptionalField(key: "details")
	var details: String?

	@Field(key: "value")
	var value: Double

	@Field(key: "kind")
	var kind: String

	@Siblings(through: LabelTransaction.self, from: \.$transaction, to: \.$label)
	var labels: [Label]

	// TODO: change the name to comment
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
		self.movementName = movementName
		self.date = date
		self.dateValue = dateValue
		self.details = details
		self.value = value
		self.kind = kind
		self.description = description
	}
}
