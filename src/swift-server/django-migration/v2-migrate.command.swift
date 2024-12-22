import Fluent
import SQLKit
import Vapor

struct V2MigrateCommand: AsyncCommand {
	struct Signature: CommandSignature {
		@Argument(name: "dbUrl", help: "The url where to find the old Database")
		var oldDbUrl: String

		@Argument(
			name: "group-owner-id",
			help: "The group owner Id used for the imported data")
		var groupOwnerId: UUID
	}

	var help: String {
		"Migrates all data from the old MrScrooge V2 Database"
	}

	func run(using context: CommandContext, signature: Signature) async throws {
		let (dbFactory, _) = try getDbConfig(url: signature.oldDbUrl)
		let application = context.application
		let oldDbId: DatabaseID = .init(string: "old")
		application.databases.use(dbFactory, as: oldDbId, isDefault: false)

		guard let sql = application.db(oldDbId) as? SQLDatabase else {
			throw Exception(.E10020, context: ["oldDbUrl": signature.oldDbUrl])
		}

		guard
			let groupOwner = try await UserGroup.query(on: application.db).filter(
				\.$id == signature.groupOwnerId
			).first()
		else {
			context.console.print("Group Owner Id not found")
			return
		}
		let migrator = DjangoMigrationService(
			owner: try groupOwner.requireID(), app: application, oldDb: sql)

		try await migrator.migrateTagsToLabels()
		try await migrator.migrateTagsToRules()
		try await migrator.migrateTransactions()
		try await migrator.migrateGraphs()

		context.console.print("Migration complete!")
	}
}
