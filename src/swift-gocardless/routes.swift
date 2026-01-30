import Vapor

func routes(_ app: Application) throws {
	// Home routes
	try app.register(collection: HomeController())

	// User routes
	try app.register(collection: UserController())

	// Bank routes
	try app.register(collection: BankController())
}
