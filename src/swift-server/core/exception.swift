final class Exception: Error, CustomStringConvertible {

	let errorCode: ErrorCode
	let context: [String: any Sendable]
	var allContext: [String: any Sendable] {
		var context: [String: any Sendable] = [:]
		if let cause = cause as? Exception {
			for (key, value) in cause.allContext {
				context[key] = value
			}
		}
		for (key, value) in self.context {
			context[key] = value
		}
		return context
	}
	let file: String
	let line: UInt
	let function: String
	let cause: Error?

	init(
		_ errorCode: ErrorCode, context: [String: any Sendable] = [:], cause: Error? = nil,
		file: String = #file,
		line: UInt = #line,
		function: String = #function
	) {
		self.errorCode = errorCode
		self.context = context
		self.file = file
		self.line = line
		self.cause = cause
		self.function = function
	}

	var localizedDescription: String {
		return "\(errorCode.rawValue): \(errorCode.message) at \(file):\(line)"
	}

	func toJSON() -> [String: Any] {
		var dict: [String: Any] = [
			"errorCode": errorCode.rawValue,
			"message": errorCode.message,
			"context": context,
			"file": file,
			"line": line,
		]
		if let cause = cause {
			dict["cause"] = cause
		}

		return dict
	}

	var description: String {
		self.localizedDescription
	}
}
