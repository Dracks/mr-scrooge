import Vapor

public protocol AsyncCommand: Command {

	func asyncRun(
		using context: CommandContext,
		signature: Signature
	) async throws
}

extension AsyncCommand {

	public func run(
		using context: CommandContext,
		signature: Signature
	) throws {
		let promise = context
			.application
			.eventLoopGroup
			.next()
			.makePromise(of: Void.self)

		promise.completeWithTask {
			try await asyncRun(
				using: context,
				signature: signature
			)
		}
		try promise.futureResult.wait()
	}
}

final class TestConsole: Console, @unchecked Sendable {

	var testInputQueue: [String]
	var testOutputQueue: [String]
	var userInfo: [AnySendableHashable: any Sendable]

	init(input: [String] = []) {
		self.testInputQueue = input
		self.testOutputQueue = []
		self.userInfo = [:]
	}

	func input(isSecure: Bool) -> String {
		testInputQueue.popLast() ?? ""
	}

	func output(_ text: ConsoleText, newLine: Bool) {
		let line = text.description + (newLine ? "\n" : "")
		testOutputQueue.insert(line, at: 0)
	}

	func report(error: String, newLine: Bool) {
		//
	}

	func clear(_ type: ConsoleClear) {
		//
	}

	var size: (width: Int, height: Int) {
		(0, 0)
	}
}
