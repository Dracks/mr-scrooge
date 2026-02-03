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

		// Use the service to register the client
		let clientResponse = try await request.application.oauthClientService
			.registerClient(
				name: clientData.name,
				redirectUris: clientData.redirect_uris,
				scopes: clientData.scopes.map { $0.toInternal() }
			)

		return .created(.init(body: .json(.init(body: clientResponse))))

	}

	func ApiOAuth_getClient(_ input: Operations.ApiOAuth_getClient.Input) async throws
		-> Operations.ApiOAuth_getClient.Output
	{
		// Use the service to get the client
		let clientId = UUID(uuidString: input.path.clientId)!

		let result = try await request.application.oauthClientService.getClient(
			clientId: clientId
		)

		switch result {
		case .success(let clientResponse):
			return .ok(.init(body: .json(.init(body: clientResponse))))
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
		let clientId = UUID(uuidString: input.path.clientId)!

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
}

extension Components.Schemas.OAuthClientWithSecret {
	init(_ client: OAuthApp, with secret: String) throws {
		client_id = try client.requireID().uuidString
		name = client.name
		self.secret = secret
		redirect_uris = client.redirectUris
		scopes = try client.scopes.map { scope in
			guard let scope else {
				throw Exception(
					ErrorCodes.E10033,
					context: [
						"client_id": try client.requireID().uuid
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
		redirect_uris = oauthApp.redirectUris
		scopes = try oauthApp.scopes.map { scope in
			guard let scope else {
				throw Exception(
					ErrorCodes.E10033,
					context: [
						"client_id": try oauthApp.requireID().uuid
					])
			}
			return scope.toApi()
		}
		created_at = oauthApp.createdAt ?? Date()
		updated_at = oauthApp.updatedAt ?? Date()
	}

}
