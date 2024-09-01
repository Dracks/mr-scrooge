import GraphQL

class Exception: Error {
	let errorCode: ErrorCode
	let context: [String: Any]
	let file: String
	let line: Int

	init(
		_ errorCode: ErrorCode, context: [String: Any] = [:], file: String = #file,
		line: Int = #line
	) {
		self.errorCode = errorCode
		self.context = context
		self.file = file
		self.line = line
	}

	var localizedDescription: String {
		return "\(errorCode.rawValue): \(errorCode.message) at \(file):\(line)"
	}

	func toJSON() -> [String: Any] {
		return [
			"errorCode": errorCode.rawValue,
			"message": errorCode.message,
			"context": context,
			"file": file,
			"line": line,
		]
	}
}
/*
extension GraphQLError {
    init( message: String,
         nodes: [Node] = [],
         path: IndexPath = [],
         originalError: Exception
    ) {
        super.init( message: originalError.localizedDescription,
                   nodes: nodes,
                   path: path,
                   originalError: originalError)
    }
}
*/
