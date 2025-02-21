import Vapor

final class EnvConfig: Sendable {

	// Used to know which database should be used
	let dbUrl: String
	// Used to debug the sql queries
	let sqlLogLevel: Logger.Level
	// Used in the frontend, to know at which path prefix needs to download the assets
	let staticPath: String
	// Used in the frontend to show the decimals
	let decimalCount: UInt8
	// Used in the fronend to enable some extra features
	let debug: Bool
	// Used to show in the frontend footers
	let environment: String

	private init() {
		dbUrl = Environment.get("DB_URL") ?? "sqlite://db.sqlite3"
		staticPath = Environment.get("STATIC_PATH") ?? "/"
		decimalCount = UInt8(Environment.get("DECIMAL_COUNT") ?? "2") ?? 2
		environment = Environment.get("ENVIRONMENT") ?? "development"

		if let envDebug = Environment.get("APP_DEBUG") {
			debug = envDebug.lowercased() == "true"
		} else {
			#if DEBUG
				debug = true
			#else
				debug = false
			#endif
		}

		if let envSqlLogLevel = Environment.get("SQL_LOG_LEVEL"),
			let envSqlLogLevel = Logger.Level(rawValue: envSqlLogLevel)
		{
			sqlLogLevel = envSqlLogLevel
		} else if debug {
			sqlLogLevel = .info
		} else {
			sqlLogLevel = .debug
		}

	}

	static let shared: EnvConfig = .init()
}
