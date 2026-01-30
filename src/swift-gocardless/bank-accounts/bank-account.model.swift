import Fluent
import Vapor

final class BankAccount: Model, Content, @unchecked Sendable {
	static let schema = "bank_accounts"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "bank_connection_id")
	var bankConnection: BankConnection

	@Field(key: "account_id")
	var accountId: String

	@Field(key: "iban")
	var iban: String?

	@Field(key: "account_name")
	var accountName: String?

	@Field(key: "currency")
	var currency: String?

	@Field(key: "owner_name")
	var ownerName: String?

	@Field(key: "is_enabled")
	var isEnabled: Bool

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(
		id: UUID? = nil,
		bankConnectionID: UUID,
		accountId: String,
		iban: String? = nil,
		accountName: String? = nil,
		currency: String? = nil,
		ownerName: String? = nil,
		isEnabled: Bool = true
	) {
		self.id = id
		self.$bankConnection.id = bankConnectionID
		self.accountId = accountId
		self.iban = iban
		self.accountName = accountName
		self.currency = currency
		self.ownerName = ownerName
		self.isEnabled = isEnabled
	}
}

struct CreateBankAccount: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("bank_accounts")
			.id()
			.field(
				"bank_connection_id", .uuid, .required,
				.references("bank_connections", "id", onDelete: .cascade)
			)
			.field("account_id", .string, .required)
			.field("iban", .string)
			.field("account_name", .string)
			.field("currency", .string)
			.field("owner_name", .string)
			.field("is_enabled", .bool, .required)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.unique(on: "account_id")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("bank_accounts").delete()
	}
}
