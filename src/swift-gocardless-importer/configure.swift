import Exceptions
import Fluent
import FluentPostgresDriver
import FluentSQLiteDriver
import Vapor
import VaporElementary

func getDbConfig(url dbUrl: String) throws -> (DatabaseConfigurationFactory, DatabaseID) {
	if !dbUrl.starts(with: "sqlite://") && !dbUrl.starts(with: "postgres://") {
		throw Exception(ErrorCodes.E10000, context: ["dbUrl": dbUrl])
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
		throw Exception(ErrorCodes.E10003, context: ["db_url": dbUrl])
	}
}

func configureDb(_ app: Application) async throws {
	let (dbFactory, dbId) = try getDbConfig(url: EnvConfig.shared.dbUrl)
	app.databases.use(dbFactory, as: dbId)
}

public func registerMigrations(_ app: Application) async throws {
	app.migrations.add(SessionRecord.migration)
	app.migrations.add(CreateOAuthTokens())
	app.migrations.add(CreateGocardlessUsers())
}

// configures your application
public func configure(_ app: Application) async throws {
	do {

		app.http.server.configuration.port = 8081
		// uncomment to serve files from /Public folder
		app.middleware.use(
			FileMiddleware(
				publicDirectory: app.directory.publicDirectory.appending(
					"gocardless/")))

		app.sessions.configuration.cookieName = "gocardless-importer"
		app.sessions.use(.fluent)

		try await registerMigrations(app)

		app.logger.info("Configure DB")
		try await configureDb(app)

		if app.environment == .testing {
			try await app.autoMigrate()
		}

		app.sessions.use(.fluent)
		// app.views.use(.elementary)

		//let customViewsPath = Environment.get("VIEWS_DIRECTORY") ?? app.directory.resourcesDirectory + "Views/GoCardlessApp/"
		//app.leaf.renderer.configuration.rootDirectory=customViewsPath
		// register routes
		try routes(app)

	} catch {
		app.logger.error(
			"Error configuring the application",
			metadata: ["error": "\(String(reflecting: error))"])
		throw error
	}
}
