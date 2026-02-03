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

	@Parent(key: "user_id")
	var user: User

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
		accessToken: String,
		refreshToken: String? = nil,
		clientId: UUID,
		userId: UUID,
		scopes: [Scope],
		expiresAt: Date
	) {
		self.id = id
		self.accessToken = accessToken
		self.refreshToken = refreshToken
		self.$app.id = clientId
		self.$user.id = userId
		self._scopes = scopes.map { $0.rawValue }
		self.expiresAt = expiresAt
	}

	init(
		_ user: UUID, _ token: String, refresh: String? = nil, for app: OAuthApp,
		expires: Date
	) throws {
		accessToken = token
		refreshToken = refresh
		$user.id = user
		self.$app.id = try app.requireID()
		_scopes = app._scopes
		expiresAt = expires
	}

	init(
		_ authCode: OAuthAuthorizationCode, token: String, refresh: String? = nil,
		expires: Date
	) {
		self.accessToken = token
		self.refreshToken = refresh
		self.$user.id = authCode.$user.id
		self.$app.id = authCode.$app.id
		_scopes = authCode._scopes
		expiresAt = expires
	}
}
