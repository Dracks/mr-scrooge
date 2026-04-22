import Fluent
import Vapor

struct SessionAuthenticator: AsyncSessionAuthenticator {
	typealias User = GoCardlessImporter.User

	func authenticate(sessionID: UUID, for request: Request) async throws {
		request.logger.warning("Authenticating the user \(sessionID)")
		guard let user = try await User.find(sessionID, on: request.db) else {
			request.logger.warning("Authenticating the user not valid")
			return
		}

		request.auth.login(user)
	}
}