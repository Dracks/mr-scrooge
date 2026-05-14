import Fluent
import Foundation
import Vapor

final class GocardlessCredentials: Model, Content, @unchecked Sendable {
	static let schema = "gocardless_credentials"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "user_id")
	var user: User

	@Field(key: "secret_id")
	var secretId: String

	@Field(key: "secret_key")
	var secretKey: String

	@Field(key: "access_token")
	var accessToken: String?

	@Field(key: "refresh_token")
	var refreshToken: String?

	@Field(key: "access_token_expires_at")
	var accessTokenExpiresAt: Date?

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(
		id: UUID? = nil, userId: User.IDValue, secretId: String, secretKey: String,
		accessToken: String? = nil, refreshToken: String? = nil,
		accessTokenExpiresAt: Date? = nil, createdAt: Date? = nil, updatedAt: Date? = nil
	) {
		self.id = id
		self.$user.id = userId
		self.secretId = secretId
		self.secretKey = secretKey
		self.accessToken = accessToken
		self.refreshToken = refreshToken
		self.accessTokenExpiresAt = accessTokenExpiresAt
		self.createdAt = createdAt
		self.updatedAt = updatedAt
	}
}

extension GocardlessCredentials {
	func setTokens(access: String, refresh: String, expiresIn: Int) {
		self.accessToken = access
		self.refreshToken = refresh
		self.accessTokenExpiresAt = Date().addingTimeInterval(TimeInterval(expiresIn))
	}

	var isTokenExpired: Bool {
		guard let expiresAt = accessTokenExpiresAt else { return true }
		return expiresAt < Date().addingTimeInterval(TimeInterval(-60))
	}
}

struct CreateGocardlessCredentials: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("gocardless_credentials")
			.id()
			.field("user_id", .uuid, .required, .references("users", "id"))
			.field("secret_id", .string, .required)
			.field("secret_key", .string, .required)
			.field("access_token", .string)
			.field("refresh_token", .string)
			.field("access_token_expires_at", .datetime)
			.field("created_at", .datetime, .required)
			.field("updated_at", .datetime, .required)
			.unique(on: "user_id")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("gocardless_credentials").delete()
	}
}
