import Fluent
import Vapor

final class BankConnection: Model, Content, @unchecked Sendable {
	static let schema = "bank_connections"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "user_id")
	var user: User

	@Field(key: "institution_id")
	var institutionId: String

	@Field(key: "institution_name")
	var institutionName: String

	@Field(key: "requisition_id")
	var requisitionId: String

	@Field(key: "status")
	var status: String

	@Field(key: "access_valid_for_days")
	var accessValidForDays: Int?

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "expires_at", on: .none)
	var expiresAt: Date?

	@Children(for: \.$bankConnection)
	var accounts: [BankAccount]

	init() {}

	init(
		id: UUID? = nil,
		userID: UUID,
		institutionId: String,
		institutionName: String,
		requisitionId: String,
		status: String = "pending",
		accessValidForDays: Int? = nil,
		expiresAt: Date? = nil
	) {
		self.id = id
		self.$user.id = userID
		self.institutionId = institutionId
		self.institutionName = institutionName
		self.requisitionId = requisitionId
		self.status = status
		self.accessValidForDays = accessValidForDays
		self.expiresAt = expiresAt
	}
}

struct CreateBankConnection: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("bank_connections")
			.id()
			.field(
				"user_id", .uuid, .required,
				.references("users", "id", onDelete: .cascade)
			)
			.field("institution_id", .string, .required)
			.field("institution_name", .string, .required)
			.field("requisition_id", .string, .required)
			.field("status", .string, .required)
			.field("access_valid_for_days", .int)
			.field("created_at", .datetime)
			.field("expires_at", .datetime)
			.unique(on: "requisition_id")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("bank_connections").delete()
	}
}
