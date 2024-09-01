import Fluent
import FluentPostgresDriver
import FluentSQLiteDriver
import Leaf
import NIOSSL
import Vapor

func configureDb(_ app: Application) async throws {
	var dbUrl = Environment.get("DB_URL") ?? "sqlite://db.sqlite3"
	if !dbUrl.starts(with: "sqlite://") && !dbUrl.starts(with: "postgres://") {
		print("Warning: Invalid DB_URL format. Using default.")
		dbUrl = "sqlite://db.sqlite3"
	}

	let components = dbUrl.split(separator: ":", maxSplits: 1)
	let dbType = components[0].lowercased()
	let filePath = String(components[1].dropFirst(2))

	let sqlLogLevel: Logger.Level =
		Environment.get("SQL_LOG_LEVEL").flatMap { Logger.Level(rawValue: $0) } ?? .debug

	switch dbType {
	case "postgres":
		app.databases.use(try DatabaseConfigurationFactory.postgres(url: dbUrl), as: .psql)
	case "sqlite":
		if filePath == "memory" {
			app.databases.use(
				DatabaseConfigurationFactory.sqlite(
					.memory, sqlLogLevel: sqlLogLevel), as: .sqlite)
		} else {
			app.databases.use(
				DatabaseConfigurationFactory.sqlite(
					.file(filePath), sqlLogLevel: sqlLogLevel), as: .sqlite)
		}
	default:
		throw Exception(.E10003, context: ["db_url": dbUrl])
	}
}

public func registerMigrations(_ app: Application) async throws {
	app.migrations.add(SessionRecord.migration)
	app.migrations.add(InitialMigration())
}

// configures your application
public func configure(_ app: Application) async throws {
	do {
		// uncomment to serve files from /Public folder
		app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))

		try await registerMigrations(app)

		try await configureDb(app)

		if app.environment == .testing {
			try await app.autoMigrate()
		}

		app.sessions.use(.fluent)
		app.views.use(.leaf)

		app.commands.use(CreateUserCommand(), as: "demo_user")
		app.commands.use(DemoDataCommand(), as: "demo_data")

		// register routes
		try routes(app)
	} catch {
		print(error)
		try await app.asyncShutdown()
		throw error
	}
}
