import Dependencies
import Fluent
import OpenAPIRuntime
import OpenAPIVapor
import Vapor
import Exceptions

struct ErrorHandlerMiddleware: AsyncMiddleware {
	func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response
	{
		do {
			return try await next.respond(to: request)
		} catch {
			switch error {
			case let exception as Exception<ErrorCodes>:
				print(exception.toJSON())
				throw error
			case let error as ServerError:
				if let decodingError = error.underlyingError as? DecodingError {
					throw Abort(
						.badRequest,
						reason: String(describing: decodingError))
				}
				if let abort = error.underlyingError as? Abort {
					throw abort
				}
				if let _ = error.underlyingError as? NotIdentifiedError {
					throw Abort(.unauthorized, reason: "Not identified")
				}
				print("Server Error")
				print(String(reflecting: error.underlyingError))
				print(type(of: error.underlyingError))
				throw error
			default:
				print("Default error")
				print(error)
				print(type(of: error))
				throw error
			}
		}
	}
}

struct MrScroogeAPIImpl {
	@Dependency(\.request) var request

	func ApiImports_rollbackImport(_ input: Operations.ApiImports_rollbackImport.Input)
		async throws -> Operations.ApiImports_rollbackImport.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiImports_applyRow(_ input: Operations.ApiImports_applyRow.Input) async throws
		-> Operations.ApiImports_applyRow.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	// MARK: - OAuth Methods

	func ApiOAuth_authorize(_ input: Operations.ApiOAuth_authorize.Input) async throws
		-> Operations.ApiOAuth_authorize.Output
	{
		// TODO: Implement OAuth authorization flow
		// This should handle the OAuth authorization request and return either:
		// - A redirect to the authorization page
		// - An authorization code if auto-approval is enabled
		// - An error response

		// For now, return a placeholder response
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiOAuth_registerClient(_ input: Operations.ApiOAuth_registerClient.Input) async throws
		-> Operations.ApiOAuth_registerClient.Output
	{
		// TODO: Implement OAuth client registration
		// This should register a new OAuth client in the database
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiOAuth_getClient(_ input: Operations.ApiOAuth_getClient.Input) async throws
		-> Operations.ApiOAuth_getClient.Output
	{
		// TODO: Implement getting OAuth client details
		// This should retrieve an existing OAuth client from the database
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiOAuth_deleteClient(_ input: Operations.ApiOAuth_deleteClient.Input) async throws
		-> Operations.ApiOAuth_deleteClient.Output
	{
		// TODO: Implement deleting an OAuth client
		// This should remove an OAuth client from the database
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiOAuth_token(_ input: Operations.ApiOAuth_token.Input) async throws
		-> Operations.ApiOAuth_token.Output
	{
		// TODO: Implement OAuth token exchange
		// This should handle exchanging authorization codes for access tokens
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}
}

extension MrScroogeAPIImpl: APIProtocol {}

func routes(_ app: Application) throws {

	app.middleware.use(ErrorHandlerMiddleware())
	app.middleware.use(SessionsMiddleware(session: app.sessions.driver))
	app.middleware.use(UserSessionAuthenticator())

	app.routes.defaultMaxBodySize = 5_000_000

	let requestInjectionMiddleware = OpenAPIRequestInjectionMiddleware()

	let transport = VaporTransport(routesBuilder: app.grouped(requestInjectionMiddleware))

	// Create an instance of your handler type that conforms the generated protocol
	// defininig your service API.
	let handler = MrScroogeAPIImpl()

	// Call the generated function on your implementation to add its request
	// handlers to the app.
	try handler.registerHandlers(on: transport, serverURL: Servers.Server1.url())

	try app.register(collection: ImportUpload())

	try app.register(collection: ReactController())

}
