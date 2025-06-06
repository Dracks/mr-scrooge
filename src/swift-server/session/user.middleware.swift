import Vapor

struct AdminMiddleware: AsyncMiddleware {
	func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response
	{
		guard let user = request.auth.get(User.self), user.isAdmin else {
			throw Abort(.forbidden)
		}
		return try await next.respond(to: request)
	}
}

struct UserIdentifiedMiddleware: AsyncMiddleware {

	func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response
	{
		guard request.auth.get(User.self) != nil else {
			throw Abort(.unauthorized)
		}
		return try await next.respond(to: request)
	}
}
