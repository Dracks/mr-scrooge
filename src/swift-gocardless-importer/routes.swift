import Vapor

func routes(_ app: Application) throws {
	app.middleware.use(ErrorMiddleware.default(environment: app.environment))
	app.middleware.use(app.sessions.middleware)
	app.middleware.use(UserSessionAuthenticator())
	try app.register(collection: GocardlessAuthController())

}
