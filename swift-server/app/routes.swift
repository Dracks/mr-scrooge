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

func routes(_ app: Application) throws {

	app.middleware.use(ErrorHandlerMiddleware())
	app.middleware.use(SessionsMiddleware(session: app.sessions.driver))
	app.middleware.use(UserSessionAuthenticator())
    
    let mrScroogeSchema = try Schema.create(from: [SessionTypes.Schema(), BaseSchema(), BankTransactionTypes.Schema()])

	// Register the schema and its resolver.
    app.register(graphQLSchema: mrScroogeSchema, withResolver: MrScroogeResolver())

    // Enable GraphiQL web page to send queries to the GraphQL endpoint
    if !app.environment.isRelease {
        app.enableGraphiQL(on: "graphiql")
    }

	/*try app.register(collection: LoginController(app: app))
	try app.register(collection: ProfileController(app: app))
	try app.register(collection: AdminUsersController())
	try app.register(collection: LanguageController(app: app))
	try app.register(collection: RawImportsController(app: app))
	try app.register(collection: DeclinationTypeController())
	try app.register(collection: WordsManagementController())
	try app.register(collection: ExercisesController())

	app.get { req -> Document in
		return HomeTemplates(req: req).home()
	}*/
}
