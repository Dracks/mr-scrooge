import Fluent
import Vapor

struct CreateUserCommand: AsyncCommand {
	struct Signature: CommandSignature {
		@Option(name: "username", short: "u")
		var user: String?

		@Option(name: "password", short: "p")
		var password: String?

		@Flag(name: "admin")
		var isAdmin: Bool

		@Option(name: "groupname", short: "g")
		var groupName: String?
	}

	var help: String {
		"Creates a user in the database"
	}

	func run(using context: CommandContext, signature: Signature) async throws {
		let username = signature.user ?? "demo"
		let password = signature.password ?? "demo"
		let groupName = signature.groupName ?? "default group for \(username)"

		let (_, group) = try await context.application.userService.create(
			user: .init(
				username: username,
				password: password,
				email: "",
				isActive: true,
				isAdmin: signature.isAdmin
			), groupName: groupName)

		context.console.print("User \"\(username)\" created with groupId: \(group.id!)")

		// When not executed, the group attach seems to not work
		let _ = try await User.query(on: context.application.db).first()
	}
}
