import Foundation
import Vapor

struct ReactContext: Content {
	let debug: Bool
	let staticPath: String
	let version: String
	let commit: String
	let environment: String
	let decimalCount: UInt8
}

struct ReactController: RouteCollection {
	private let logger: Logger
	private var ctx: ReactContext

	init() {
		self.logger = Logger(label: "ReactController")
		let config = EnvConfig.shared
		self.ctx = ReactContext(
			debug: config.debug,
			staticPath: config.staticPath,
			version: BuildInfo.appVersion,
			commit: BuildInfo.commit,
			environment: config.environment,
			decimalCount: config.decimalCount
		)
	}

	func boot(routes: RoutesBuilder) throws {
		routes.get(use: getReact)
		routes.get("*", use: getReact)
		routes.grouped("*").get("*", use: getReact)
		routes.grouped("*").grouped("*").get("*", use: getReact)

	}

	func getReact(req: Request) async throws -> View {
		logger.info("Rendering react with context: \(self.ctx)")
		return try await req.view.render("react", self.ctx)
	}
}
