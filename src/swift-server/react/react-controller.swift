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
		self.ctx = ReactContext(
			// Todo: get from app env
			debug: true,
			staticPath: "/",
			version: BuildInfo.appVersion,
			commit: BuildInfo.commit,
			// This should be extracted from env vars
			environment: "development",
			decimalCount: 2
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
