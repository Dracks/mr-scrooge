import Fluent
import Vapor

struct CreateUserCommand: AsyncCommand {
	struct Signature: CommandSignature {
		@Option(name: "username", short: "u")
		var user: String?

		@Option(name: "password", short: "p")
		var password: String?

		@Option(name: "email", short: "e")
		var email: String?

		@Flag(name: "admin")
		var isAdmin: Bool

		@Option(name: "groupname", short: "g")
		var groupName: String?

		@Flag(
			name: "if-not-exists",
			help: "Checks if current user exists before try to create it")
		var ifNotExists: Bool
	}

	var help: String {
		"Creates a user in the database"
	}

	func run(using context: CommandContext, signature: Signature) async throws {
		let username = signature.user ?? "demo"
		let password = signature.password ?? "demo"
		let email = signature.email ?? ""
		let groupName = signature.groupName ?? "default group for \(username)"

		if signature.ifNotExists {
			let data = try await context.application.userService.getUsersPage(
				filter: .init(username: username))
			if !data.list.isEmpty {
				context.console.print("User \"\(username)\" already exists")
				return
			}
		}
		let (_, group) = try await context.application.userService.create(
			user: .init(
				username: username,
				password: password,
				email: email,
				isActive: true,
				isAdmin: signature.isAdmin
			), groupName: groupName)

		context.console.print("User \"\(username)\" created with groupId: \(group.id!)")

		// When not executed, the group attach seems to not work
		let _ = try await User.query(on: context.application.db).first()
	}
}
