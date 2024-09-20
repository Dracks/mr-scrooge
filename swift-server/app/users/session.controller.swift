import Fluent
import Graphiti
import Vapor

struct SessionController: RouteCollection {
	let usersService = UsersService()

	struct Credentials: Content {
		let username: String
		let password: String
	}

	struct UserGroupResponse: Content {
		let id: UUID
		let name: String
	}

	func boot(routes: RoutesBuilder) throws {
		let session = routes.grouped("session")
        session.post("login", use: login).openAPINoAuth()
        session.get("me", use: getCurrentUser)
		session.post("logout", use: logout)
	}

	func login(req: Request) async throws -> ProfileController.GetProfile {
		let login = try req.content.decode(Credentials.self)
		let user = try await User.query(on: req.db)
			.filter(\.$username == login.username)
			.first()

		if let user = user, user.verifyPassword(pwd: login.password) {
			req.auth.login(user)
			try await user.$groups.load(on: req.db)
			try await user.$defaultGroup.load(on: req.db)
			return ProfileController.GetProfile(from: user)
		}

		throw Abort(.unauthorized)
	}

	func getCurrentUser(req: Request) async throws -> ProfileController.GetProfile {
		do {
			let user = try await getUser(fromRequest: req)
			try await user.$groups.load(on: req.db)
			try await user.$defaultGroup.load(on: req.db)
			return ProfileController.GetProfile(from: user)
		} catch is NotIdentifiedError {
			throw Abort(.notFound)
		}
	}

	func logout(req: Request) async throws -> Bool {
		req.auth.logout(User.self)
		return true
	}
}
