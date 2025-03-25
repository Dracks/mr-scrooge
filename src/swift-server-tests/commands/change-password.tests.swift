import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Change Password Tests")
class ChangePasswordTests {

	@Test("Setting the password")
	func changePassword() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let command = ChangePasswordCommand()
			let user = testData.user
			let arguments = ["change_password", user.username]

			let console = TestConsole(input: ["new-password"])
			let input = CommandInput(arguments: arguments)
			var context = CommandContext(
				console: console,
				input: input
			)
			context.application = app

			try await console.run(command, with: context)
			let output = console
				.testOutputQueue
				.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }

			#expect(output.contains("Password changed correctly"))

			let reloadedUser = try await User.query(on: app.db)
				.filter(\.$username == user.username)
				.first()

			guard let reloadedUser else {
				Issue.record("User should be found")
				return
			}
			#expect(reloadedUser.verifyPassword(pwd: "new-password"))

		}
	}
}
