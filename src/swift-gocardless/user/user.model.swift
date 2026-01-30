import Fluent
import Vapor

final class User: Model, Content, @unchecked Sendable {
	static let schema = "users"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "email")
	var email: String

	@Field(key: "name")
	var name: String

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	@Children(for: \.$user)
	var bankConnections: [BankConnection]

	init() {}

	init(id: UUID? = nil, email: String, name: String) {
		self.id = id
		self.email = email
		self.name = name
	}
}

struct CreateUser: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("users")
			.id()
			.field("email", .string, .required)
			.field("name", .string, .required)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.unique(on: "email")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("users").delete()
	}
}
