import Foundation
import Vapor

struct ReactContext: Content {
	let debug: Bool
	let staticPath: String
	var version: String?
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
			version: buildInfo.appVersion
		)
	}

	func boot(routes: RoutesBuilder) throws {
		routes.get("*", use: getReact)
		routes.get(use: getReact)

	}

	func getReact(req: Request) throws -> EventLoopFuture<View> {
		logger.info("Rendering react with context: \(self.ctx)")
		return req.view.render("react", self.ctx)
	}
}
