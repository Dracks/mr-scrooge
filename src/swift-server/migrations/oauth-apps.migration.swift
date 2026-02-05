import Exceptions
import Fluent
import Foundation

struct OAuthAppsMigration: AsyncMigration {
	func prepare(on database: Database) async throws {
		// Create oauth_apps table
		try await database.schema("oauth_apps")
			.field("client_id", .uuid, .required, .identifier(auto: true))
			.field("name", .string, .required)
			.field("description", .string)
			.field("client_secret_hash", .string, .required)
			.field("redirect_uris", .array(of: .string), .required)
			.field("scopes", .array(of: .string), .required)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.create()

		// Create oauth_authorization_codes table
		try await database.schema("oauth_authorization_codes")
			.id()
			.field("code", .string, .required)
			.field("client_id", .uuid, .required)
			.field("user_id", .uuid, .required)
			.field("scopes", .array(of: .string), .required)
			.field("redirect_uri", .string, .required)
			.field("expires_at", .datetime, .required)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.foreignKey(
				"client_id", references: "oauth_apps", "client_id",
				onDelete: .cascade
			)
			.foreignKey("user_id", references: "users", "id", onDelete: .cascade)
			.unique(on: "code")
			.create()

		// Create oauth_access_tokens table
		try await database.schema("oauth_access_tokens")
			.id()
			.field("access_token", .string, .required)
			.field("refresh_token", .string)
			.field("client_id", .uuid, .required)
			.field("user_id", .uuid)
			.field("scopes", .array(of: .string), .required)
			.field("expires_at", .datetime, .required)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.foreignKey(
				"client_id", references: "oauth_apps", "client_id",
				onDelete: .cascade
			)
			.foreignKey("user_id", references: "users", "id", onDelete: .cascade)
			.unique(on: "access_token")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("oauth_access_tokens").delete()
		try await database.schema("oauth_authorization_codes").delete()
		try await database.schema("oauth_apps").delete()
	}
}
