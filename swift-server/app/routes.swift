import Fluent
import Vapor
import GraphQLKit
import GraphiQLVapor

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

struct GqlErrorHandlerMiddleware: AsyncMiddleware {
    func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response
    {
        do {
            return try await next.respond(to: request)
        } catch let error as NotIdentifiedError {
            print(error)
            return try await GraphQLResult(errors: [GraphQLError(error)]).encodeResponse(for: request)
        } catch {
            print(error)
            throw error
        }
    }
}

func routes(_ app: Application) throws {

	app.middleware.use(ErrorHandlerMiddleware())
	app.middleware.use(SessionsMiddleware(session: app.sessions.driver))
	app.middleware.use(UserSessionAuthenticator())

    let mrScroogeSchema = try Schema.create(from: [SessionTypes.Schema(), BaseSchema(), BankTransactionTypes.Schema(), GraphTypes.Schema(), ImporterTypes.Schema()])
    
    print(mrScroogeSchema.schema)

	// Register the schema and its resolver.
    app.grouped(UserSessionAuthenticator()).register(graphQLSchema: mrScroogeSchema, withResolver: MrScroogeResolver())

    // Enable GraphiQL web page to send queries to the GraphQL endpoint
    if !app.environment.isRelease {
        app.enableGraphiQL(on: "graphiql")
    }

	try app.register(collection: ReactController())
}
