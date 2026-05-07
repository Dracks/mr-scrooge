import Fluent
import Foundation
import Vapor

final class GocardlessBankAccount: Model, Content, @unchecked Sendable {
	static let schema = "gocardless_bank_accounts"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "user_id")
	var user: User

	@Parent(key: "agreement_id")
	var agreement: UserAgreement

	@Field(key: "account_id")
	var accountId: String

	@Field(key: "institution_id")
	var institutionId: String

	@Field(key: "institution_name")
	var institutionName: String

	@Field(key: "iban")
	var iban: String?

	@Field(key: "owner_name")
	var ownerName: String?

	@Field(key: "status")
	var status: String?

	@Field(key: "name")
	var name: String?

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(
		id: UUID? = nil,
		userId: User.IDValue,
		agreementId: UserAgreement.IDValue,
		accountId: String,
		institutionId: String,
		institutionName: String,
		iban: String?,
		ownerName: String? = nil,
		status: String?,
		name: String? = nil
	) {
		self.id = id
		self.$user.id = userId
		self.$agreement.id = agreementId
		self.accountId = accountId
		self.institutionId = institutionId
		self.institutionName = institutionName
		self.iban = iban
		self.ownerName = ownerName
		self.status = status
		self.name = name
	}
}

struct CreateGocardlessBankAccounts: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("gocardless_bank_accounts")
			.id()
			.field("user_id", .uuid, .required, .references("users", "id"))
			.field(
				"agreement_id", .uuid, .required,
				.references("user_agreements", "id")
			)
			.field("account_id", .string, .required)
			.field("institution_id", .string, .required)
			.field("institution_name", .string, .required)
			.field("iban", .string, .required)
			.field("owner_name", .string)
			.field("status", .string, .required)
			.field("name", .string)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("gocardless_bank_accounts").delete()
	}
}
