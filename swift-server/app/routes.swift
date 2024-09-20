import Fluent
import GraphQLKit
import GraphiQLVapor
import Vapor
import VaporToOpenAPI

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
					return .init(
                        status: .notFound, body: .init(string: "Not found!"))
				default:
					throw error
				}
            case let exception as Exception:
                print(exception.toJSON())
                throw error
			default:
				throw error
			}
		}
	}
}

enum ExpectedRequestError: Error {
    case notFound
    
}

let apiInfo = InfoObject(
	title: "Mr Scrooge API",
	description: "",
	version: "3.0.0"
)

func routes(_ app: Application) throws {

	app.middleware.use(ErrorHandlerMiddleware())
	app.middleware.use(SessionsMiddleware(session: app.sessions.driver))
	app.middleware.use(UserSessionAuthenticator())

	let mrScroogeSchema = try Schema.create(from: [
		SessionTypes.Schema(), BaseSchema(), BankTransactionTypes.Schema(),
		GraphTypes.Schema(), LabelTypes.Schema(),
	])

	// Register the schema and its resolver.
	app.register(
		graphQLSchema: mrScroogeSchema, withResolver: MrScroogeResolver())

	// Enable GraphiQL web page to send queries to the GraphQL endpoint
	if !app.environment.isRelease {
		app.enableGraphiQL(on: "graphiql")

	}

	let router = app.grouped("api")
	// generate OpenAPI documentation
	app.get("Swagger", "swagger.json") { req in
		let data = req.application.routes.openAPI(
			info: apiInfo
		)
		print(data)
		return data
	}
	.excludeFromOpenAPI()

	try router.register(collection: ImporterController())
	try router.register(collection: SessionController())
	try app.register(collection: ReactController())

	if !app.environment.isRelease {
		let swagger = app.routes.openAPI(info: apiInfo)
		FileManager().createFile(
			atPath: "swagger.json", contents: try JSONEncoder().encode(swagger))
	}
}
