import Foundation

public protocol ErrorMsg {
	var message: String { get }
}

final public class ErrorInfo: Sendable {
	let message: String
	let additionalInfo: String?

	public init(message: String, additionalInfo: String? = nil) {
		self.message = message
		self.additionalInfo = additionalInfo
	}
}

final public class Exception<ErrorCode: RawRepresentable & Sendable & ErrorMsg>: Error,
	CustomStringConvertible
{

	public let errorCode: ErrorCode
	public let context: [String: any Sendable]
	public var allContext: [String: any Sendable] {
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
	public let stackTrace: [String]
	public let file: String
	public let line: UInt
	public let function: String
	public let cause: Error?

	public init(
		_ errorCode: ErrorCode, context: [String: any Sendable] = [:], cause: Error? = nil,
		file: String = #file,
		line: UInt = #line,
		function: String = #function
	) {
		self.errorCode = errorCode
		self.context = context
		self.cause = cause
		self.file = file
		self.line = line
		self.function = function

		stackTrace = Thread.callStackSymbols
	}

	public var localizedDescription: String {
		let yamlContext = allContext.reduce(into: "") { result, pair in
			result += "\n  \(pair.key): \(pair.value)"
		}
		return
			"\(errorCode.rawValue): \(errorCode.message) at \(file):\(line)\nContext:\(yamlContext)"
	}

	public func toJSON() -> [String: Any] {
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

	public var description: String {
		self.localizedDescription
	}
}
