import Fluent
import Vapor

struct UserController: RouteCollection {
	func boot(routes: RoutesBuilder) throws {
		let users = routes.grouped("users")
		users.get("create", use: showCreateForm)
		users.post("create", use: create)
		users.get(":userID", use: show)
	}

	func showCreateForm(req: Request) async throws -> View {
		return try await req.view.render("create-user")
	}

	func create(req: Request) async throws -> Response {
		struct CreateUserData: Content {
			let name: String
			let email: String
		}

		let data = try req.content.decode(CreateUserData.self)

		let user = User(email: data.email, name: data.name)
		try await user.save(on: req.db)

		// Store user ID in session
		req.session.data["user_id"] = user.id?.uuidString

		return req.redirect(to: "/dashboard")
	}

	func show(req: Request) async throws -> View {
		guard let user = try await User.find(req.parameters.get("userID"), on: req.db)
		else {
			throw Abort(.notFound)
		}

		struct UserContext: Encodable {
			let title: String
			let user: User
		}

		let context = UserContext(title: "User Profile", user: user)
		return try await req.view.render("user-profile", context)
	}
}
