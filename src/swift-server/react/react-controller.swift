import Foundation
import Vapor

struct ReactContext: Content {
	let debug: Bool
	let staticPath: String
	var version: String?
	let environment: String
	let decimalCount: UInt8
}

struct ReactController: RouteCollection {
	private let logger: Logger
	private var ctx: ReactContext

	init() {
		self.logger = Logger(label: "ReactController")
		let buildInfo = BuildInfo()
		self.ctx = ReactContext(
			debug: true,  // Todo: get from app env
			staticPath: "/",
			version: buildInfo.appVersion,
			environment: "development",
			decimalCount: 2
		)
	}

	func boot(routes: RoutesBuilder) throws {
		routes.get(use: getReact)
		routes.get("*", use: getReact)
		routes.grouped("*").get("*", use: getReact)

	}

	func getReact(req: Request) async throws -> View {
		logger.info("Rendering react with context: \(self.ctx)")
		return try await req.view.render("react", self.ctx)
	}
}
