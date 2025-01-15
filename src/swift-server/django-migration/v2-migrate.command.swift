import Fluent
import SQLKit
import Vapor

struct V2MigrateCommand: AsyncCommand {
	struct Signature: CommandSignature {
		@Argument(name: "dbUrl", help: "The url where to find the old Database")
		var oldDbUrl: String {
			didSet {
				guard
					oldDbUrl.starts(with: "sqlite://")
						|| oldDbUrl.starts(with: "postgres://")
				else {
					fatalError(
						"Invalid database URL format. Must start with 'sqlite://' or 'postgres://'"
					)
				}
			}
		}

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
		let oldDb = application.db(oldDbId)

		guard let sql = oldDb as? SQLDatabase else {
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
			owner: try groupOwner.requireID(), app: application, oldDb: oldDb,
			oldSqlDb: sql)

		context.console.print("Starting migration...")
		context.console.print("Migrating tags to labels...")
		try await migrator.migrateTagsToLabels()
		context.console.print("Migrating tags to rules...")
		try await migrator.migrateTagsToRules()
		context.console.print("Migrating transactions...")
		try await migrator.migrateTransactions()
		context.console.print("Migrating graphs...")
		try await migrator.migrateGraphs()

		context.console.print("Migration complete!")
	}
}
