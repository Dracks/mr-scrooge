import Fluent
import Foundation
import Vapor

final class MrScroogeOAuthToken: Model, Content, @unchecked Sendable {
	static let schema = "mr_scrooge_oauth_tokens"

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

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

    init(){}

    init(userId: UUID) {
        self.userId = userId
    }
}

struct CreateOAuthTokens: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("mr_scrooge_oauth_tokens")
			.id()
			.field("user_id", .uuid, .required)
			.field("access_token", .string, .required)
			.field("refresh_token", .string)
			.field("expires_at", .datetime)
			.field("created_at", .datetime, .required)
			.field("updated_at", .datetime, .required)
			.unique(on: "user_id")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("mr_scrooge_oauth_tokens").delete()
	}
}