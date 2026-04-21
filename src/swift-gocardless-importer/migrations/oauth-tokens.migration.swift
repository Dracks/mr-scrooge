import Fluent
import Foundation
import Vapor

final class GocardlessOAuthToken: Model, Content, @unchecked Sendable {
	static let schema = "oauth_tokens"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "user_id")
	var userId: UUID

	@Field(key: "access_token")
	var accessToken: String

	@Field(key: "refresh_token")
	var refreshToken: String?

	@Field(key: "expires_at")
	var expiresAt: Date?

	@Field(key: "scope")
	var scope: String

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?
}

struct CreateOAuthTokens: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("oauth_tokens")
			.id()
			.field("user_id", .uuid, .required)
			.field("access_token", .string, .required)
			.field("refresh_token", .string)
			.field("expires_at", .datetime)
			.field("scope", .string, .required)
			.field("created_at", .datetime, .required)
			.field("updated_at", .datetime, .required)
			.unique(on: "user_id")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("oauth_tokens").delete()
	}
}
