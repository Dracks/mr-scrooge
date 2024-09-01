enum ErrorCode: String, CaseIterable {
	case E10000, E10001, E10002, E10003 /*, E10004, E10005, E10006, E10007*/
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
	.E10000: ErrorInfo(message: "Label not found in graph group for this group user id"),
	.E10001: ErrorInfo(
		message: "Graph doesn't contain any group",
		additionalInfo: "This can mean the database was corrupted"),
	.E10002: ErrorInfo(message: "Label not found in horizontal group for this group user id"),
	.E10003: ErrorInfo(message: "Invalid DB_URL format"),
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
