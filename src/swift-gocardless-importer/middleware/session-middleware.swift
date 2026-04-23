import Fluent
import Vapor

struct SessionAuthenticator: AsyncSessionAuthenticator {
	typealias User = GoCardlessImporter.User

	func authenticate(sessionID: UUID, for request: Request) async throws {
		guard let user = try await User.find(sessionID, on: request.db) else {
			return
		}

		request.auth.login(user)
	}
}

func getUser(fromRequest req: Request) -> User?{
    return req.auth.get(User.self)
    
}