import Vapor

struct UserSessionAuthenticator: AsyncSessionAuthenticator {

	typealias User = App.User
	func authenticate(sessionID: UUID, for request: Request) async throws {
		guard let user = try await User.find(sessionID, on: request.db) else {
			return
		}
		request.auth.login(user)
	}

}

class NotIdentifiedError: Error {}

func getUser(fromRequest req: Request) async throws -> User {
	guard let user = req.auth.get(User.self) else {
		throw NotIdentifiedError()
	}
	try await user.$groups.load(on: req.db)
	try await user.$defaultGroup.load(on: req.db)
	return user
}
