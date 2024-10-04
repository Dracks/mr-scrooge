import Fluent
import Vapor

struct CreateUserCommand: Command {
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

	func run(using context: CommandContext, signature: Signature) throws {
		let groupName = signature.groupName ?? "default group"

		let group =
			try UserGroup.query(on: context.application.db)
			.filter(\.$name == groupName)
			.first().wait() ?? UserGroup(name: groupName)

		if group.id == nil {
			try group.save(on: context.application.db).wait()
		}
		let username = signature.user ?? "demo"
		let password = signature.password ?? "demo"

		let user = try User(
			username: username, isAdmin: signature.isAdmin,
			defaultGroupId: group.requireID())
		try user.setPassword(pwd: password)
		try user.save(on: context.application.db).wait()
		try user.$groups.attach(group, on: context.application.db).wait()
		try user.save(on: context.application.db).wait()
	}
}
