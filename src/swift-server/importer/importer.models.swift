import Fluent
import Vapor

enum FileImportStatus: String, Codable {
	case ok, warn, error
}

final class FileImportReport: Model, Content, @unchecked Sendable {
	static let schema = "import_fileimport"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "created_at")
	var createdAt: Date

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
	var date: DateOnly

	@OptionalField(key: "date_value")
	var dateValue: DateOnly?

	@OptionalField(key: "details")
	var details: String?

	@Field(key: "value")
	var value: Double

	@OptionalField(key: "description")
	var description: String?

	@OptionalField(key: "message")
	var message: String?

	@OptionalField(key: "transaction_id")
	var transactionId: UUID?

	init() {}

	init(
		id: UUID? = nil, reportId: UUID, movementName: String, date: DateOnly,
		dateValue: DateOnly? = nil, details: String? = nil, value: Double,
		description: String? = nil
	) {
		self.id = id
		self.$report.id = reportId
		self.movementName = movementName
		self.date = date
		self.dateValue = dateValue
		self.details = details
		self.value = value
		self.description = description
	}
}