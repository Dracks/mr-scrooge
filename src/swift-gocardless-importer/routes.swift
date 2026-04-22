import Vapor

func routes(_ app: Application) throws {
	app.middleware.use(GocardlessErrorMiddleware())
	app.middleware.use(app.sessions.middleware)
	app.middleware.use(SessionAuthenticator())
	try app.register(collection: GocardlessAuthController())

}