import Fluent
import FluentPostgresDriver
import FluentSQLiteDriver
import Leaf
import NIOSSL
import QueuesFluentDriver
import Vapor

func getDbConfig(url dbUrl: String) throws -> (DatabaseConfigurationFactory, DatabaseID) {
	if !dbUrl.starts(with: "sqlite://") && !dbUrl.starts(with: "postgres://") {
		throw Exception(.E10019, context: ["dbUrl": dbUrl])
	}

	let components = dbUrl.split(separator: ":", maxSplits: 1)
	let dbType = components[0].lowercased()
	let filePath = String(components[1].dropFirst(2))

	let sqlLogLevel = EnvConfig.shared.sqlLogLevel

	switch dbType {
	case "postgres":
		return (
			try DatabaseConfigurationFactory.postgres(
				url: dbUrl, sqlLogLevel: sqlLogLevel), .psql
		)
	case "sqlite":
		if filePath == "memory" {
			return (
				DatabaseConfigurationFactory.sqlite(
					.memory, sqlLogLevel: sqlLogLevel), .sqlite
			)
		} else {
			return (
				DatabaseConfigurationFactory.sqlite(
					.file(filePath), sqlLogLevel: sqlLogLevel), .sqlite
			)
		}
	default:
		throw Exception(.E10003, context: ["db_url": dbUrl])
	}
}

func configureDb(_ app: Application) async throws {
	let (dbFactory, dbId) = try getDbConfig(url: EnvConfig.shared.dbUrl)
	app.databases.use(dbFactory, as: dbId)
}

public func registerMigrations(_ app: Application) async throws {
	app.migrations.add(SessionRecord.migration)
	app.migrations.add(JobModelMigration())
	app.migrations.add(InitialMigration())
	app.migrations.add(LoginSafetyMigration())
}

// configures your application
public func configure(_ app: Application) async throws {
	do {
		// uncomment to serve files from /Public folder
		app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))

		try await registerMigrations(app)

		app.logger.info("Configure DB")
		try await configureDb(app)

		if app.environment == .testing {
			try await app.autoMigrate()
		}

		app.sessions.use(.fluent)
		app.views.use(.leaf)
		app.queues.use(.fluent())

		app.asyncCommands.use(CreateUserCommand(), as: "create_user")
		app.asyncCommands.use(DemoDataCommand(), as: "demo_data")
		app.asyncCommands.use(V2MigrateCommand(), as: "v2_migrate")

		// register routes
		try routes(app)

		// Todo add some configuration via env var
		app.queues.add(NewTransactionJob())
		app.queues.configuration.workerCount = 1
		try app.queues.startInProcessJobs(on: .default)
		//try app.queues.startScheduledJobs()
	} catch {
		app.logger.error(
			"Error configuring the application",
			metadata: ["error": "\(String(reflecting: error))"])
		throw error
	}
}
