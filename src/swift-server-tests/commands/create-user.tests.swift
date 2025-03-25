import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Create User Tests")
final class CreateUserTests {
	@Test("Create the user")
	func testCreateUserCommand() async throws {
		try await withApp { app in
			let _ = try await createGroupsAndUsers(app: app)
			let command = CreateUserCommand()
			let arguments = ["create_user"]

			let console = TestConsole()
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

			#expect(output[0].contains("User \"demo\" created with groupId: "))
			let users = try await User.query(on: app.db).filter(\.$username == "demo")
				.all()

			#expect(users.count == 1)
			let user = users.first!
			let groups = try await user.$groups.get(on: app.db)
			#expect(groups.count == 1)
			#expect(!user.isAdmin)
		}
	}

	@Test("Create an admin user")
	func testCreateAdminUserCommand() async throws {
		try await withApp { app in

			let command = CreateUserCommand()
			let arguments = [
				"create_user", "--username", "custom-admin", "--admin",
				"--if-not-exists",
			]

			let console = TestConsole()
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

			#expect(output[0].contains("User \"custom-admin\" created with groupId: "))
			let users = try await User.query(on: app.db).filter(
				\.$username == "custom-admin"
			)
			.all()

			#expect(users.count == 1)
			let user = users.first!
			let groups = try await user.$groups.get(on: app.db)
			#expect(groups.count == 1)
			#expect(user.isAdmin)
		}
	}
}
