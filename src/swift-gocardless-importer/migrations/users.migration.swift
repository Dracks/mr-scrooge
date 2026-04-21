import Fluent
import Foundation
import Vapor

final class User: Model, Content, @unchecked Sendable {
	static let schema = "users"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "mr_scrooge_user_id")
	var mrScroogeUserId: UUID

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
		id: UUID? = nil, mrScroogeUserId: UUID, username: String, email: String? = nil,
		createdAt: Date? = nil, updatedAt: Date? = nil
	) {
		self.id = id
		self.mrScroogeUserId = mrScroogeUserId
		self.username = username
		self.email = email
		self.createdAt = createdAt
		self.updatedAt = updatedAt
	}

	init(_ sourceId: UUID, username: String) {
		self.mrScroogeUserId = sourceId
		self.username = username
	}
}

extension User: SessionAuthenticatable {
	typealias SessionID = UUID
	var sessionID: SessionID {
		self.id!
	}
}

struct UserSessionAuthenticator: AsyncSessionAuthenticator {
	typealias User = GoCardlessImporter.User

	func authenticate(sessionID: UUID, for request: Request) async throws {
		request.logger.warning("Authenticating the user \(sessionID)")
		guard let user = try await User.find(sessionID, on: request.db) else {
			request.logger.warning("Authenticating the user not valid")
			return
		}

		request.auth.login(user)
	}

}

func getUser(fromRequest req: Request) -> User? {
	let user = req.auth.get(User.self)

	return user

}

struct CreateGocardlessUsers: AsyncMigration {
	func prepare(on database: Database) async throws {
		try await database.schema("users")
			.id()
			.field("mr_scrooge_user_id", .uuid, .required)
			.field("username", .string, .required)
			.field("email", .string)
			.field("created_at", .datetime, .required)
			.field("updated_at", .datetime, .required)
			.unique(on: "mr_scrooge_user_id")
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("users").delete()
	}
}
