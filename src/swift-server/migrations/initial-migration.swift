import Fluent
import Vapor

struct InitialMigration:
	AsyncMigration
{
	func prepare(on database: Database) async throws {
		try await database.schema("user_groups")
			.id()
			.field("name", .string, .required)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.create()

		try await database.schema("users")
			.id()
			.field("username", .string, .required)
			.field("password_hash", .string, .required)
			.field("email", .string, .required)
			.field("first_name", .string)
			.field("last_name", .string)
			.field("is_active", .bool, .required)
			.field("is_superuser", .bool, .required)
			.field(
				"default_group_id", .uuid, .required,
				.references("user_groups", "id")
			)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.unique(on: "username")
			.unique(on: "email")
			.create()

		try await database.schema("user_group_pivot")
			.id()
			.field("user_id", .uuid, .required, .references("users", "id"))
			.field("group_id", .uuid, .required, .references("user_groups", "id"))
			.unique(on: "user_id", "group_id")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("user_group_pivot").delete()
		try await database.schema("users").delete()
		try await database.schema("user_groups").delete()
	}
}
