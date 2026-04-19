import Exceptions
import Fluent
import Foundation
import Vapor

final class OAuthClientService: ServiceWithDb, @unchecked Sendable {

	// MARK: - Client Registration
	// Register a new OAuth client
	func registerClient(
		name: String,
		description: String?,
		redirectUris: [String],
		scopes: [Scope]
	) async throws -> Components.Schemas.OAuthClientWithSecret {
		// Generate unique client ID and secret
		let clientId = UUID()

		// Base64URL encode the bytes for safe transport/storage
		let clientSecret = OAuthCrypto.generateBase64URLRandom()

		let oauthApp = try OAuthApp(
			clientId: clientId,
			name: name,
			description: description,  // Description is optional for now
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

	// MARK: - Client Listing

	// List OAuth clients with pagination
	func listClients(pageQuery: PageQuery) async throws -> ListWithCursor<OAuthApp> {
		var query = OAuthApp.query(on: db)

		// Apply cursor if provided
		if let cursor = pageQuery.cursor, let cursorId = UUID(uuidString: cursor) {
			query = query.filter(\.$id > cursorId)
		}

		// Order by ID for consistent pagination
		query = query.sort(\.$id, .ascending)

		// Limit results
		let clients = try await query.limit(pageQuery.limit + 1).all()

		// Check if there are more results
		let hasMore = clients.count > pageQuery.limit
		let resultClients = hasMore ? Array(clients.dropLast()) : clients

		// Determine next cursor
		var next: String?
		if hasMore, let lastClient = resultClients.last {
			next = try lastClient.requireID().uuidString
		}

		return ListWithCursor(list: resultClients, next: next)
	}
}
