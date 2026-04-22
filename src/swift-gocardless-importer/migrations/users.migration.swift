import Fluent
import Foundation
import Vapor

final class User: Model, Content, @unchecked Sendable {
	static let schema = "users"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "external_id")
	var externalId: UUID

	@Field(key: "username")
	var username: String

	@Field(key: "email")
	var email: String?

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(
		id: UUID? = nil, externalId: UUID, username: String, email: String? = nil,
		createdAt: Date? = nil, updatedAt: Date? = nil
	) {
		self.id = id
		self.externalId = externalId
		self.username = username
		self.email = email
		self.createdAt = createdAt
		self.updatedAt = updatedAt
	}

	init(_ sourceId: UUID, username: String) {
		self.externalId = sourceId
		self.username = username
	}
}

extension User: SessionAuthenticatable {
	typealias SessionID = UUID
	var sessionID: SessionID {
		self.id!
	}
}

struct CreateGocardlessUsers: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("users")
			.id()
			.field("external_id", .uuid, .required)
			.field("username", .string, .required)
			.field("email", .string)
			.field("created_at", .datetime, .required)
			.field("updated_at", .datetime, .required)
			.unique(on: "external_id")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("users").delete()
	}
}