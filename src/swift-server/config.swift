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

	// Time that we will wait until reply to the unauthorized in the login
	let latencyOnInvalidPassword: Int
	// Max attempts that we allow befor locking the login for the user
	let maxLoginAttempts: Int
	// The Time period in minutes on which the user will be lock since first failed attempt
	let maxLoginAttemptsTimePeriod: TimeInterval

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

		latencyOnInvalidPassword =
			Int(Environment.get("LATENCY_ON__INVALID_PASSWORD") ?? "2") ?? 2
		maxLoginAttempts = Int(Environment.get("MAX_LOGIN_ATTEMPTS") ?? "5") ?? 5
		if let envTimeInMinutes = Environment.get("MAX_LOGIN_ATTEMPTS_PERIOD") {
			let minutes = TimeInterval(envTimeInMinutes) ?? 60
			maxLoginAttemptsTimePeriod = minutes * 60
		} else {
			maxLoginAttemptsTimePeriod = 3600
		}
	}

	static let shared: EnvConfig = .init()
}
