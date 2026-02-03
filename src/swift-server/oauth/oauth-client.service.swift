import Exceptions
import Fluent
import Foundation
import Vapor

// MARK: - OAuth Client Service

struct OAuthClientServiceNewUser {
	var username: String
	var password: String
	var email: String
	var firstName: String?
	var lastName: String?
	var isActive: Bool
	var isAdmin: Bool
}

final class OAuthClientService: ServiceWithDb, @unchecked Sendable {

	// MARK: - Client Registration
	// Register a new OAuth client
	func registerClient(
		name: String,
		redirectUris: [String],
		scopes: [Scope]
	) async throws -> Components.Schemas.OAuthClientWithSecret {
		// Generate unique client ID and secret
		let clientId = UUID()
		let clientSecret = UUID().uuidString  // In production, use a more secure method

		let oauthApp = try OAuthApp(
			clientId: clientId,
			name: name,
			description: nil,  // Description is optional for now
			clientSecret: clientSecret,
			redirectUris: redirectUris,
			scopes: scopes
		)

		try await oauthApp.save(on: db)

		return try .init(oauthApp, with: clientSecret)
	}

	// MARK: - Client Retrieval

	enum GetClientResult {
		case success(Components.Schemas.OAuthClient)
		case notFound
	}

	// Get an OAuth client by ID
	func getClient(clientId: UUID) async throws -> GetClientResult {
		guard let oauthApp = try await OAuthApp.find(clientId, on: db) else {
			return .notFound
		}

		return .success(try .init(oauthApp))
	}

	// MARK: - Client Deletion

	enum DeleteClientResult {
		case success
		case notFound
	}

	// Delete an OAuth client by ID
	func deleteClient(clientId: UUID) async throws -> DeleteClientResult {
		guard let oauthApp = try await OAuthApp.find(clientId, on: db) else {
			return .notFound
		}

		try await oauthApp.delete(on: db)

		return .success
	}
}
