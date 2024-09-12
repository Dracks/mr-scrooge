import Fluent
import GraphQLKit
import GraphiQLVapor
import Vapor

struct ErrorHandlerMiddleware: AsyncMiddleware {
	func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response
	{
		do {
			return try await next.respond(to: request)
		} catch {
			switch error {
			case let abort as AbortError:
				switch abort.status {
				case .notFound:
					return notFoundResponse(req: request)
				default:
					throw error
				}
			default:
				throw error
			}
		}
	}
}

func routes(_ app: Application) throws {

	app.middleware.use(ErrorHandlerMiddleware())
	app.middleware.use(SessionsMiddleware(session: app.sessions.driver))
	app.middleware.use(UserSessionAuthenticator())

	let mrScroogeSchema = try Schema.create(from: [
		SessionTypes.Schema(), BaseSchema(), BankTransactionTypes.Schema(),
		GraphTypes.Schema(), ImporterTypes.Schema(), LabelTypes.Schema(),
	])

	// Register the schema and its resolver.
	app.register(
		graphQLSchema: mrScroogeSchema, withResolver: MrScroogeResolver())

	// Enable GraphiQL web page to send queries to the GraphQL endpoint
	if !app.environment.isRelease {
		app.enableGraphiQL(on: "graphiql")
	}

	try app.register(collection: ImporterController())
	try app.register(collection: ReactController())
}
