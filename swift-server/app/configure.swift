import Fluent
import FluentPostgresDriver
import FluentSQLiteDriver
import NIOSSL
import Vapor

func configureDb(_ app: Application) async throws {
	switch Environment.get("DB_TYPE") {
	case "POSTGRES":
		let dbUrl = Environment.get("DB_URL")
		guard let dbUrl = dbUrl else {
			throw GenericError(msg: "DB_URL must be defined for DB_TYPE postgress")
		}
		app.databases.use(try DatabaseConfigurationFactory.postgres(url: dbUrl), as: .psql)
	default:
		let dbName = Environment.get("DB_NAME") ?? "db.sqlite"
		if dbName != "memory" {
			app.databases.use(
                DatabaseConfigurationFactory.sqlite(.file(dbName), sqlLogLevel: .info), as: .sqlite)
		} else {
			app.databases.use(DatabaseConfigurationFactory.sqlite(.memory, sqlLogLevel: .info), as: .sqlite)
		}
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
