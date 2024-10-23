enum ErrorCode: String, CaseIterable {
	case E10000, E10001, E10002, E10003, E10004, E10005, E10006, E10007, E10008, E10009
	case E10010, E10011
}

enum ApiError: String {
	case API10000, API10001, API10002, API10003, API10004, API10005, API10006, API10007,
		API10008, API10009
	case API10010, API10011, API10012, API10013, API10014
}

class ErrorInfo {
	let message: String
	let additionalInfo: String?

	init(message: String, additionalInfo: String? = nil) {
		self.message = message
		self.additionalInfo = additionalInfo
	}
}

let errorDictionary: [ErrorCode: ErrorInfo] = [
	.E10000: ErrorInfo(message: "Parser not found"),
	.E10001: ErrorInfo(
		message: "Graph doesn't contain any group",
		additionalInfo: "This can mean the database was corrupted"),
	.E10002: ErrorInfo(
		message: "TransformHelper was created with missing fields in the mapping"),
	.E10003: ErrorInfo(message: "Invalid DB_URL format"),
	.E10004: ErrorInfo(message: "Invalid format converting data"),
	.E10005: ErrorInfo(message: "Parsing CaixaEnginyers we found an invalid row"),
	.E10006: ErrorInfo(message: "File cannot be found for caixa Enginyers"),
	.E10007: ErrorInfo(message: "File seems to be wrong"),
	.E10008: ErrorInfo(message: "Input Stream cannot be created for CSV parsing"),
	.E10009: ErrorInfo(message: "Csv row seems cannot be processed for N26"),
	.E10010: ErrorInfo(message: "Csv cannot be parsed"),
	.E10011: ErrorInfo(message: "Csv row seems cannot be processed for Commerz Bank En"),
]

extension ErrorCode {
	var info: ErrorInfo {
		return errorDictionary[self] ?? ErrorInfo(message: "Unknown error")
	}

	var message: String {
		return info.message
	}

	func stringify() -> String {
		return "\(self.rawValue): \(self.message)"
	}
}
