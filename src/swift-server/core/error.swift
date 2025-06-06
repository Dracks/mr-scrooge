import swift_macros

enum ErrorCode: String, CaseIterable {
	case E10000, E10001, E10002, E10003, E10004, E10005, E10006, E10007, E10008, E10009
	case E10010, E10011, E10012, E10013, E10014, E10015, E10016, E10017, E10018, E10019
	case E10020, E10021, E10022, E10023, E10024, E10025, E10026, E10027, E10028, E10029
	case E10030, E10031
}

enum ApiError: String, StringEnumType {
	case API10000, API10001, API10002, API10003, API10004, API10005, API10006, API10007,
		API10008, API10009
	case API10010, API10011, API10012, API10013, API10014, API10015, API10016, API10017,
		API10018, API10019
	case API10020, API10021, API10022, API10023, API10024, API10025, API10026, API10027,
		API10028, API10029
	case API10030, API10031, API10032, API10033, API10034, API10035, API10036, API10037,
		API10038, API10039
	case API10040, API10041, API10042, API10043, API10044, API10045, API10046, API10047,
		API10048, API10049
	case API10050, API10051, API10052, API10053, API10054, API10055, API10056, API10057
}

final class ErrorInfo: Sendable {
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
	.E10012: ErrorInfo(message: "Csv is invalid and doesn't contain the original movement row"),
	.E10013: ErrorInfo(message: "Csv is invalid and doesn't contain the original value row"),
	.E10014: ErrorInfo(
		message: "Retrieving an String from a condition when it doesn't have it"),
	.E10015: ErrorInfo(
		message: "Retrieving the Double from a condition when it doesn't have it"),
	.E10016: ErrorInfo(
		message: "Rule parent cannot be found by the ID",
		additionalInfo: "this can be because the parent rule is with another groupOwnerId"
	),
	.E10017: ErrorInfo(message: "Import from file returned an ID that was not found in the DB"),
	.E10018: ErrorInfo(
		message:
			"Commerz Bank  Date Regex was invalid and was not able to be generated correctly",
		additionalInfo:
			"the regex is defined in the code, which means a big bug in the code"
	),
	.E10019: ErrorInfo(message: "Database url not supported"),
	.E10020: ErrorInfo(message: "Old database is not an sql"),
	.E10021: ErrorInfo(message: "Old tag Id was not found in the labels relations"),
	.E10022: ErrorInfo(
		message:
			"Transforming the old Filters, we found a value in the database that we don't know"
	),
	.E10023: ErrorInfo(
		message:
			"Transforming the filter conditional to a double, conditional was not a double"
	),
	.E10024: ErrorInfo(message: "Label not found for the old tagId"),
	.E10025: ErrorInfo(
		message:
			"Transforming the tags to rules, we get a tag with a parentId that we didn't found"
	),
	.E10026: ErrorInfo(
		message: "Transforming the group type from the old database, get an invalid case"),
	.E10027: ErrorInfo(
		message:
			"Transforming the graph kind from the old database, get get an invalid case"
	),
	.E10028: ErrorInfo(
		message:
			"Transforming the graph date range from the old database, get get an invalid case"
	),
	.E10029: ErrorInfo(message: "Retrieving the groups of a graph, we get multiple groups"),
	.E10030: ErrorInfo(
		message: "We didn't found the group related to a graph in the old database"),
	.E10031: ErrorInfo(
		message:
			"This app requires a SQL database (e.g., PostgreSQL, MySQL). Non-SQL databases are not supported."
	),
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
