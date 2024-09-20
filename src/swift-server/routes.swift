import Dependencies
import Fluent
import OpenAPIRuntime
import OpenAPIVapor
import Vapor

struct ErrorHandlerMiddleware: AsyncMiddleware {
	func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response
	{
		do {
			return try await next.respond(to: request)
		} catch {
			switch error {
			case let exception as Exception:
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
				print(error.underlyingError)
				print(type(of: error.underlyingError))
				throw error
			default:
				print(error)
				print(type(of: error))
				throw error
			}
		}
	}
}

struct MrScroogeAPIImpl {
	@Dependency(\.request) var request

	func ApiProfile_update(_ input: Operations.ApiProfile_update.Input) async throws
		-> Operations.ApiProfile_update.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiProfile_get(_ input: Operations.ApiProfile_get.Input) async throws
		-> Operations.ApiProfile_get.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiLabels_create(_ input: Operations.ApiLabels_create.Input) async throws
		-> Operations.ApiLabels_create.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiLabels_list(_ input: Operations.ApiLabels_list.Input) async throws
		-> Operations.ApiLabels_list.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiGraphs_delete(_ input: Operations.ApiGraphs_delete.Input) async throws
		-> Operations.ApiGraphs_delete.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiGraphs_update(_ input: Operations.ApiGraphs_update.Input) async throws
		-> Operations.ApiGraphs_update.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiGraphs_new(_ input: Operations.ApiGraphs_new.Input) async throws
		-> Operations.ApiGraphs_new.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiGraphs_list(_ input: Operations.ApiGraphs_list.Input) async throws
		-> Operations.ApiGraphs_list.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiProfile_deleteGroup(_ input: Operations.ApiProfile_deleteGroup.Input) async throws
		-> Operations.ApiProfile_deleteGroup.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiProfile_addGroup(_ input: Operations.ApiProfile_addGroup.Input) async throws
		-> Operations.ApiProfile_addGroup.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiProfile_delete(_ input: Operations.ApiProfile_delete.Input) async throws
		-> Operations.ApiProfile_delete.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiProfile_create(_ input: Operations.ApiProfile_create.Input) async throws
		-> Operations.ApiProfile_create.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiGroup_delete(_ input: Operations.ApiGroup_delete.Input) async throws
		-> Operations.ApiGroup_delete.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiGroup_listOrphaned(_ input: Operations.ApiGroup_listOrphaned.Input) async throws
		-> Operations.ApiGroup_listOrphaned.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiGroup_create(_ input: Operations.ApiGroup_create.Input) async throws
		-> Operations.ApiGroup_create.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiGroup_list(_ input: Operations.ApiGroup_list.Input) async throws
		-> Operations.ApiGroup_list.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}
}

extension MrScroogeAPIImpl: APIProtocol {
    
}

func routes(_ app: Application) throws {

	app.middleware.use(ErrorHandlerMiddleware())
	app.middleware.use(SessionsMiddleware(session: app.sessions.driver))
	app.middleware.use(UserSessionAuthenticator())

	let requestInjectionMiddleware = OpenAPIRequestInjectionMiddleware()

	let transport = VaporTransport(routesBuilder: app.grouped(requestInjectionMiddleware))

	// Create an instance of your handler type that conforms the generated protocol
	// defininig your service API.
	let handler = MrScroogeAPIImpl()

	// Call the generated function on your implementation to add its request
	// handlers to the app.
	try handler.registerHandlers(on: transport, serverURL: Servers.server1())

	try app.register(collection: ReactController())
}