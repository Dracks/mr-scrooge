import Fluent
import Vapor

struct UserSessionAuthenticator: AsyncSessionAuthenticator {

	typealias User = MrScroogeServer.User
	func authenticate(sessionID: UUID, for request: Request) async throws {
		guard let user = try await User.find(sessionID, on: request.db) else {
			return
		}
		guard user.isActive else {
			throw NotIdentifiedError()
		}
		request.auth.login(user)
	}
}

struct OAuthAppAuthenticator: AsyncBearerAuthenticator {

	typealias User = MrScroogeServer.OAuthAccessToken
	func authenticate(bearer: BearerAuthorization, for request: Request) async throws {
		guard
			let oauth = try await OAuthAccessToken.get(
				token: bearer.token, on: request.db)
		else {
			return
		}
		guard oauth.expiresAt > Date() else {
			return
		}
		request.auth.login(oauth)
	}
}

final class NotIdentifiedError: Error {}

enum AuthenticationType {
	case OnlyWeb
	case WebAndOauth(scope: Scope, extras: [Scope] = [])
}

func getUser(fromRequest req: Request, authentication: AuthenticationType = .OnlyWeb) async throws
	-> User
{
	func getAuth() async throws -> User? {
		switch authentication {
		case .OnlyWeb:
			return nil
		case .WebAndOauth(let scope, let others):
			let scopes = [scope] + others

			guard let oauth = req.auth.get(OAuthAccessToken.self) else {
				return nil
			}
			let oauthScopes = Set(oauth.scopes.compacted())
			if scopes.allSatisfy({ oauthScopes.contains($0) }) {
				try await oauth.$user.load(on: req.db)
				return oauth.user
			}

		}
		return nil
	}
	var user = req.auth.get(User.self)
	if user == nil {
		user = try await getAuth()
	}
	guard let user else {
		throw NotIdentifiedError()
	}
	guard user.isActive else {
		throw NotIdentifiedError()
	}
	try await user.$groups.load(on: req.db)
	try await user.$defaultGroup.load(on: req.db)
	return user
}
