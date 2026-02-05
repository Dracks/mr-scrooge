import Exceptions
import Fluent
import Foundation
import Vapor

final class OAuthAuthorizationCode: Model, Content, @unchecked Sendable {
	static let schema = "oauth_authorization_codes"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "code")
	var code: String

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

	@Field(key: "redirect_uri")
	var redirectUri: String

	@Field(key: "expires_at")
	var expiresAt: Date

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(
		id: UUID? = nil,
		code: String,
		clientId: UUID,
		userId: UUID,
		scopes: [Scope],
		redirectUri: String,
		expiresAt: Date
	) {
		self.id = id
		self.code = code
		self.$app.id = clientId
		self.$user.id = userId
		self._scopes = scopes.map { $0.rawValue }
		self.redirectUri = redirectUri
		self.expiresAt = expiresAt
	}
}
