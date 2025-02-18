import Fluent
import Vapor

enum FileImportStatus: String, Codable {
	case ok, warn, error
}

final class FileImportReport: Model, Content, @unchecked Sendable {
	static let schema = "import_fileimport"

	@ID(key: .id)
	var id: UUID?

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Field(key: "description")
	var description: String

	@Field(key: "file_name")
	var fileName: String

	@Field(key: "group_owner_id")
	var groupOwnerId: UUID

	@Field(key: "kind")
	var kind: String

	@Enum(key: "status")
	var status: FileImportStatus

	@OptionalField(key: "stack")
	var stack: String?

	@OptionalField(key: "context")
	var context: String?

	@Children(for: \.$report)
	var rows: [FileImportRow]

	init() {}

	init(
		id: UUID? = nil, description: String, fileName: String, groupOwnerId: UUID,
		kind: String, status: FileImportStatus
	) {
		self.id = id
		self.description = description
		self.fileName = fileName
		self.groupOwnerId = groupOwnerId
		self.kind = kind
		self.status = status
		createdAt = Date()
	}
}

final class FileImportRow: Model, @unchecked Sendable {
	static let schema = "import_fileimport_row"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "report_id")
	var report: FileImportReport

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

	@OptionalField(key: "message")
	var message: String?

	@OptionalParent(key: "transaction_id")
	var transaction: BankTransaction?

	init() {}

	init(
		id: UUID? = nil, reportId: UUID, movementName: String, date: DateOnly,
		dateValue: DateOnly? = nil, details: String? = nil, value: Double,
		message: String? = nil, transactionId: UUID? = nil
	) {
		self.id = id
		self.$report.id = reportId
		self.movementName = movementName
		self.date = date
		self.dateValue = dateValue
		self.details = details
		self.value = value
		self.message = message
		self.$transaction.id = transactionId
	}
}
