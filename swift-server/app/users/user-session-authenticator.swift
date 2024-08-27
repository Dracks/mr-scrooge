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
