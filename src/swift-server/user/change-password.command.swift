import Fluent
import Vapor

struct ChangePasswordCommand: AsyncCommand {
	struct Signature: CommandSignature {
		@Argument(name: "username")
		var username: String
	}

	var help: String {
		"Change the password of the selected user"
	}

	func run(using context: CommandContext, signature: Signature) async throws {
		let username = signature.username
		context.console.print("Enter new password:")
		let newPassword = context.console.input(isSecure: true)
		let user = try await User.query(on: context.application.db).filter(
			\.$username == username
		).first()
		guard let user else {
			context.console.error("User not found: \(username)")
			return
		}

		try user.setPassword(pwd: newPassword)
		try await user.save(on: context.application.db)

		context.console.print("Password changed correctly")
	}
}
