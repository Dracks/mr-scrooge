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
		let groupName = signature.groupName ?? "default group"

		let group = try await
			UserGroup.query(on: context.application.db)
			.filter(\.$name == groupName)
			.first() ?? UserGroup(name: groupName)

		if group.id == nil {
			try await group.save(on: context.application.db)
		}
		let username = signature.user ?? "demo"
		let password = signature.password ?? "demo"

		let user = try User(
			username: username, isAdmin: signature.isAdmin,
			defaultGroupId: group.requireID())
		try user.setPassword(pwd: password)
		try await user.save(on: context.application.db)
		try await user.$groups.attach(group, on: context.application.db)
		print("User created with group \(group.id)")

		// When not executed, the group attach seems to not work
		let _ = try await User.query(on: context.application.db).first()
	}
}
