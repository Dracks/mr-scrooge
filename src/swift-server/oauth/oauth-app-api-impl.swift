import Exceptions
import Fluent
import Foundation
import OpenAPIRuntime
import OpenAPIVapor
import Vapor
import swift_macros

// MARK: - OAuth Routes

extension MrScroogeAPIImpl {

	func ApiOAuth_registerClient(_ input: Operations.ApiOAuth_registerClient.Input) async throws
		-> Operations.ApiOAuth_registerClient.Output
	{
		// Verify user is admin
		let user = try await getUser(fromRequest: request)
		guard user.isAdmin else {
			return #GenericErrorReturn(
				response: "unauthorized",
				msg: "Only admin users can create OAuth clients",
				code: ApiError.API10058)
		}

		// Extract client data from the input body
		let clientData: Operations.ApiOAuth_registerClient.Input.Body.jsonPayload

		switch input.body {
		case .json(let data):
			clientData = data
		}
		for uri in clientData.redirect_uris {
			guard
				let url = URL(string: uri),
				let scheme = url.scheme?.lowercased(),
				scheme == "https"
					|| (scheme == "http"
						&& (url.host == "localhost"
							|| url.host == "127.0.0.1")),
				url.fragment == nil
			else {
				return #GenericErrorReturn(
					response: "badRequest",
					msg: "Invalid redirect uris",
					code: ApiError.API10075)
			}
		}

		// Use the service to register the client
		let clientResponse = try await request.application.oauthClientService
			.registerClient(
				name: clientData.name,
				description: clientData.description,
				redirectUris: clientData.redirect_uris,
				scopes: clientData.scopes.map { $0.toInternal() }
			)

		return .created(.init(body: .json(clientResponse)))

	}

	func ApiOAuth_getClient(_ input: Operations.ApiOAuth_getClient.Input) async throws
		-> Operations.ApiOAuth_getClient.Output
	{
		let user = try await getUser(fromRequest: request)
		guard user.isAdmin else {
			return #GenericErrorReturn(
				response: "unauthorized",
				msg: "Only admin users can list OAuth clients",
				code: ApiError.API10074)
		}

		// Use the service to get the client
		guard let clientId = UUID(uuidString: input.path.clientId) else {
			return #GenericErrorReturn(
				response: "badRequest", msg: "Client app is not valid",
				code: ApiError.API10072)
		}

		let result = try await request.application.oauthClientService.getClient(
			clientId: clientId
		)

		switch result {
		case .success(let clientResponse):
			return .ok(.init(body: .json(clientResponse)))
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Client app is not valid",
							code: ApiError.API10059.rawValue
						))))
		}
	}

	func ApiOAuth_deleteClient(_ input: Operations.ApiOAuth_deleteClient.Input) async throws
		-> Operations.ApiOAuth_deleteClient.Output
	{
		// Verify user is admin
		let user = try await getUser(fromRequest: request)
		guard user.isAdmin else {
			return #GenericErrorReturn(
				response: "unauthorized",
				msg: "Only admin users can delete OAuth clients",
				code: ApiError.API10060)
		}

		// Use the service to delete the client
		guard let clientId = UUID(uuidString: input.path.clientId) else {
			return #GenericErrorReturn(
				response: "badRequest", msg: "Client app is not valid",
				code: ApiError.API10072)
		}

		let result = try await request.application.oauthClientService.deleteClient(
			clientId: clientId
		)

		switch result {
		case .success:
			return .noContent
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Client app is not valid",
							code: ApiError.API10061.rawValue
						))))
		}
	}

	func ApiOAuth_listClients(_ input: Operations.ApiOAuth_listClients.Input) async throws
		-> Operations.ApiOAuth_listClients.Output
	{
		// Verify user is admin
		let user = try await getUser(fromRequest: request)
		guard user.isAdmin else {
			return .unauthorized(
				.init(
					body: .json(
						.init(
							message:
								"Only admin users can list OAuth clients",
							code: ApiError.API10073.rawValue
						))))
		}

		// Parse pagination parameters
		let cursor = input.query.cursor
		let limit = input.query.limit ?? 100

		// Use the service to list clients with pagination
		let result = try await request.application.oauthClientService
			.listClients(
				pageQuery: .init(limit: Int(limit), cursor: cursor)
			)

		// Convert the result to the API response format
		let clients = try result.list.map { try Components.Schemas.OAuthClient($0) }

		return .ok(
			.init(
				body: .json(
					.init(
						results: clients,
						next: result.next
					))))
	}
}

extension Components.Schemas.OAuthClientWithSecret {
	init(_ client: OAuthApp, with secret: String) throws {
		client_id = try client.requireID().uuidString
		name = client.name
		description = client.description
		self.secret = secret
		redirect_uris = client.redirectUris
		scopes = try client.scopes.map { scope in
			guard let scope else {
				throw Exception(
					ErrorCodes.E10033,
					context: [
						"client_id": try client.requireID().uuidString
					])
			}
			return scope.toApi()
		}
		created_at = client.createdAt ?? Date()
		updated_at = client.updatedAt ?? Date()
	}
}

extension Components.Schemas.OAuthClient {
	init(_ oauthApp: OAuthApp) throws {
		client_id = try oauthApp.requireID().uuidString
		name = oauthApp.name
		description = oauthApp.description
		redirect_uris = oauthApp.redirectUris
		scopes = try oauthApp.scopes.map { scope in
			guard let scope else {
				throw Exception(
					ErrorCodes.E10033,
					context: [
						"client_id": try oauthApp.requireID().uuidString
					])
			}
			return scope.toApi()
		}
		created_at = oauthApp.createdAt ?? Date()
		updated_at = oauthApp.updatedAt ?? Date()
	}

}
