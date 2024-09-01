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
		self.ctx = ReactContext(
			debug: true,  // Todo: get from app env
			staticPath: "/"
		)
	}

	mutating func onModuleInit() async throws {
		// Load version from package.json

		self.loadVersion()

	}

	func boot(routes: RoutesBuilder) throws {
		routes.get("*", use: getReact)
		routes.get(use: getReact)

	}

	private mutating func loadVersion() {
		let fileManager = FileManager.default
		let currentPath = fileManager.currentDirectoryPath
		let packagePath = currentPath + "/package.json"

		do {
			let data = try Data(contentsOf: URL(fileURLWithPath: packagePath))
			if let json = try JSONSerialization.jsonObject(with: data, options: [])
				as? [String: Any],
				let version = json["version"] as? String
			{
				self.ctx.version = version
			}
		} catch {
			logger.error("Error loading package.json: \(error)")
		}
	}

	func getReact(req: Request) throws -> EventLoopFuture<View> {
		logger.info("Rendering react with context: \(self.ctx)")
		return req.view.render("react", self.ctx)
	}
}
