import Fluent
import Leaf
import Vapor

struct HomeController: RouteCollection {
	func boot(routes: RoutesBuilder) throws {
		routes.get(use: index)
		routes.get("dashboard", use: dashboard)
	}

	func index(req: Request) async throws -> View {
		let context: [String: String] = [
			"title": "GoCardless Bank Integration"
		]
		return try await req.view.render("index", context)
	}

	func dashboard(req: Request) async throws -> View {
		// Get current user from session (for now, just get first user or create one)
		let user = try await User.query(on: req.db).first()

		guard let user = user else {
			// Redirect to create user page
			return try await req.view.render("create-user")
		}

		// Get user's bank connections with accounts
		let connections = try await BankConnection.query(on: req.db)
			.filter(\.$user.$id == user.id!)
			.with(\.$accounts)
			.all()

		struct DashboardContext: Encodable {
			let title: String
			let user: User
			let connections: [BankConnection]
		}

		let context = DashboardContext(
			title: "Dashboard",
			user: user,
			connections: connections
		)

		return try await req.view.render("dashboard", context)
	}
}
