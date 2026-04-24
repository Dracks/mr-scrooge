import Fluent
import Foundation
import Vapor

final class UserAgreement: Model, Content, @unchecked Sendable {
	static let schema = "user_agreements"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "user_id")
	var user: User

	@Field(key: "agreement_id")
	var agreementId: String

	@Field(key: "institution_id")
	var institutionId: String

	@Field(key: "institution_name")
	var institutionName: String

	@Field(key: "status")
	var status: String

	@Field(key: "access_scope")
	var accessScope: String?

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(
		id: UUID? = nil,
		userId: User.IDValue,
		agreementId: String,
		institutionId: String,
		institutionName: String,
		status: String = "pending",
		accessScope: String? = nil,
		createdAt: Date? = nil,
		updatedAt: Date? = nil
	) {
		self.id = id
		self.$user.id = userId
		self.agreementId = agreementId
		self.institutionId = institutionId
		self.institutionName = institutionName
		self.status = status
		self.accessScope = accessScope
		self.createdAt = createdAt
		self.updatedAt = updatedAt
	}
}

struct CreateUserAgreements: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("user_agreements")
			.id()
			.field("user_id", .uuid, .required, .references("users", "id"))
			.field("agreement_id", .string, .required)
			.field("institution_id", .string, .required)
			.field("institution_name", .string, .required)
			.field("status", .string, .required)
			.field("access_scope", .string)
			.field("created_at", .datetime, .required)
			.field("updated_at", .datetime, .required)
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("user_agreements").delete()
	}
}