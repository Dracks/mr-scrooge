import Exceptions
import Fluent
import Foundation
import Vapor

final class OAuthAccessToken: Model, Content, @unchecked Sendable {
	static let schema = "oauth_access_tokens"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "access_token")
	var accessToken: String

	@Field(key: "refresh_token")
	var refreshToken: String?

	@Parent(key: "client_id")
	var app: OAuthApp

	@OptionalParent(key: "user_id")
	var user: User?

	@Field(key: "scopes")
	var _scopes: [String]

	var scopes: [Scope?] {
		_scopes.map {
			Scope.init(rawValue: $0)
		}
	}

	@Field(key: "expires_at")
	var expiresAt: Date

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(
		id: UUID? = nil,
		clientId: UUID,
		userId: UUID,
		scopes: [Scope],
		expiresAt: Date
	) {
		self.id = id
		self.accessToken = ""
		self.refreshToken = nil
		self.$app.id = clientId
		self.$user.id = userId
		self._scopes = scopes.map { $0.rawValue }
		self.expiresAt = expiresAt
		self.newAccessTokens()
	}

	init(
		_ user: UUID?, for app: OAuthApp,
		expires: Date
	) throws {
		self.accessToken = ""
		self.refreshToken = nil
		$user.id = user
		self.$app.id = try app.requireID()
		_scopes = app._scopes
		expiresAt = expires
		self.newAccessTokens()
	}

	init(
		_ authCode: OAuthAuthorizationCode,
		expires: Date
	) {
		self.accessToken = ""
		self.refreshToken = nil
		self.$user.id = authCode.$user.id
		self.$app.id = authCode.$app.id
		_scopes = authCode._scopes
		expiresAt = expires
		self.newAccessTokens()
	}

	func newAccessTokens() {
		accessToken = OAuthCrypto.generateBase64URLRandom(length: 32)
		refreshToken = OAuthCrypto.generateBase64URLRandom(length: 32)
	}
}

extension OAuthAccessToken {
	static func get(token: String, on db: any Database) async throws -> OAuthAccessToken? {
		return try await OAuthAccessToken.query(on: db).filter(\.$accessToken == token)
			.first()
	}
}

extension OAuthAccessToken: Authenticatable {
	typealias SessionID = String
	var sessionID: SessionID {
		self.accessToken
	}
}
