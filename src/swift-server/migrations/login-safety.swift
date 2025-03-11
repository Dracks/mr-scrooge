import Fluent
import FluentSQL

struct LoginSafetyMigration: AsyncMigration {
	func prepare(on db: Database) async throws {
		guard let sqlDb = db as? SQLDatabase else {
			throw Exception(.E10031)
		}
		try await db.schema("user_login_attempt")
			.id()
			.field("username", .string, .required)
			.field("timestamp", .datetime, .required)
			.create()

		try await sqlDb.create(index: "user_login_attempt_username_idx")
			.on("user_login_attempt")
			.column("username")
			.run()

		try await sqlDb.create(index: "user_login_attempt_timestamp_idx")
			.on("user_login_attempt")
			.column("timestamp")
			.run()
	}

	func revert(on db: Database) async throws {
		try await db.schema("user_login_attempt").delete()
	}

}
