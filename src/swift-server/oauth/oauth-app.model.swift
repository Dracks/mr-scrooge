import Exceptions
import Fluent
import Foundation
import Vapor

enum Scope: String, Codable, CaseIterable {
	case user = "User"
    case importFile = "ImportFile"
}

final class OAuthApp: Model, Content, @unchecked Sendable {
	static let schema = "oauth_apps"

	@ID(custom: "client_id")
	var id: UUID?

	var clientId: UUID {
		get {
			guard let id = id else {
				preconditionFailure("clientId accessed before persistence")
			}
			return id
		}
		set {
			id = newValue
		}
	}

	@Field(key: "name")
	var name: String

	@Field(key: "description")
	var description: String?

	@Field(key: "client_secret_hash")
	var clientSecretHash: String

	@Field(key: "redirect_uris")
	var redirectUris: [String]

	@Field(key: "scopes")
	var _scopes: [String]

	var scopes: [Scope?] {
		_scopes.map {
			Scope.init(rawValue: $0)
		}
	}

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(
		clientId: UUID, name: String, description: String? = nil, clientSecret: String,
		redirectUris: [String] = [], scopes: [Scope] = []
	) throws {
		self.id = clientId
		self.name = name
		self.description = description
		try self.setClientSecret(secret: clientSecret)
		self.redirectUris = redirectUris
		self._scopes = scopes.map { $0.rawValue }
	}

	func setClientSecret(secret: String) throws {
		self.clientSecretHash = try Bcrypt.hash(secret)
	}

	func verifyClientSecret(secret: String) -> Bool {
		do {
			return try Bcrypt.verify(secret, created: self.clientSecretHash)
		} catch {
			return false
		}
	}
}
