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

	func ApiRule_list(_ input: Operations.ApiRule_list.Input) async throws
		-> Operations.ApiRule_list.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiRule_update(_ input: Operations.ApiRule_update.Input) async throws
		-> Operations.ApiRule_update.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiRule_create(_ input: Operations.ApiRule_create.Input) async throws
		-> Operations.ApiRule_create.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiRule_delete(_ input: Operations.ApiRule_delete.Input) async throws
		-> Operations.ApiRule_delete.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiRule_apply(_ input: Operations.ApiRule_apply.Input) async throws
		-> Operations.ApiRule_apply.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiRule_addCondition(_ input: Operations.ApiRule_addCondition.Input) async throws
		-> Operations.ApiRule_addCondition.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiRule_updateCondition(_ input: Operations.ApiRule_updateCondition.Input) async throws
		-> Operations.ApiRule_updateCondition.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiRule_deleteCondition(_ input: Operations.ApiRule_deleteCondition.Input) async throws
		-> Operations.ApiRule_deleteCondition.Output
	{
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
