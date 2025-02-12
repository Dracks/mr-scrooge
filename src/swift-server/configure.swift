import Fluent
import FluentSQLiteDriver
import Leaf
import Vapor

public func registerMigrations(_ app: Application) async throws {
	app.migrations.add(InitialMigration())
}

// configures your application
public func configure(_ app: Application) async throws {
	do {

		try await registerMigrations(app)

		app.databases.use(
			DatabaseConfigurationFactory.sqlite(
				.memory), as: .sqlite)

		if app.environment == .testing {
			try await app.autoMigrate()
		}

		app.views.use(.leaf)

	} catch {
		print("Configure {}", String(reflecting: error))
		throw error
	}
}
